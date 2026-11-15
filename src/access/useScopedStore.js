import { useMemo } from "react";
import { useStore } from "../store";
import { useAccess } from "./AccessContext";
import { PERMISSIONS } from "./permissions";
import { recordAudit } from "./audit";

/**
 * Store wrapper that scopes reads and gates writes by permission + brand scope.
 * Demo: client-side only. Production must enforce the same rules in API/RLS.
 */
export function useScopedStore() {
  const store = useStore();
  const { principal, can, scopeRows, scopeOrders, allowsBrand, audit } = useAccess();

  const db = useMemo(() => {
    const raw = store.db;
    const brands = scopeRows(raw.brands, (b) => b.id);
    const brandNameById = Object.fromEntries(raw.brands.map((b) => [b.id, b.name]));
    const orders = scopeOrders(raw.orders, brandNameById);
    const orderIds = new Set(orders.map((o) => o.id));
    const brandIds = new Set(brands.map((b) => b.id));
    const brandNames = new Set(brands.map((b) => b.name));

    const products = (raw.products || []).filter((p) => {
      if (!p.brandId && !p.brand) return can(PERMISSIONS.CATALOG_VIEW); // shared central catalogue
      if (p.brandId) return allowsBrand(p.brandId);
      return brandNames.has(p.brand);
    });

    const tickets = (raw.tickets || []).filter((t) => {
      if (t.brandId) return allowsBrand(t.brandId);
      if (t.brand) return brandNames.has(t.brand);
      return true;
    });

    const payments = (raw.payments || []).filter((p) => !p.order || orderIds.has(p.order));
    const shipments = (raw.shipments || []).filter((s) => !s.order || orderIds.has(s.order));
    const settlements = (raw.settlements || []).filter((s) => {
      if (s.brandId) return allowsBrand(s.brandId);
      if (s.brand) return brandNames.has(s.brand);
      return true;
    });

    // Strip supplier cost / margin fields for principals without permission
    const stripFinance = !can(PERMISSIONS.SUPPLIER_COST_VIEW);
    const stripMargin = !can(PERMISSIONS.MARGIN_VIEW);
    const safeProducts = products.map((p) => {
      let next = { ...p };
      if (stripFinance) {
        delete next.supply;
        delete next.supplyPrice;
        delete next.cost;
        delete next.supplierCost;
      }
      if (stripMargin) {
        delete next.margin;
        delete next.grossMargin;
      }
      return next;
    });

    const safeOrders = orders.map((o) => {
      if (!stripFinance && !stripMargin) return o;
      const items = (o.items || []).map((line) => {
        const l = { ...line };
        if (stripFinance) {
          delete l.supply;
          delete l.cost;
        }
        return l;
      });
      const next = { ...o, items };
      if (stripFinance) {
        delete next.supply;
      }
      return next;
    });

    return {
      ...raw,
      brands,
      orders: safeOrders,
      products: safeProducts,
      tickets,
      payments,
      shipments,
      settlements,
      partners: (raw.partners || []).filter((p) => {
        if (p.brandId) return allowsBrand(p.brandId);
        // partners linked by name
        const linked = raw.brands.find((b) => b.partner === p.name);
        return linked ? brandIds.has(linked.id) : can(PERMISSIONS.BRANDS_VIEW);
      }),
      _unscoped: false,
    };
  }, [store.db, scopeRows, scopeOrders, allowsBrand, can]);

  const guardWrite = (permission, brandId, fn, auditAction) => {
    if (!can(permission, brandId ? { brandId } : {})) {
      store.toast("Access denied for this action.");
      if (principal) {
        recordAudit({
          actorId: principal.id,
          actorEmail: principal.email,
          action: auditAction || permission,
          result: "denied",
          brandId: brandId || null,
        });
      }
      return null;
    }
    const result = fn();
    if (principal && auditAction) {
      audit(auditAction, { brandId, result: "success" });
    }
    return result;
  };

  return {
    ...store,
    db,
    patch: (collection, id, changes, note) => {
      const row = store.db[collection]?.find((r) => r.id === id);
      const brandId = row?.brandId || (collection === "brands" ? id : null);
      const permission =
        collection === "orders"
          ? PERMISSIONS.ORDERS_EDIT
          : collection === "products"
            ? PERMISSIONS.CATALOG_EDIT
            : collection === "brands"
              ? PERMISSIONS.BRANDS_EDIT
              : PERMISSIONS.SETTINGS_MANAGE;
      return guardWrite(permission, brandId, () => store.patch(collection, id, changes, note), `${collection}.update`);
    },
    add: (collection, fields) => {
      const brandId = fields?.brandId || (collection === "brands" ? fields?.id : null);
      const permission =
        collection === "orders"
          ? PERMISSIONS.ORDERS_EDIT
          : collection === "products"
            ? PERMISSIONS.CATALOG_CREATE
            : collection === "brands"
              ? PERMISSIONS.BRANDS_CREATE
              : PERMISSIONS.SETTINGS_MANAGE;
      return guardWrite(permission, brandId, () => store.add(collection, fields), `${collection}.create`);
    },
    removeMany: (collection, ids, note) => {
      const permission =
        collection === "brands" ? PERMISSIONS.BRANDS_ARCHIVE : PERMISSIONS.SETTINGS_MANAGE;
      return guardWrite(permission, null, () => store.removeMany(collection, ids, note), `${collection}.remove`);
    },
    saveSettings: (settings, note) => {
      return guardWrite(PERMISSIONS.SETTINGS_MANAGE, null, () => store.saveSettings(settings, note), "settings.update");
    },
  };
}

import { useMemo } from "react";
import { StoreContext, useStore } from "../store";
import { useAccess } from "./AccessContext";
import { PERMISSIONS } from "./permissions";
import { recordAudit } from "./audit";

/**
 * Re-provides StoreContext with brand-scoped reads and permission-gated writes.
 * Must sit under both StoreProvider and AccessProvider (Super Admin tree only).
 */
export function AccessStoreBridge({ children }) {
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

    const stripFinance = !can(PERMISSIONS.SUPPLIER_COST_VIEW);
    const stripMargin = !can(PERMISSIONS.MARGIN_VIEW);

    const products = (raw.products || [])
      .filter((p) => {
        if (p.brandId) return allowsBrand(p.brandId);
        if (p.brand) return brandNames.has(p.brand);
        return true;
      })
      .map((p) => {
        const next = { ...p };
        if (stripFinance) {
          delete next.supply;
          delete next.supplyPrice;
          delete next.cost;
          delete next.supplierCost;
        }
        if (stripMargin) delete next.margin;
        return next;
      });

    const safeOrders = orders.map((o) => {
      if (!stripFinance) return o;
      return {
        ...o,
        supply: undefined,
        items: (o.items || []).map((line) => {
          const l = { ...line };
          delete l.supply;
          delete l.cost;
          return l;
        }),
      };
    });

    return {
      ...raw,
      brands,
      orders: safeOrders,
      products,
      tickets: (raw.tickets || []).filter((t) => {
        if (t.brandId) return allowsBrand(t.brandId);
        if (t.brand) return brandNames.has(t.brand);
        return true;
      }),
      payments: (raw.payments || []).filter((p) => !p.order || orderIds.has(p.order)),
      shipments: (raw.shipments || []).filter((s) => !s.order || orderIds.has(s.order)),
      settlements: (raw.settlements || []).filter((s) => {
        if (s.brandId) return allowsBrand(s.brandId);
        if (s.brand) return brandNames.has(s.brand);
        return true;
      }),
      partners: (raw.partners || []).filter((p) => {
        if (p.brandId) return allowsBrand(p.brandId);
        const linked = raw.brands.find((b) => b.partner === p.name);
        return linked ? brandIds.has(linked.id) : can(PERMISSIONS.BRANDS_VIEW);
      }),
    };
  }, [store.db, scopeRows, scopeOrders, allowsBrand, can]);

  const value = useMemo(() => {
    const deny = (action, brandId) => {
      store.toast("Access denied for this action.");
      if (principal) {
        recordAudit({
          actorId: principal.id,
          actorEmail: principal.email,
          action,
          result: "denied",
          brandId: brandId || null,
        });
      }
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
            : collection === "inventory"
              ? PERMISSIONS.INVENTORY_ADJUST
              : collection === "products"
                ? PERMISSIONS.CATALOG_EDIT
                : collection === "brands"
                  ? PERMISSIONS.BRANDS_EDIT
                  : PERMISSIONS.SETTINGS_MANAGE;
        if (!can(permission, brandId ? { brandId } : {})) {
          deny(`${collection}.update`, brandId);
          return;
        }
        audit(`${collection}.update`, { brandId, recordId: id });
        return store.patch(collection, id, changes, note);
      },
      add: (collection, fields) => {
        const brandId = fields?.brandId || null;
        const permission =
          collection === "brands"
            ? PERMISSIONS.BRANDS_CREATE
            : collection === "products"
              ? PERMISSIONS.CATALOG_CREATE
              : collection === "orders"
                ? PERMISSIONS.ORDERS_EDIT
                : PERMISSIONS.SETTINGS_MANAGE;
        if (!can(permission, brandId ? { brandId } : {})) {
          deny(`${collection}.create`, brandId);
          return null;
        }
        audit(`${collection}.create`, { brandId });
        return store.add(collection, fields);
      },
      removeMany: (collection, ids, note) => {
        if (!can(PERMISSIONS.BRANDS_ARCHIVE) && collection === "brands") {
          deny(`${collection}.remove`);
          return;
        }
        if (!can(PERMISSIONS.SETTINGS_MANAGE) && collection !== "brands") {
          deny(`${collection}.remove`);
          return;
        }
        return store.removeMany(collection, ids, note);
      },
      saveSettings: (settings, note) => {
        if (!can(PERMISSIONS.SETTINGS_MANAGE)) {
          deny("settings.update");
          return;
        }
        return store.saveSettings(settings, note);
      },
      bulkUpsert: (collection, rows, note) => {
        const permission =
          collection === "products" ? PERMISSIONS.CATALOG_EDIT : PERMISSIONS.SETTINGS_MANAGE;
        if (!can(permission)) {
          deny(`${collection}.bulk`);
          return { created: 0, updated: 0 };
        }
        return store.bulkUpsert(collection, rows, note);
      },
    };
  }, [store, db, can, principal, audit]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

import { createContext, useCallback, useContext, useMemo } from "react";
import { can as canAuth, assertCan, canSeeAllBrandTotals, hasPermission } from "./authorize";
import { pathAllowed } from "./routeMap";
import { filterRowsByScope, normalizeScope, scopeAllowsBrand } from "./scopes";
import { ROLE_LABELS, isBrandRole, isPlatformRole } from "./roles";
import { recordAudit } from "./audit";

const AccessContext = createContext(null);

/**
 * Provides authorization helpers for the signed-in principal.
 * Demo mode: client-side only. Production: mirror every check in API/RLS.
 */
export function AccessProvider({ principal, children }) {
  const scope = useMemo(() => normalizeScope(principal?.scope), [principal]);

  const can = useCallback(
    (permission, context = {}) => canAuth(principal, permission, context),
    [principal]
  );

  const canPath = useCallback(
    (pathname) => pathAllowed(principal, pathname, canAuth),
    [principal]
  );

  const allowsBrand = useCallback((brandId) => scopeAllowsBrand(scope, brandId), [scope]);

  const scopeRows = useCallback(
    (rows, getBrandId = (r) => r.brandId, getRecordId = (r) => r.id) =>
      filterRowsByScope(rows || [], scope, getBrandId, getRecordId),
    [scope]
  );

  /** Scope orders — prefer brandId, fall back to brand name only for legacy rows. */
  const scopeOrders = useCallback(
    (orders, brandNameById = {}) => {
      return filterRowsByScope(
        orders || [],
        scope,
        (o) => o.brandId || Object.entries(brandNameById).find(([, n]) => n === o.brand)?.[0],
        (o) => o.id
      );
    },
    [scope]
  );

  const audit = useCallback(
    (action, extra = {}) => {
      if (!principal) return;
      return recordAudit({
        actorId: principal.id,
        actorEmail: principal.email,
        action,
        brandId: principal.scope?.brandId || extra.brandId || null,
        ...extra,
      });
    },
    [principal]
  );

  const value = useMemo(() => {
    if (!principal) {
      return {
        principal: null,
        scope: normalizeScope({}),
        can: () => false,
        canPath: () => false,
        allowsBrand: () => false,
        scopeRows: () => [],
        scopeOrders: () => [],
        assertCan: () => {
          throw Object.assign(new Error("Access denied"), { code: "ACCESS_DENIED" });
        },
        canSeeAllBrandTotals: false,
        roleLabel: "",
        isPlatform: false,
        isBrand: false,
        audit: () => {},
        hasPermission: () => false,
      };
    }
    return {
      principal,
      scope,
      can,
      canPath,
      allowsBrand,
      scopeRows,
      scopeOrders,
      assertCan: (permission, context) => assertCan(principal, permission, context),
      canSeeAllBrandTotals: canSeeAllBrandTotals(principal),
      roleLabel: ROLE_LABELS[principal.role] || principal.role,
      isPlatform: isPlatformRole(principal.role),
      isBrand: isBrandRole(principal.role),
      audit,
      hasPermission: (p) => hasPermission(principal, p),
    };
  }, [principal, scope, can, canPath, allowsBrand, scopeRows, scopeOrders, audit]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) {
    throw new Error("useAccess must be used within AccessProvider");
  }
  return ctx;
}

/** Safe hook when provider may be absent (e.g. login page). */
export function useAccessOptional() {
  return useContext(AccessContext);
}

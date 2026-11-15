import { PERMISSIONS } from "./permissions";

/**
 * Route → required permission (any one of `anyOf`, or all of `allOf`).
 * Default-deny for unknown authenticated routes that declare a requirement.
 */
export const ROUTE_PERMISSIONS = {
  "/dashboard": { anyOf: [PERMISSIONS.DASHBOARD_VIEW] },
  "/brands": { anyOf: [PERMISSIONS.BRANDS_VIEW] },
  "/partners": { anyOf: [PERMISSIONS.BRANDS_VIEW] },
  "/websites": { anyOf: [PERMISSIONS.STOREFRONT_VIEW, PERMISSIONS.BRANDS_VIEW] },
  "/products": { anyOf: [PERMISSIONS.CATALOG_VIEW] },
  "/categories": { anyOf: [PERMISSIONS.CATALOG_VIEW] },
  "/suppliers": { anyOf: [PERMISSIONS.PURCHASING_MANAGE, PERMISSIONS.SUPPLIER_COST_VIEW] },
  "/purchasing": { anyOf: [PERMISSIONS.PURCHASING_MANAGE] },
  "/warehouses": { anyOf: [PERMISSIONS.INVENTORY_VIEW] },
  "/inventory": { anyOf: [PERMISSIONS.INVENTORY_VIEW] },
  "/orders": { anyOf: [PERMISSIONS.ORDERS_VIEW] },
  "/fulfillment": { anyOf: [PERMISSIONS.FULFILLMENT_MANAGE, PERMISSIONS.ORDERS_VIEW] },
  "/shipping": { anyOf: [PERMISSIONS.SHIPPING_MANAGE] },
  "/ndr": { anyOf: [PERMISSIONS.SHIPPING_MANAGE] },
  "/returns": { anyOf: [PERMISSIONS.RETURNS_MANAGE] },
  "/private-label": { anyOf: [PERMISSIONS.CATALOG_VIEW] },
  "/packaging": { anyOf: [PERMISSIONS.FULFILLMENT_MANAGE] },
  "/customers": { anyOf: [PERMISSIONS.CUSTOMERS_VIEW] },
  "/payments": { anyOf: [PERMISSIONS.FINANCE_VIEW] },
  "/settlements": { anyOf: [PERMISSIONS.SETTLEMENTS_VIEW] },
  "/finance": { anyOf: [PERMISSIONS.FINANCE_VIEW] },
  "/pricing": { anyOf: [PERMISSIONS.PRICES_MANAGE, PERMISSIONS.CATALOG_VIEW] },
  "/marketing": { anyOf: [PERMISSIONS.MARKETING_MANAGE] },
  "/academy": { anyOf: [PERMISSIONS.DASHBOARD_VIEW] },
  "/notifications": { anyOf: [PERMISSIONS.SETTINGS_VIEW] },
  "/approvals": { anyOf: [PERMISSIONS.ORDERS_APPROVE, PERMISSIONS.BRANDS_EDIT] },
  "/exceptions": { anyOf: [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.FULFILLMENT_MANAGE] },
  "/quality": { anyOf: [PERMISSIONS.INVENTORY_VIEW] },
  "/integrations": { anyOf: [PERMISSIONS.INTEGRATIONS_MANAGE] },
  "/reports": { anyOf: [PERMISSIONS.REPORTS_VIEW] },
  "/settings": { anyOf: [PERMISSIONS.SETTINGS_VIEW] },
  "/security": { anyOf: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.AUDIT_VIEW] },
  "/staff": { anyOf: [PERMISSIONS.USERS_VIEW] },
  "/roles": { anyOf: [PERMISSIONS.PERMISSIONS_ASSIGN, PERMISSIONS.USERS_VIEW] },
  "/access/staff": { anyOf: [PERMISSIONS.USERS_VIEW] },
  "/access/permissions": { anyOf: [PERMISSIONS.PERMISSIONS_ASSIGN, PERMISSIONS.USERS_VIEW] },
  "/access/audit": { anyOf: [PERMISSIONS.AUDIT_VIEW] },
  "/support": { anyOf: [PERMISSIONS.SUPPORT_VIEW] },
  "/support/brand": { anyOf: [PERMISSIONS.SUPPORT_VIEW] },
  "/support/customer": { anyOf: [PERMISSIONS.SUPPORT_VIEW] },
  "/support/agents": { anyOf: [PERMISSIONS.SUPPORT_MANAGE] },
  "/support/categories": { anyOf: [PERMISSIONS.SUPPORT_MANAGE] },
  // Brand workspace
  "/brand/dashboard": { anyOf: [PERMISSIONS.DASHBOARD_VIEW] },
  "/brand/dashboard/overview": { anyOf: [PERMISSIONS.DASHBOARD_VIEW] },
  "/brand/orders": { anyOf: [PERMISSIONS.ORDERS_VIEW] },
  "/brand/products": { anyOf: [PERMISSIONS.CATALOG_VIEW] },
  "/brand/website": { anyOf: [PERMISSIONS.STOREFRONT_VIEW] },
  "/brand/finance": { anyOf: [PERMISSIONS.FINANCE_VIEW, PERMISSIONS.BRAND_SALES_VIEW] },
  "/brand/reports": { anyOf: [PERMISSIONS.REPORTS_VIEW] },
  "/brand/customers": { anyOf: [PERMISSIONS.CUSTOMERS_VIEW] },
  "/brand/support": { anyOf: [PERMISSIONS.SUPPORT_VIEW] },
  "/brand/team": { anyOf: [PERMISSIONS.USERS_VIEW] },
  "/brand/settings": { anyOf: [PERMISSIONS.SETTINGS_VIEW] },
};

export function requiredPermissionForPath(pathname) {
  if (!pathname) return null;
  if (ROUTE_PERMISSIONS[pathname]) return ROUTE_PERMISSIONS[pathname];
  // Prefix match for nested routes
  const keys = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (pathname === key || pathname.startsWith(`${key}/`)) {
      return ROUTE_PERMISSIONS[key];
    }
  }
  return null;
}

export function pathAllowed(principal, pathname, canFn) {
  const req = requiredPermissionForPath(pathname);
  if (!req) return true; // undeclared paths: allow if authenticated (legacy modules)
  if (req.anyOf) return req.anyOf.some((p) => canFn(principal, p));
  if (req.allOf) return req.allOf.every((p) => canFn(principal, p));
  return false;
}

import { PERMISSIONS, ALL_PERMISSION_IDS } from "./permissions";
import { ROLES } from "./roles";
import { SCOPE_TYPES } from "./scopes";

/** Built-in permission sets for internal_staff / brand_staff assignment UI. */
export const PERMISSION_SETS = {
  orders: {
    id: "orders",
    label: "Orders",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_EDIT,
      PERMISSIONS.CUSTOMERS_VIEW,
    ],
  },
  catalog_inventory: {
    id: "catalog_inventory",
    label: "Catalog and inventory",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CATALOG_VIEW,
      PERMISSIONS.CATALOG_CREATE,
      PERMISSIONS.CATALOG_EDIT,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_ADJUST,
      PERMISSIONS.PRICES_MANAGE,
    ],
  },
  fulfillment_shipping: {
    id: "fulfillment_shipping",
    label: "Fulfilment and shipping",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.FULFILLMENT_MANAGE,
      PERMISSIONS.SHIPPING_MANAGE,
      PERMISSIONS.RETURNS_MANAGE,
      PERMISSIONS.INVENTORY_VIEW,
    ],
  },
  finance_settlements: {
    id: "finance_settlements",
    label: "Finance and settlements",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.FINANCE_VIEW,
      PERMISSIONS.FINANCE_EDIT,
      PERMISSIONS.SETTLEMENTS_VIEW,
      PERMISSIONS.SETTLEMENTS_MANAGE,
      PERMISSIONS.MARGIN_VIEW,
      PERMISSIONS.BRAND_SALES_VIEW,
      PERMISSIONS.REFUNDS_PROCESS,
      PERMISSIONS.EXPORT_DATA,
    ],
  },
  support_brand_success: {
    id: "support_brand_success",
    label: "Customer support and brand success",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.SUPPORT_VIEW,
      PERMISSIONS.SUPPORT_MANAGE,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.BRANDS_VIEW,
    ],
  },
  reports_readonly: {
    id: "reports_readonly",
    label: "Reports (read-only)",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.BRAND_SALES_VIEW,
    ],
  },
  brand_catalog: {
    id: "brand_catalog",
    label: "Brand catalogue & content",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CATALOG_VIEW,
      PERMISSIONS.CATALOG_EDIT,
      PERMISSIONS.STOREFRONT_VIEW,
      PERMISSIONS.STOREFRONT_PUBLISH,
      PERMISSIONS.INVENTORY_VIEW,
    ],
  },
  brand_orders: {
    id: "brand_orders",
    label: "Brand orders (view / limited edit)",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_EDIT,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.SUPPORT_VIEW,
    ],
  },
};

/**
 * Default grants by role.
 * platform_owner → all permissions + all brands
 * platform_admin → broad ops, no ownership transfer (enforced in authorize)
 * internal_staff → empty until sets assigned
 * brand_* → brand-scoped defaults; brand_staff empty until sets assigned
 */
export function defaultPermissionsForRole(role) {
  switch (role) {
    case ROLES.PLATFORM_OWNER:
      return [...ALL_PERMISSION_IDS];
    case ROLES.PLATFORM_ADMIN:
      // Broad ops; ownership transfer / last-owner rules enforced in authorize.js
      return [...ALL_PERMISSION_IDS];
    case ROLES.INTERNAL_STAFF:
      return []; // must be granted explicitly
    case ROLES.BRAND_OWNER:
      return [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.ORDERS_VIEW,
        PERMISSIONS.ORDERS_EDIT,
        PERMISSIONS.CATALOG_VIEW,
        PERMISSIONS.CATALOG_CREATE,
        PERMISSIONS.CATALOG_EDIT,
        PERMISSIONS.CATALOG_PUBLISH,
        PERMISSIONS.PRICES_MANAGE,
        PERMISSIONS.INVENTORY_VIEW,
        PERMISSIONS.STOREFRONT_VIEW,
        PERMISSIONS.STOREFRONT_PUBLISH,
        PERMISSIONS.MARKETING_MANAGE,
        PERMISSIONS.BRAND_SALES_VIEW,
        PERMISSIONS.FINANCE_VIEW,
        PERMISSIONS.SETTLEMENTS_VIEW,
        PERMISSIONS.CUSTOMERS_VIEW,
        PERMISSIONS.SUPPORT_VIEW,
        PERMISSIONS.SUPPORT_MANAGE,
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.EXPORT_DATA,
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_INVITE,
        PERMISSIONS.USERS_MANAGE,
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.SETTINGS_MANAGE,
        // Explicitly NOT: SUPPLIER_COST_VIEW, MARGIN_VIEW (platform margin), DASHBOARD_ALL_BRANDS,
        // BRANDS_CREATE, PERMISSIONS_ASSIGN (platform), SETTLEMENTS_MANAGE, REFUNDS_PROCESS
      ];
    case ROLES.BRAND_ADMIN:
      return [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.ORDERS_VIEW,
        PERMISSIONS.ORDERS_EDIT,
        PERMISSIONS.CATALOG_VIEW,
        PERMISSIONS.CATALOG_CREATE,
        PERMISSIONS.CATALOG_EDIT,
        PERMISSIONS.CATALOG_PUBLISH,
        PERMISSIONS.PRICES_MANAGE,
        PERMISSIONS.INVENTORY_VIEW,
        PERMISSIONS.STOREFRONT_VIEW,
        PERMISSIONS.STOREFRONT_PUBLISH,
        PERMISSIONS.MARKETING_MANAGE,
        PERMISSIONS.BRAND_SALES_VIEW,
        PERMISSIONS.FINANCE_VIEW,
        PERMISSIONS.CUSTOMERS_VIEW,
        PERMISSIONS.SUPPORT_VIEW,
        PERMISSIONS.SUPPORT_MANAGE,
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_INVITE,
        PERMISSIONS.USERS_MANAGE,
        PERMISSIONS.SETTINGS_VIEW,
      ];
    case ROLES.BRAND_STAFF:
      return []; // must be granted explicitly
    default:
      return [];
  }
}

export function defaultScopeForRole(role, brandId = null) {
  if (role === ROLES.PLATFORM_OWNER || role === ROLES.PLATFORM_ADMIN) {
    return { type: SCOPE_TYPES.ALL_BRANDS, brandIds: [], brandId: null, assignedRecordIds: [] };
  }
  if (role === ROLES.INTERNAL_STAFF) {
    // Never default to all brands
    return { type: SCOPE_TYPES.SELECTED_BRANDS, brandIds: [], brandId: null, assignedRecordIds: [] };
  }
  return {
    type: SCOPE_TYPES.BRAND,
    brandId: brandId || null,
    brandIds: brandId ? [brandId] : [],
    assignedRecordIds: [],
  };
}

export function mergePermissionSets(setIds = []) {
  const set = new Set();
  for (const id of setIds) {
    const def = PERMISSION_SETS[id];
    if (def) def.permissions.forEach((p) => set.add(p));
  }
  return [...set];
}

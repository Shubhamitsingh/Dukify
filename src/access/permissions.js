/**
 * Granular permissions. Default-deny: missing grant = deny.
 * Grouped for the permission editor UI.
 */

export const PERMISSIONS = {
  // Overview
  DASHBOARD_VIEW: "dashboard.view",
  DASHBOARD_ALL_BRANDS: "dashboard.all_brands",

  // Brands
  BRANDS_VIEW: "brands.view",
  BRANDS_CREATE: "brands.create",
  BRANDS_EDIT: "brands.edit",
  BRANDS_ARCHIVE: "brands.archive",

  // Catalogue / inventory
  CATALOG_VIEW: "catalog.view",
  CATALOG_CREATE: "catalog.create",
  CATALOG_EDIT: "catalog.edit",
  CATALOG_PUBLISH: "catalog.publish",
  PRICES_MANAGE: "prices.manage",
  SUPPLIER_COST_VIEW: "supplier_cost.view",
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_ADJUST: "inventory.adjust",
  PURCHASING_MANAGE: "purchasing.manage",

  // Orders / fulfilment
  ORDERS_VIEW: "orders.view",
  ORDERS_EDIT: "orders.edit",
  ORDERS_APPROVE: "orders.approve",
  FULFILLMENT_MANAGE: "fulfillment.manage",
  SHIPPING_MANAGE: "shipping.manage",
  RETURNS_MANAGE: "returns.manage",
  REFUNDS_PROCESS: "refunds.process",

  // Finance
  FINANCE_VIEW: "finance.view",
  FINANCE_EDIT: "finance.edit",
  SETTLEMENTS_VIEW: "settlements.view",
  SETTLEMENTS_MANAGE: "settlements.manage",
  MARGIN_VIEW: "margin.view",
  BRAND_SALES_VIEW: "brand_sales.view",

  // Customers / support
  CUSTOMERS_VIEW: "customers.view",
  SUPPORT_VIEW: "support.view",
  SUPPORT_MANAGE: "support.manage",

  // Reports / export
  REPORTS_VIEW: "reports.view",
  EXPORT_DATA: "export.data",

  // Storefront (brand)
  STOREFRONT_VIEW: "storefront.view",
  STOREFRONT_PUBLISH: "storefront.publish",
  MARKETING_MANAGE: "marketing.manage",

  // Users / access
  USERS_VIEW: "users.view",
  USERS_INVITE: "users.invite",
  USERS_MANAGE: "users.manage",
  PERMISSIONS_ASSIGN: "permissions.assign",
  AUDIT_VIEW: "audit.view",

  // Platform settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_MANAGE: "settings.manage",
  INTEGRATIONS_MANAGE: "integrations.manage",
};

export const PERMISSION_GROUPS = [
  {
    id: "overview",
    label: "Overview",
    permissions: [
      { id: PERMISSIONS.DASHBOARD_VIEW, label: "View dashboard" },
      { id: PERMISSIONS.DASHBOARD_ALL_BRANDS, label: "See all-brand totals" },
    ],
  },
  {
    id: "brands",
    label: "Brands",
    permissions: [
      { id: PERMISSIONS.BRANDS_VIEW, label: "View brands" },
      { id: PERMISSIONS.BRANDS_CREATE, label: "Create brands" },
      { id: PERMISSIONS.BRANDS_EDIT, label: "Edit brands" },
      { id: PERMISSIONS.BRANDS_ARCHIVE, label: "Archive brands" },
    ],
  },
  {
    id: "catalog",
    label: "Catalog & inventory",
    permissions: [
      { id: PERMISSIONS.CATALOG_VIEW, label: "View catalogue" },
      { id: PERMISSIONS.CATALOG_CREATE, label: "Create products" },
      { id: PERMISSIONS.CATALOG_EDIT, label: "Edit products" },
      { id: PERMISSIONS.CATALOG_PUBLISH, label: "Publish / hide products" },
      { id: PERMISSIONS.PRICES_MANAGE, label: "Manage prices" },
      { id: PERMISSIONS.SUPPLIER_COST_VIEW, label: "View supplier costs" },
      { id: PERMISSIONS.INVENTORY_VIEW, label: "View inventory" },
      { id: PERMISSIONS.INVENTORY_ADJUST, label: "Adjust inventory" },
      { id: PERMISSIONS.PURCHASING_MANAGE, label: "Manage purchasing" },
    ],
  },
  {
    id: "orders",
    label: "Orders & fulfilment",
    permissions: [
      { id: PERMISSIONS.ORDERS_VIEW, label: "View orders" },
      { id: PERMISSIONS.ORDERS_EDIT, label: "Edit orders" },
      { id: PERMISSIONS.ORDERS_APPROVE, label: "Approve order actions" },
      { id: PERMISSIONS.FULFILLMENT_MANAGE, label: "Manage fulfilment" },
      { id: PERMISSIONS.SHIPPING_MANAGE, label: "Manage shipping / NDR" },
      { id: PERMISSIONS.RETURNS_MANAGE, label: "Manage returns" },
      { id: PERMISSIONS.REFUNDS_PROCESS, label: "Process refunds" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    permissions: [
      { id: PERMISSIONS.FINANCE_VIEW, label: "View finance" },
      { id: PERMISSIONS.FINANCE_EDIT, label: "Edit finance ledger" },
      { id: PERMISSIONS.SETTLEMENTS_VIEW, label: "View settlements" },
      { id: PERMISSIONS.SETTLEMENTS_MANAGE, label: "Manage settlements" },
      { id: PERMISSIONS.MARGIN_VIEW, label: "View margins / costs" },
      { id: PERMISSIONS.BRAND_SALES_VIEW, label: "View brand sales" },
    ],
  },
  {
    id: "support",
    label: "Customers & support",
    permissions: [
      { id: PERMISSIONS.CUSTOMERS_VIEW, label: "View customers" },
      { id: PERMISSIONS.SUPPORT_VIEW, label: "View support tickets" },
      { id: PERMISSIONS.SUPPORT_MANAGE, label: "Manage support" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    permissions: [
      { id: PERMISSIONS.REPORTS_VIEW, label: "View reports" },
      { id: PERMISSIONS.EXPORT_DATA, label: "Export data" },
    ],
  },
  {
    id: "storefront",
    label: "Storefront & marketing",
    permissions: [
      { id: PERMISSIONS.STOREFRONT_VIEW, label: "View storefront" },
      { id: PERMISSIONS.STOREFRONT_PUBLISH, label: "Publish storefront" },
      { id: PERMISSIONS.MARKETING_MANAGE, label: "Manage marketing" },
    ],
  },
  {
    id: "users",
    label: "Users & access",
    permissions: [
      { id: PERMISSIONS.USERS_VIEW, label: "View users" },
      { id: PERMISSIONS.USERS_INVITE, label: "Invite users" },
      { id: PERMISSIONS.USERS_MANAGE, label: "Manage / revoke users" },
      { id: PERMISSIONS.PERMISSIONS_ASSIGN, label: "Assign permissions" },
      { id: PERMISSIONS.AUDIT_VIEW, label: "View audit log" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    permissions: [
      { id: PERMISSIONS.SETTINGS_VIEW, label: "View settings" },
      { id: PERMISSIONS.SETTINGS_MANAGE, label: "Manage settings" },
      { id: PERMISSIONS.INTEGRATIONS_MANAGE, label: "Manage integrations" },
    ],
  },
];

export const ALL_PERMISSION_IDS = Object.values(PERMISSIONS);

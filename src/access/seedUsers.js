import { ROLES } from "./roles";
import { SCOPE_TYPES } from "./scopes";
import { defaultPermissionsForRole, mergePermissionSets } from "./templates";

/**
 * Demo directory users — used only when VITE_DEMO_MODE=true (or DEV).
 * Passwords are demo placeholders, not production credentials.
 * Production must use Supabase Auth + pahachan_* tables.
 */
export const DEMO_USERS = [
  {
    id: "USR-PO-001",
    email: "owner@pahachan.demo",
    name: "Platform Owner",
    password: "OwnerDemo!2026",
    role: ROLES.PLATFORM_OWNER,
    permissions: defaultPermissionsForRole(ROLES.PLATFORM_OWNER),
    scope: { type: SCOPE_TYPES.ALL_BRANDS, brandIds: [], brandId: null, assignedRecordIds: [] },
    status: "active",
    invitedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "USR-PA-001",
    email: "admin@pahachan.demo",
    name: "Platform Admin",
    password: "AdminDemo!2026",
    role: ROLES.PLATFORM_ADMIN,
    permissions: defaultPermissionsForRole(ROLES.PLATFORM_ADMIN),
    scope: { type: SCOPE_TYPES.ALL_BRANDS, brandIds: [], brandId: null, assignedRecordIds: [] },
    status: "active",
    invitedAt: "2026-01-02T00:00:00Z",
  },
  {
    id: "USR-IS-ORD",
    email: "orders.staff@pahachan.demo",
    name: "Orders Staff",
    password: "StaffDemo!2026",
    role: ROLES.INTERNAL_STAFF,
    permissions: mergePermissionSets(["orders", "fulfillment_shipping"]),
    permissionSets: ["orders", "fulfillment_shipping"],
    scope: {
      type: SCOPE_TYPES.SELECTED_BRANDS,
      brandIds: ["BRD-1001", "BRD-1002"],
      brandId: null,
      assignedRecordIds: [],
    },
    status: "active",
    invitedAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "USR-IS-FIN",
    email: "finance.staff@pahachan.demo",
    name: "Finance Staff",
    password: "FinanceDemo!2026",
    role: ROLES.INTERNAL_STAFF,
    permissions: mergePermissionSets(["finance_settlements", "reports_readonly"]),
    permissionSets: ["finance_settlements", "reports_readonly"],
    scope: { type: SCOPE_TYPES.ALL_BRANDS, brandIds: [], brandId: null, assignedRecordIds: [] },
    status: "active",
    invitedAt: "2026-02-02T00:00:00Z",
  },
  {
    id: "USR-IS-NONE",
    email: "new.staff@pahachan.demo",
    name: "Unscoped Staff",
    password: "EmptyDemo!2026",
    role: ROLES.INTERNAL_STAFF,
    permissions: [],
    permissionSets: [],
    scope: { type: SCOPE_TYPES.SELECTED_BRANDS, brandIds: [], brandId: null, assignedRecordIds: [] },
    status: "active",
    invitedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "USR-BO-AISA",
    email: "owner@aisa.demo",
    name: "Aisa Brand Owner",
    password: "BrandOwner!2026",
    role: ROLES.BRAND_OWNER,
    permissions: defaultPermissionsForRole(ROLES.BRAND_OWNER),
    // Partner workspace seed id (brand-k). SA catalogue uses BRD-* until schema is unified.
    scope: {
      type: SCOPE_TYPES.BRAND,
      brandId: "brand-k",
      brandIds: ["brand-k", "BRD-1001"],
      assignedRecordIds: [],
    },
    status: "active",
    invitedAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "USR-BA-AISA",
    email: "admin@aisa.demo",
    name: "Aisa Brand Admin",
    password: "BrandAdmin!2026",
    role: ROLES.BRAND_ADMIN,
    permissions: defaultPermissionsForRole(ROLES.BRAND_ADMIN),
    scope: {
      type: SCOPE_TYPES.BRAND,
      brandId: "brand-k",
      brandIds: ["brand-k", "BRD-1001"],
      assignedRecordIds: [],
    },
    status: "active",
    invitedAt: "2026-01-11T00:00:00Z",
  },
  {
    id: "USR-BS-AISA",
    email: "staff@aisa.demo",
    name: "Aisa Brand Staff",
    password: "BrandStaff!2026",
    role: ROLES.BRAND_STAFF,
    permissions: mergePermissionSets(["brand_orders"]),
    permissionSets: ["brand_orders"],
    scope: {
      type: SCOPE_TYPES.BRAND,
      brandId: "brand-k",
      brandIds: ["brand-k", "BRD-1001"],
      assignedRecordIds: [],
    },
    status: "active",
    invitedAt: "2026-01-12T00:00:00Z",
  },
];

export function publicUserView(user) {
  if (!user) return null;
  const { password: _pw, ...rest } = user;
  return rest;
}

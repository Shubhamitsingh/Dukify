import { PERMISSIONS } from "./permissions";
import { ROLES, isPlatformOwner, brandInviteableRoles, platformInviteableRoles } from "./roles";
import { normalizeScope, scopeAllowsBrand, scopeAllowsRecord } from "./scopes";

/**
 * Server-style authorization helpers.
 * In demo mode these run in the browser as the single client gate —
 * they are NOT production security. Production must re-check in API/RLS.
 */

export function hasPermission(principal, permission) {
  if (!principal || principal.status === "revoked" || principal.status === "disabled") return false;
  if (principal.role === ROLES.PLATFORM_OWNER) return true;
  const grants = principal.permissions || [];
  return grants.includes(permission);
}

export function can(principal, permission, context = {}) {
  if (!hasPermission(principal, permission)) return false;

  const scope = normalizeScope(principal.scope);
  const { brandId, recordId, recordBrandId } = context;

  if (recordId != null && scope.type === "assigned_records") {
    return scopeAllowsRecord(scope, recordId, recordBrandId || brandId);
  }
  if (brandId != null) {
    return scopeAllowsBrand(scope, brandId);
  }
  return true;
}

export function assertCan(principal, permission, context = {}) {
  if (!can(principal, permission, context)) {
    const err = new Error("Access denied");
    err.code = "ACCESS_DENIED";
    err.permission = permission;
    throw err;
  }
  return true;
}

/** Prevent invalid grants (e.g. brand admin granting platform roles). */
export function canAssignRole(actor, targetRole) {
  if (!actor) return false;
  if (actor.role === ROLES.PLATFORM_OWNER) {
    return Object.values(ROLES).includes(targetRole);
  }
  if (actor.role === ROLES.PLATFORM_ADMIN) {
    // Cannot assign platform_owner
    return platformInviteableRoles(ROLES.PLATFORM_ADMIN).includes(targetRole) ||
      [ROLES.BRAND_OWNER, ROLES.BRAND_ADMIN, ROLES.BRAND_STAFF].includes(targetRole);
  }
  if (actor.role === ROLES.BRAND_OWNER || actor.role === ROLES.BRAND_ADMIN) {
    return brandInviteableRoles(actor.role).includes(targetRole);
  }
  return false;
}

export function canGrantPermission(actor, permissionId) {
  if (!hasPermission(actor, PERMISSIONS.PERMISSIONS_ASSIGN) && actor.role !== ROLES.PLATFORM_OWNER) {
    return false;
  }
  // Platform admin cannot grant ownership / self-escalation of assign right beyond what they have
  if (actor.role === ROLES.PLATFORM_ADMIN) {
    // Cannot grant permissions they themselves lack (except owner-only implicit)
    if (!hasPermission(actor, permissionId) && permissionId !== PERMISSIONS.PERMISSIONS_ASSIGN) {
      // Admins may grant ops they have; they may also grant PERMISSIONS_ASSIGN to staff carefully
      if (!hasPermission(actor, permissionId)) return false;
    }
  }
  if (actor.role === ROLES.BRAND_OWNER || actor.role === ROLES.BRAND_ADMIN) {
    // Brand users cannot grant platform-only permissions
    const platformOnly = [
      PERMISSIONS.DASHBOARD_ALL_BRANDS,
      PERMISSIONS.BRANDS_CREATE,
      PERMISSIONS.BRANDS_ARCHIVE,
      PERMISSIONS.SUPPLIER_COST_VIEW,
      PERMISSIONS.PURCHASING_MANAGE,
      PERMISSIONS.SETTLEMENTS_MANAGE,
      PERMISSIONS.MARGIN_VIEW,
      PERMISSIONS.INTEGRATIONS_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE, // brand may have brand settings, but not platform settings manage via this check in UI
    ];
    if (platformOnly.includes(permissionId)) return false;
    // Cannot grant what they don't have
    if (!hasPermission(actor, permissionId) && actor.role !== ROLES.BRAND_OWNER) return false;
  }
  return true;
}

/** Last platform owner protection. */
export function canDemoteOrRemoveUser(actor, target, allUsers) {
  if (!actor || !target) return false;
  if (target.role === ROLES.PLATFORM_OWNER) {
    if (actor.role !== ROLES.PLATFORM_OWNER) return false;
    const owners = (allUsers || []).filter(
      (u) => u.role === ROLES.PLATFORM_OWNER && u.status !== "revoked" && u.status !== "disabled"
    );
    if (owners.length <= 1) return false;
  }
  // Platform admin cannot remove/demote owner
  if (target.role === ROLES.PLATFORM_OWNER && actor.role === ROLES.PLATFORM_ADMIN) return false;
  // Cannot escalate self
  if (actor.id === target.id && actor.role !== ROLES.PLATFORM_OWNER) {
    // self-revoke of extra perms is ok; demoting own role is not via this helper for staff
  }
  return hasPermission(actor, PERMISSIONS.USERS_MANAGE) || isPlatformOwner(actor.role);
}

export function canSeeAllBrandTotals(principal) {
  return can(principal, PERMISSIONS.DASHBOARD_ALL_BRANDS);
}

export function canViewSupplierCost(principal) {
  return can(principal, PERMISSIONS.SUPPLIER_COST_VIEW);
}

export function canViewMargin(principal) {
  return can(principal, PERMISSIONS.MARGIN_VIEW);
}

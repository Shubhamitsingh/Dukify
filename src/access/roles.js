/** Exactly six built-in role templates — do not add more without product review. */

export const ROLES = {
  PLATFORM_OWNER: "platform_owner",
  PLATFORM_ADMIN: "platform_admin",
  INTERNAL_STAFF: "internal_staff",
  BRAND_OWNER: "brand_owner",
  BRAND_ADMIN: "brand_admin",
  BRAND_STAFF: "brand_staff",
};

export const ROLE_LABELS = {
  [ROLES.PLATFORM_OWNER]: "Platform Owner",
  [ROLES.PLATFORM_ADMIN]: "Platform Admin",
  [ROLES.INTERNAL_STAFF]: "Internal Staff",
  [ROLES.BRAND_OWNER]: "Brand Owner",
  [ROLES.BRAND_ADMIN]: "Brand Admin",
  [ROLES.BRAND_STAFF]: "Brand Staff",
};

export const PLATFORM_ROLES = [ROLES.PLATFORM_OWNER, ROLES.PLATFORM_ADMIN, ROLES.INTERNAL_STAFF];
export const BRAND_ROLES = [ROLES.BRAND_OWNER, ROLES.BRAND_ADMIN, ROLES.BRAND_STAFF];

export function isPlatformRole(role) {
  return PLATFORM_ROLES.includes(role);
}

export function isBrandRole(role) {
  return BRAND_ROLES.includes(role);
}

export function isPlatformOwner(role) {
  return role === ROLES.PLATFORM_OWNER;
}

/** Roles a Platform Owner/Admin may invite for platform staff. */
export function platformInviteableRoles(actorRole) {
  if (actorRole === ROLES.PLATFORM_OWNER) {
    return [ROLES.PLATFORM_ADMIN, ROLES.INTERNAL_STAFF];
  }
  if (actorRole === ROLES.PLATFORM_ADMIN) {
    return [ROLES.INTERNAL_STAFF];
  }
  return [];
}

/** Roles a brand user may invite within their brand. */
export function brandInviteableRoles(actorRole) {
  if (actorRole === ROLES.BRAND_OWNER) {
    return [ROLES.BRAND_ADMIN, ROLES.BRAND_STAFF];
  }
  if (actorRole === ROLES.BRAND_ADMIN) {
    return [ROLES.BRAND_STAFF];
  }
  return [];
}

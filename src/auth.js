import {
  ROLES,
  ROLE_LABELS,
  isBrandRole,
  isPlatformRole,
  authenticateDemo,
  isDemoMode,
} from "./access";

export { ROLES, ROLE_LABELS, isBrandRole, isPlatformRole };

/** @deprecated Use ROLES.PLATFORM_OWNER — kept for any leftover imports during migration. */
export const LEGACY_ROLES = {
  SUPER_ADMIN: "super_admin",
  BRAND_ADMIN: "brand_admin",
  BRAND_STAFF: "brand_staff",
};

export const SESSION_KEY = "pahachan-unified-session";
export const THEME_KEY = "pahachan-theme";

const VALID_ROLES = new Set(Object.values(ROLES));

export function homeForRole(role) {
  if (isBrandRole(role)) return "/brand/dashboard/overview";
  return "/dashboard";
}

/** Brand workspace is `/brand` or `/brand/...` — must not match Admin `/brands`. */
export function isBrandWorkspacePath(pathname) {
  const path = pathname || "/";
  return path === "/brand" || path.startsWith("/brand/");
}

export function canAccessPath(session, pathname) {
  if (!session) return false;
  const path = pathname || "/";
  if (isBrandRole(session.role)) {
    return path === "/login" || isBrandWorkspacePath(path);
  }
  if (isPlatformRole(session.role)) {
    return !isBrandWorkspacePath(path);
  }
  return false;
}

function normalizeSession(parsed) {
  if (!parsed?.email || !parsed?.role) return null;
  // Invalidate legacy three-role sessions
  if (!VALID_ROLES.has(parsed.role)) return null;
  if (parsed.status === "revoked" || parsed.status === "disabled") return null;
  return {
    id: parsed.id,
    email: parsed.email,
    name: parsed.name,
    role: parsed.role,
    permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
    permissionSets: Array.isArray(parsed.permissionSets) ? parsed.permissionSets : [],
    scope: parsed.scope || {
      type: isBrandRole(parsed.role) ? "brand" : "selected_brands",
      brandId: parsed.brandId || null,
      brandIds: parsed.brandId ? [parsed.brandId] : [],
      assignedRecordIds: [],
    },
    brandId: parsed.scope?.brandId || parsed.brandId || null,
    status: parsed.status || "active",
  };
}

export function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return normalizeSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("pahachan-session");
  localStorage.removeItem("pahachan-partner-session");
}

/**
 * Authentication entry.
 * Demo: directory users (six roles). Production: Supabase Auth — see docs/ACCESS_SETUP.md.
 * Browser storage is NOT a security boundary.
 */
export function authenticate(email, password) {
  const mail = String(email || "").trim().toLowerCase();
  const pass = String(password || "");
  if (!mail || !pass) return { error: "Enter email and password." };

  if (!isDemoMode()) {
    return {
      error:
        "Demo login is disabled. Set VITE_DEMO_MODE=true for local demos, or configure Supabase Auth (docs/ACCESS_SETUP.md).",
    };
  }

  const result = authenticateDemo(mail, pass);
  if (!result.ok) return { error: result.error };

  const user = result.user;
  return {
    session: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
      permissionSets: user.permissionSets || [],
      scope: user.scope,
      brandId: user.scope?.brandId || null,
      status: user.status,
    },
  };
}

/** Demo tenant switcher must not unlock production isolation. */
export function canSwitchDemoTenant(session) {
  return Boolean(session && isBrandRole(session.role) && isDemoMode() && import.meta.env.VITE_ALLOW_DEMO_TENANT_SWITCH === "true");
}

export function isAssignedBrand(session, brandId) {
  if (!session || !brandId) return false;
  const ids = session.scope?.brandIds || (session.brandId ? [session.brandId] : []);
  if (session.scope?.type === "all_brands") return true;
  return ids.includes(brandId);
}

/** @deprecated Prefer AccessProvider — kept for transitional imports. */
export function isSuperAdminRole(role) {
  return isPlatformRole(role);
}

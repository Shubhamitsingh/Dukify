import { brands } from "./brand/data/seed";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  BRAND_ADMIN: "brand_admin",
  BRAND_STAFF: "brand_staff",
};

export const SESSION_KEY = "pahachan-unified-session";
export const THEME_KEY = "pahachan-theme";

/** Demo Super Admin accounts (mock only). */
export const SUPER_ADMIN_USERS = [
  { email: "owner@pahachan.example", password: "admin1234", name: "Platform owner" },
  { email: "admin@pahachan.example", password: "admin1234", name: "Platform admin" },
];

const DEFAULT_BRAND_PASSWORD = "demo1234";

function norm(email) {
  return String(email || "").trim().toLowerCase();
}

export function isSuperAdminRole(role) {
  return role === ROLES.SUPER_ADMIN;
}

export function isBrandRole(role) {
  return role === ROLES.BRAND_ADMIN || role === ROLES.BRAND_STAFF;
}

export function homeForRole(role) {
  if (isBrandRole(role)) return "/brand/dashboard/overview";
  return "/dashboard";
}

export function canAccessPath(session, pathname) {
  if (!session) return false;
  const path = pathname || "/";
  if (isBrandRole(session.role)) {
    return path === "/login" || path.startsWith("/brand");
  }
  if (isSuperAdminRole(session.role)) {
    return !path.startsWith("/brand");
  }
  return false;
}

export function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.email || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  // Clear legacy keys so old sessions do not confuse demos
  localStorage.removeItem("pahachan-session");
  localStorage.removeItem("pahachan-partner-session");
}

function findBrandStaff(email) {
  const needle = norm(email);
  for (const brand of brands) {
    const team = brand.team || [];
    const member = team.find((row) => norm(row.email) === needle);
    if (member) {
      return { brand, member };
    }
  }
  return null;
}

/**
 * Mock authentication — development only.
 * Returns { session } or { error }.
 */
export function authenticate(email, password) {
  const mail = norm(email);
  const pass = String(password || "");

  if (!mail || !pass) {
    return { error: "Enter email and password." };
  }

  const superUser = SUPER_ADMIN_USERS.find((user) => norm(user.email) === mail);
  if (superUser) {
    if (pass !== superUser.password) {
      return { error: "Wrong password for Super Admin demo account." };
    }
    return {
      session: {
        email: superUser.email,
        role: ROLES.SUPER_ADMIN,
        name: superUser.name,
      },
    };
  }

  const brand = brands.find((item) => norm(item.email) === mail);
  if (brand) {
    if (pass !== DEFAULT_BRAND_PASSWORD) {
      return { error: "Wrong password. Brand demo password is demo1234." };
    }
    return {
      session: {
        email: brand.email,
        role: ROLES.BRAND_ADMIN,
        brandId: brand.id,
        name: brand.name,
      },
    };
  }

  const staff = findBrandStaff(mail);
  if (staff) {
    if (pass !== DEFAULT_BRAND_PASSWORD) {
      return { error: "Wrong password. Staff demo password is demo1234." };
    }
    return {
      session: {
        email: staff.member.email,
        role: ROLES.BRAND_STAFF,
        brandId: staff.brand.id,
        name: staff.member.name,
        staffRole: staff.member.role,
      },
    };
  }

  // Preserve previous Super Admin demo habit: unknown emails still open SA panel.
  return {
    session: {
      email: String(email).trim(),
      role: ROLES.SUPER_ADMIN,
      name: "Platform owner",
    },
  };
}

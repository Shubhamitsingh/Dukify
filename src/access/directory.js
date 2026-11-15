import { DEMO_USERS, publicUserView } from "./seedUsers";
import { recordAudit } from "./audit";
import { canAssignRole, canDemoteOrRemoveUser, canGrantPermission, hasPermission } from "./authorize";
import { PERMISSIONS } from "./permissions";
import { defaultPermissionsForRole, defaultScopeForRole, mergePermissionSets } from "./templates";
import { normalizeScope } from "./scopes";
import { ROLES } from "./roles";

const DIR_KEY = "pahachan-access-directory";

function isDemoMode() {
  return import.meta.env.VITE_DEMO_MODE === "true" || import.meta.env.DEV;
}

function seedDirectory() {
  return DEMO_USERS.map((u) => ({ ...u, scope: normalizeScope(u.scope) }));
}

export function loadDirectory() {
  try {
    const raw = localStorage.getItem(DIR_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const seeded = seedDirectory();
  localStorage.setItem(DIR_KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveDirectory(users) {
  localStorage.setItem(DIR_KEY, JSON.stringify(users));
}

export function listUsersPublic() {
  return loadDirectory().map(publicUserView);
}

export function findUserByEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  return loadDirectory().find((u) => u.email.toLowerCase() === e) || null;
}

export function authenticateDemo(email, password) {
  if (!isDemoMode()) {
    return { ok: false, error: "Demo login disabled. Configure Supabase Auth (see docs/ACCESS_SETUP.md)." };
  }
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    recordAudit({
      actorId: null,
      actorEmail: email,
      action: "auth.login_failed",
      result: "denied",
    });
    return { ok: false, error: "Invalid email or password." };
  }
  if (user.status === "revoked" || user.status === "disabled") {
    return { ok: false, error: "This account has been revoked." };
  }
  recordAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "auth.login",
    result: "success",
    brandId: user.scope?.brandId || null,
  });
  return { ok: true, user: publicUserView(user) };
}

export function inviteUser(actor, payload) {
  if (!hasPermission(actor, PERMISSIONS.USERS_INVITE) && actor.role !== ROLES.PLATFORM_OWNER) {
    recordAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "users.invite",
      result: "denied",
      meta: { reason: "missing_permission" },
    });
    return { ok: false, error: "Access denied." };
  }
  if (!canAssignRole(actor, payload.role)) {
    recordAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "users.invite",
      result: "denied",
      meta: { reason: "invalid_role_grant", role: payload.role },
    });
    return { ok: false, error: "You cannot assign that role." };
  }

  // Brand actors may only invite into their own brand
  let scope = normalizeScope(payload.scope || defaultScopeForRole(payload.role, payload.brandId));
  if (actor.role === ROLES.BRAND_OWNER || actor.role === ROLES.BRAND_ADMIN) {
    const own = actor.scope?.brandId;
    if (!own || (scope.brandId && scope.brandId !== own)) {
      return { ok: false, error: "Brand users may only invite within their own brand." };
    }
    scope = { type: "brand", brandId: own, brandIds: [own], assignedRecordIds: [] };
  }

  let permissions = payload.permissions;
  if (!permissions) {
    if (payload.permissionSets?.length) permissions = mergePermissionSets(payload.permissionSets);
    else permissions = defaultPermissionsForRole(payload.role);
  }
  // Filter grants actor cannot give
  permissions = permissions.filter((p) => canGrantPermission(actor, p) || actor.role === ROLES.PLATFORM_OWNER);

  if (payload.role === ROLES.INTERNAL_STAFF && (!scope.brandIds?.length && scope.type !== "all_brands" && scope.type !== "assigned_records")) {
    // Allow invite with empty selected brands — UI will show "no assigned brands"
  }

  const users = loadDirectory();
  if (users.some((u) => u.email.toLowerCase() === String(payload.email).toLowerCase())) {
    return { ok: false, error: "A user with this email already exists." };
  }

  const user = {
    id: `USR-${Date.now().toString(36).toUpperCase()}`,
    email: String(payload.email).trim().toLowerCase(),
    name: payload.name || payload.email,
    password: payload.tempPassword || `Temp!${Math.random().toString(36).slice(2, 10)}`,
    role: payload.role,
    permissions,
    permissionSets: payload.permissionSets || [],
    scope,
    status: "invited",
    invitedAt: new Date().toISOString(),
    invitedBy: actor.id,
  };
  users.push(user);
  saveDirectory(users);
  recordAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "users.invite",
    result: "success",
    brandId: scope.brandId,
    recordType: "user",
    recordId: user.id,
    meta: { role: user.role, email: user.email },
  });
  return { ok: true, user: publicUserView(user), tempPassword: isDemoMode() ? user.password : undefined };
}

export function updateUserAccess(actor, userId, patch) {
  const users = loadDirectory();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return { ok: false, error: "User not found." };
  const target = users[idx];

  if (patch.role && patch.role !== target.role) {
    if (!canAssignRole(actor, patch.role) || !canDemoteOrRemoveUser(actor, target, users)) {
      recordAudit({
        actorId: actor.id,
        actorEmail: actor.email,
        action: "users.role_change",
        result: "denied",
        recordId: userId,
      });
      return { ok: false, error: "Cannot change this user’s role." };
    }
  }

  if (patch.permissions) {
    const filtered = patch.permissions.filter(
      (p) => canGrantPermission(actor, p) || actor.role === ROLES.PLATFORM_OWNER
    );
    // Prevent self-escalation for non-owners
    if (actor.id === target.id && actor.role !== ROLES.PLATFORM_OWNER) {
      const extra = filtered.filter((p) => !(actor.permissions || []).includes(p));
      if (extra.length) return { ok: false, error: "You cannot grant yourself additional permissions." };
    }
    patch = { ...patch, permissions: filtered };
  }

  if (patch.status === "revoked" || patch.status === "disabled") {
    if (!canDemoteOrRemoveUser(actor, target, users)) {
      return { ok: false, error: "Cannot revoke this user (last Platform Owner protection)." };
    }
  }

  users[idx] = {
    ...target,
    ...patch,
    scope: patch.scope ? normalizeScope(patch.scope) : target.scope,
  };
  saveDirectory(users);
  recordAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "users.access_update",
    result: "success",
    brandId: users[idx].scope?.brandId || null,
    recordType: "user",
    recordId: userId,
    meta: { fields: Object.keys(patch) },
  });
  return { ok: true, user: publicUserView(users[idx]) };
}

export function revokeUser(actor, userId) {
  return updateUserAccess(actor, userId, { status: "revoked", permissions: [] });
}

export function getUserById(id) {
  return publicUserView(loadDirectory().find((u) => u.id === id));
}

export { isDemoMode };

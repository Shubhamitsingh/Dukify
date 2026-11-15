import { useMemo, useState } from "react";
import { UserPlus, Ban, Shield } from "lucide-react";
import { PageHead, SoftButton, Status, Surface, ModalShell } from "../../ui";
import { useAccess } from "../AccessContext";
import { listUsersPublic, inviteUser, revokeUser } from "../directory";
import { ROLE_LABELS, ROLES, platformInviteableRoles, brandInviteableRoles, isBrandRole } from "../roles";
import { PERMISSION_SETS, mergePermissionSets, defaultScopeForRole } from "../templates";
import { SCOPE_TYPES, SCOPE_LABELS } from "../scopes";
import { PERMISSIONS } from "../permissions";
import { useStore } from "../../store";

function scopeSummary(scope) {
  if (!scope) return "—";
  if (scope.type === SCOPE_TYPES.ALL_BRANDS) return SCOPE_LABELS[SCOPE_TYPES.ALL_BRANDS];
  if (scope.type === SCOPE_TYPES.ASSIGNED_RECORDS) {
    return `${SCOPE_LABELS[SCOPE_TYPES.ASSIGNED_RECORDS]} (${scope.assignedRecordIds?.length || 0})`;
  }
  if (scope.type === SCOPE_TYPES.BRAND) return `Brand ${scope.brandId || "—"}`;
  const n = scope.brandIds?.length || 0;
  return n ? `${n} brand(s): ${scope.brandIds.join(", ")}` : "No brands assigned";
}

export function StaffAccessPage() {
  const { principal, can, roleLabel } = useAccess();
  const { db, toast } = useStore();
  const [tick, setTick] = useState(0);
  const users = useMemo(() => listUsersPublic(), [tick]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    role: ROLES.INTERNAL_STAFF,
    permissionSets: [],
    scopeType: SCOPE_TYPES.SELECTED_BRANDS,
    brandIds: [],
    brandId: "",
  });

  const canInvite = can(PERMISSIONS.USERS_INVITE);
  const canManage = can(PERMISSIONS.USERS_MANAGE);

  const inviteRoles = isBrandRole(principal.role)
    ? brandInviteableRoles(principal.role)
    : [...platformInviteableRoles(principal.role), ROLES.BRAND_OWNER, ROLES.BRAND_ADMIN, ROLES.BRAND_STAFF].filter(
        (r, i, a) => a.indexOf(r) === i
      );

  const visibleUsers = users.filter((u) => {
    if (isBrandRole(principal.role)) {
      return isBrandRole(u.role) && u.scope?.brandId === principal.scope?.brandId;
    }
    return true;
  });

  const submitInvite = () => {
    const scope =
      form.role === ROLES.INTERNAL_STAFF
        ? {
            type: form.scopeType,
            brandIds: form.scopeType === SCOPE_TYPES.SELECTED_BRANDS ? form.brandIds : [],
            brandId: null,
            assignedRecordIds: [],
          }
        : isBrandRole(form.role)
          ? defaultScopeForRole(form.role, form.brandId || principal.scope?.brandId)
          : defaultScopeForRole(form.role);

    const result = inviteUser(principal, {
      email: form.email,
      name: form.name,
      role: form.role,
      permissionSets:
        form.role === ROLES.INTERNAL_STAFF || form.role === ROLES.BRAND_STAFF ? form.permissionSets : undefined,
      permissions:
        form.role === ROLES.INTERNAL_STAFF || form.role === ROLES.BRAND_STAFF
          ? mergePermissionSets(form.permissionSets)
          : undefined,
      scope,
      brandId: form.brandId || principal.scope?.brandId,
    });
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast(
      result.tempPassword
        ? `Invited ${result.user.email}. Demo temp password: ${result.tempPassword}`
        : `Invited ${result.user.email}`
    );
    setInviteOpen(false);
    setTick((t) => t + 1);
  };

  const onRevoke = (userId) => {
    const result = revokeUser(principal, userId);
    if (!result.ok) toast(result.error);
    else {
      toast("Access revoked");
      setTick((t) => t + 1);
    }
  };

  const toggleBrand = (id) => {
    setForm((f) => ({
      ...f,
      brandIds: f.brandIds.includes(id) ? f.brandIds.filter((x) => x !== id) : [...f.brandIds, id],
    }));
  };

  const toggleSet = (id) => {
    setForm((f) => ({
      ...f,
      permissionSets: f.permissionSets.includes(id)
        ? f.permissionSets.filter((x) => x !== id)
        : [...f.permissionSets, id],
    }));
  };

  return (
    <div className="space-y-5">
      <PageHead
        eyebrow="Access"
        title="Staff & access"
        description={`Invite users, assign one of the six roles, and set permissions plus brand scope. Signed in as ${roleLabel}.`}
        action={
          canInvite ? (
            <SoftButton onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Invite user
            </SoftButton>
          ) : null
        }
      />

      <Surface className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Permissions</th>
              <th className="px-4 py-3 font-medium">Scope</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((u) => (
              <tr key={u.id} className="border-b border-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-gray-800">
                    <Shield className="h-3.5 w-3.5 text-gray-400" />
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {u.permissionSets?.length
                    ? u.permissionSets.map((id) => PERMISSION_SETS[id]?.label || id).join(", ")
                    : `${u.permissions?.length || 0} grants`}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{scopeSummary(u.scope)}</td>
                <td className="px-4 py-3">
                  <Status value={u.status === "active" ? "Active" : u.status === "invited" ? "Pending" : "Suspended"} />
                </td>
                <td className="px-4 py-3 text-right">
                  {canManage && u.id !== principal.id && u.status !== "revoked" ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline"
                      onClick={() => onRevoke(u.id)}
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Revoke
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Surface>

      {inviteOpen ? (
        <ModalShell title="Invite user" eyebrow="Access" onClose={() => setInviteOpen(false)}>
          <div className="space-y-3 text-sm">
            <label className="block">
              Name
              <input
                className="input-field mt-1 w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="block">
              Email
              <input
                className="input-field mt-1 w-full"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="block">
              Role
              <select
                className="input-field mt-1 w-full"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value, permissionSets: [] })}
              >
                {inviteRoles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </label>

            {(form.role === ROLES.INTERNAL_STAFF || form.role === ROLES.BRAND_STAFF) && (
              <div>
                <p className="mb-2 font-medium text-gray-800">Permission sets</p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(PERMISSION_SETS)
                    .filter((s) =>
                      form.role === ROLES.BRAND_STAFF
                        ? s.id.startsWith("brand_") || s.id === "reports_readonly"
                        : !s.id.startsWith("brand_")
                    )
                    .map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`rounded-lg border px-2.5 py-1 text-xs ${
                          form.permissionSets.includes(s.id)
                            ? "border-pink-500 bg-pink-50 text-pink-800"
                            : "border-gray-200 text-gray-600"
                        }`}
                        onClick={() => toggleSet(s.id)}
                      >
                        {s.label}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {form.role === ROLES.INTERNAL_STAFF && (
              <div className="space-y-2">
                <p className="font-medium text-gray-800">Data scope</p>
                <select
                  className="input-field w-full"
                  value={form.scopeType}
                  onChange={(e) => setForm({ ...form, scopeType: e.target.value })}
                >
                  <option value={SCOPE_TYPES.SELECTED_BRANDS}>Selected brands</option>
                  <option value={SCOPE_TYPES.ALL_BRANDS}>All brands</option>
                  <option value={SCOPE_TYPES.ASSIGNED_RECORDS}>Assigned records only</option>
                </select>
                {form.scopeType === SCOPE_TYPES.SELECTED_BRANDS && (
                  <div className="flex flex-wrap gap-2">
                    {db.brands.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className={`rounded-lg border px-2.5 py-1 text-xs ${
                          form.brandIds.includes(b.id)
                            ? "border-pink-500 bg-pink-50 text-pink-800"
                            : "border-gray-200 text-gray-600"
                        }`}
                        onClick={() => toggleBrand(b.id)}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isBrandRole(form.role) && !isBrandRole(principal.role) && (
              <label className="block">
                Brand
                <select
                  className="input-field mt-1 w-full"
                  value={form.brandId}
                  onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                >
                  <option value="">Select brand…</option>
                  {db.brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.id})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <SoftButton onClick={() => setInviteOpen(false)}>Cancel</SoftButton>
              <SoftButton
                className="border-pink-200 bg-pink-50 text-pink-800 hover:bg-pink-100"
                onClick={submitInvite}
                disabled={!form.email}
              >
                Send invite
              </SoftButton>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}

import { useMemo, useState } from "react";
import { PageHead, SoftButton, Surface } from "../../ui";
import { useAccess } from "../AccessContext";
import { listUsersPublic, updateUserAccess, getUserById } from "../directory";
import { PERMISSION_GROUPS } from "../permissions";
import { ROLE_LABELS, ROLES, isBrandRole } from "../roles";
import { SCOPE_TYPES, SCOPE_LABELS } from "../scopes";
import { canGrantPermission } from "../authorize";
import { PERMISSIONS } from "../permissions";
import { useStore } from "../../store";

export function PermissionEditorPage() {
  const { principal, can, roleLabel, scope: actorScope } = useAccess();
  const { db, toast } = useStore();
  const [tick, setTick] = useState(0);
  const users = useMemo(() => listUsersPublic(), [tick]);
  const editable = users.filter((u) => {
    if (u.role === ROLES.PLATFORM_OWNER && principal.role !== ROLES.PLATFORM_OWNER) return false;
    if (isBrandRole(principal.role)) {
      return isBrandRole(u.role) && u.scope?.brandId === actorScope.brandId;
    }
    return u.role === ROLES.INTERNAL_STAFF || u.role === ROLES.BRAND_STAFF || u.role === ROLES.PLATFORM_ADMIN || isBrandRole(u.role);
  });

  const [selectedId, setSelectedId] = useState(editable[0]?.id || "");
  const selected = getUserById(selectedId) || editable.find((u) => u.id === selectedId);
  const [draftPerms, setDraftPerms] = useState(null);
  const [draftScope, setDraftScope] = useState(null);

  const perms = draftPerms ?? selected?.permissions ?? [];
  const scope = draftScope ?? selected?.scope ?? { type: SCOPE_TYPES.SELECTED_BRANDS, brandIds: [] };

  const onSelect = (id) => {
    setSelectedId(id);
    setDraftPerms(null);
    setDraftScope(null);
  };

  const togglePerm = (id) => {
    if (!canGrantPermission(principal, id) && principal.role !== ROLES.PLATFORM_OWNER) {
      toast("You cannot grant that permission.");
      return;
    }
    setDraftPerms((prev) => {
      const base = prev ?? selected?.permissions ?? [];
      return base.includes(id) ? base.filter((p) => p !== id) : [...base, id];
    });
  };

  const save = () => {
    if (!selected) return;
    const result = updateUserAccess(principal, selected.id, {
      permissions: perms,
      scope,
    });
    if (!result.ok) toast(result.error);
    else {
      toast("Permissions and scope saved");
      setDraftPerms(null);
      setDraftScope(null);
      setTick((t) => t + 1);
    }
  };

  if (!can(PERMISSIONS.PERMISSIONS_ASSIGN) && !can(PERMISSIONS.USERS_VIEW)) {
    return (
      <div className="py-20 text-center text-sm text-gray-500">You cannot open the permission editor.</div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHead
        eyebrow="Access"
        title="Roles & permissions"
        description={`Role is the relationship. Permissions are actions. Scope is which brands or records. Editor: ${roleLabel}.`}
        action={
          can(PERMISSIONS.PERMISSIONS_ASSIGN) ? (
            <SoftButton className="border-pink-200 bg-pink-50 text-pink-800" onClick={save} disabled={!selected}>
              Save grants
            </SoftButton>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Surface className="p-3">
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Users</p>
          <ul className="space-y-1">
            {editable.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  className={`w-full rounded-lg px-2.5 py-2 text-left text-sm ${
                    selectedId === u.id ? "bg-pink-50 text-pink-900" : "hover:bg-gray-50"
                  }`}
                  onClick={() => onSelect(u.id)}
                >
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{ROLE_LABELS[u.role]}</div>
                </button>
              </li>
            ))}
          </ul>
        </Surface>

        <div className="space-y-4">
          {selected ? (
            <>
              <Surface className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900">{selected.name}</h2>
                    <p className="text-sm text-gray-500">
                      {ROLE_LABELS[selected.role]} · {selected.email}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div className="font-medium text-gray-700">Data scope</div>
                    <select
                      className="input-field mt-1 text-sm"
                      value={scope.type}
                      disabled={selected.role === ROLES.PLATFORM_OWNER || isBrandRole(selected.role)}
                      onChange={(e) =>
                        setDraftScope({
                          ...scope,
                          type: e.target.value,
                          brandIds: e.target.value === SCOPE_TYPES.ALL_BRANDS ? [] : scope.brandIds || [],
                        })
                      }
                    >
                      {Object.entries(SCOPE_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {scope.type === SCOPE_TYPES.SELECTED_BRANDS && (
                      <div className="mt-2 flex max-w-md flex-wrap justify-end gap-1">
                        {db.brands.map((b) => {
                          const on = (scope.brandIds || []).includes(b.id);
                          return (
                            <button
                              key={b.id}
                              type="button"
                              className={`rounded border px-2 py-0.5 ${on ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}
                              onClick={() =>
                                setDraftScope({
                                  ...scope,
                                  brandIds: on
                                    ? scope.brandIds.filter((x) => x !== b.id)
                                    : [...(scope.brandIds || []), b.id],
                                })
                              }
                            >
                              {b.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Surface>

              {PERMISSION_GROUPS.map((group) => (
                <Surface key={group.id} title={group.label} className="p-0">
                  <ul className="divide-y divide-gray-50">
                    {group.permissions.map((p) => {
                      const checked = perms.includes(p.id);
                      const grantable =
                        principal.role === ROLES.PLATFORM_OWNER || canGrantPermission(principal, p.id);
                      return (
                        <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                          <div>
                            <div className="font-medium text-gray-800">{p.label}</div>
                            <div className="text-xs text-gray-400">{p.id}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!can(PERMISSIONS.PERMISSIONS_ASSIGN) || !grantable}
                            onChange={() => togglePerm(p.id)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </Surface>
              ))}
            </>
          ) : (
            <p className="text-sm text-gray-500">Select a user to edit grants.</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { PageHead, Surface } from "../../ui";
import { useAccess } from "../AccessContext";
import { listAudit } from "../audit";
import { PERMISSIONS } from "../permissions";
import { SCOPE_TYPES } from "../scopes";

export function AccessAuditPage() {
  const { can, scope, canSeeAllBrandTotals, roleLabel } = useAccess();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const brandFilter =
      canSeeAllBrandTotals || scope.type === SCOPE_TYPES.ALL_BRANDS
        ? null
        : scope.brandIds?.length
          ? scope.brandIds
          : scope.brandId
            ? [scope.brandId]
            : [];
    return listAudit({ brandIds: brandFilter, limit: 200 });
  }, [canSeeAllBrandTotals, scope]);

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const hay = `${r.actorEmail} ${r.action} ${r.recordId} ${r.brandId} ${r.result}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  if (!can(PERMISSIONS.AUDIT_VIEW)) {
    return <div className="py-20 text-center text-sm text-gray-500">You cannot view the audit log.</div>;
  }

  return (
    <div className="space-y-5">
      <PageHead
        title="Audit log"
        description={`Sensitive access events for your scope. Viewer: ${roleLabel}. Demo events are stored in this browser until Supabase audit is connected.`}
      />
      <div>
        <input
          className="input-field w-full max-w-md"
          placeholder="Filter by actor, action, record…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <Surface className="overflow-hidden p-0">
        <ul className="divide-y divide-gray-100 md:hidden">
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-gray-400">No audit events yet.</li>
          ) : (
            filtered.map((r) => (
              <li key={r.id} className="px-3.5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 text-sm font-semibold text-gray-900">{r.action}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${r.result === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                    {r.result}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{r.actorEmail || "—"}</p>
                <p className="mt-0.5 text-xs text-gray-500">{[r.brandId, r.recordType, r.recordId].filter(Boolean).join(" · ") || "—"}</p>
                <p className="mt-1 text-[11px] text-gray-400">{new Date(r.at).toLocaleString()}</p>
              </li>
            ))
          )}
        </ul>
        <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Brand / record</th>
              <th className="px-4 py-3 font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No audit events yet.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(r.at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-xs">{r.actorEmail || "—"}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{r.action}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-600">
                    {[r.brandId, r.recordType, r.recordId].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.result === "success"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {r.result}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </Surface>
    </div>
  );
}

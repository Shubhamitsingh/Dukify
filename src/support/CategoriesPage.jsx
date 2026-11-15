import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ModalShell, PageHead, SoftButton, Surface } from "../ui";
import { useSupportActions } from "./hooks";

export function CategoriesPage() {
  const { db, add, patch } = useSupportActions();
  const rows = db.ticketCategories || [];
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", scope: "brand" });
  const [scopeFilter, setScopeFilter] = useState("all");

  const visible = useMemo(() => {
    if (scopeFilter === "all") return rows;
    return rows.filter((row) => row.scope === scopeFilter);
  }, [rows, scopeFilter]);

  return (
    <div className="space-y-4">
      <PageHead
        eyebrow="Support Management"
        title="Ticket Categories"
        description="Separate category sets for brand and customer requests."
        action={
          <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add category
          </button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["brand", "Brand"],
          ["customer", "Customer"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              scopeFilter === id ? "bg-pink-500 text-white" : "border border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800"
            }`}
            onClick={() => setScopeFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <Surface>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Scope</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-t border-gray-50 dark:border-gray-700">
                  <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{row.name}</td>
                  <td className="px-3 py-3 capitalize text-gray-600 dark:text-gray-300">{row.scope}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        row.active !== false ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {row.active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <SoftButton
                      onClick={() =>
                        patch(
                          "ticketCategories",
                          row.id,
                          { active: row.active === false },
                          `Category ${row.name} ${row.active === false ? "activated" : "deactivated"}`,
                        )
                      }
                    >
                      {row.active === false ? "Activate" : "Deactivate"}
                    </SoftButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Surface>

      {creating ? (
        <ModalShell
          title="Add category"
          eyebrow="Support Management"
          size="sm"
          onClose={() => setCreating(false)}
          footer={
            <div className="flex justify-end gap-2">
              <SoftButton onClick={() => setCreating(false)}>Cancel</SoftButton>
              <button
                type="button"
                className="btn-primary"
                disabled={!draft.name.trim()}
                onClick={() => {
                  add("ticketCategories", {
                    name: draft.name.trim(),
                    scope: draft.scope,
                    active: true,
                  });
                  setCreating(false);
                  setDraft({ name: "", scope: "brand" });
                }}
              >
                Save category
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Name</span>
              <input className="input-field" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Scope</span>
              <select className="input-field" value={draft.scope} onChange={(event) => setDraft({ ...draft, scope: event.target.value })}>
                <option value="brand">Brand</option>
                <option value="customer">Customer</option>
              </select>
            </label>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}

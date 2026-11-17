import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ModalShell, PageHead, SoftButton, Surface } from "../ui";
import { useSupportActions } from "./hooks";
import { agentWorkload } from "./model";

export function AgentsPage() {
  const { db, add, patch } = useSupportActions();
  const rows = useMemo(() => agentWorkload(db.supportAgents || [], db.tickets || []), [db.supportAgents, db.tickets]);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", availability: "Online" });

  return (
    <div className="space-y-4">
      <PageHead
        title="Support Agents"
        description="Workload and availability for the support desk."
        action={
          <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add agent
          </button>
        }
      />

      <Surface>
        <ul className="divide-y divide-gray-100 md:hidden dark:divide-gray-800">
          {rows.map((agent) => (
            <li key={agent.id} className="flex items-start gap-3 px-3.5 py-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf-500 text-xs font-semibold text-white">
                {agent.avatar || agent.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{agent.name}</p>
                    <p className="truncate text-xs text-gray-500">{agent.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${agent.status === "Active" ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                    {agent.status}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">{agent.availability} · {agent.openTickets} open · {agent.resolvedTickets} resolved</p>
                <SoftButton
                  className="mt-2"
                  onClick={() =>
                    patch(
                      "supportAgents",
                      agent.id,
                      {
                        status: agent.status === "Active" ? "Inactive" : "Active",
                        availability: agent.status === "Active" ? "Offline" : "Online",
                      },
                      `Agent ${agent.name} ${agent.status === "Active" ? "deactivated" : "activated"}`,
                    )
                  }
                >
                  {agent.status === "Active" ? "Deactivate" : "Activate"}
                </SoftButton>
              </div>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2.5">Agent</th>
                <th className="px-3 py-2.5">Email</th>
                <th className="px-3 py-2.5 text-right">Assigned</th>
                <th className="px-3 py-2.5 text-right">Open</th>
                <th className="px-3 py-2.5 text-right">Resolved</th>
                <th className="px-3 py-2.5">Availability</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((agent) => (
                <tr key={agent.id} className="border-t border-gray-50 dark:border-gray-700">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf-500 text-xs font-semibold text-white">
                        {agent.avatar || agent.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{agent.email}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{agent.assignedTickets}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{agent.openTickets}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{agent.resolvedTickets}</td>
                  <td className="px-3 py-3">{agent.availability}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        agent.status === "Active" ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <SoftButton
                      onClick={() =>
                        patch(
                          "supportAgents",
                          agent.id,
                          {
                            status: agent.status === "Active" ? "Inactive" : "Active",
                            availability: agent.status === "Active" ? "Offline" : "Online",
                          },
                          `Agent ${agent.name} ${agent.status === "Active" ? "deactivated" : "activated"}`,
                        )
                      }
                    >
                      {agent.status === "Active" ? "Deactivate" : "Activate"}
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
          title="Add support agent"
          size="sm"
          onClose={() => setCreating(false)}
          footer={
            <div className="flex justify-end gap-2">
              <SoftButton onClick={() => setCreating(false)}>Cancel</SoftButton>
              <button
                type="button"
                className="btn-primary"
                disabled={!draft.name.trim() || !draft.email.includes("@")}
                onClick={() => {
                  add("supportAgents", {
                    name: draft.name.trim(),
                    email: draft.email.trim(),
                    avatar: draft.name.trim().slice(0, 2).toUpperCase(),
                    status: "Active",
                    availability: draft.availability,
                  });
                  setCreating(false);
                  setDraft({ name: "", email: "", availability: "Online" });
                }}
              >
                Save agent
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
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Email</span>
              <input className="input-field" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Availability</span>
              <select
                className="input-field"
                value={draft.availability}
                onChange={(event) => setDraft({ ...draft, availability: event.target.value })}
              >
                <option>Online</option>
                <option>Busy</option>
                <option>Offline</option>
              </select>
            </label>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}

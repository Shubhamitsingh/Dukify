import { useState } from "react";
import { ModalShell, SoftButton } from "../../ui";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "../model";

export function AssignAgentModal({ ticket, agents, mode = "assign", onClose, onSave }) {
  const [agentId, setAgentId] = useState(ticket?.assignedTo || "");
  const [priority, setPriority] = useState(ticket?.priority || "Medium");
  const [status, setStatus] = useState(ticket?.status || "Open");

  if (!ticket) return null;

  const title = mode === "priority" ? "Change priority" : mode === "status" ? "Change status" : "Assign agent";

  return (
    <ModalShell
      title={title}
      eyebrow={ticket.id}
      size="sm"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <SoftButton onClick={onClose}>Cancel</SoftButton>
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              onSave({
                assignedTo: agentId || null,
                assignedName: agents.find((row) => row.id === agentId)?.name || null,
                priority,
                status,
              })
            }
          >
            Save
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {(mode === "assign" || mode === "all") && (
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-gray-500">Support agent</span>
            <select className="input-field" value={agentId} onChange={(event) => setAgentId(event.target.value)}>
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} · {agent.availability}
                </option>
              ))}
            </select>
          </label>
        )}
        {(mode === "priority" || mode === "all") && (
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-gray-500">Priority</span>
            <select className="input-field" value={priority} onChange={(event) => setPriority(event.target.value)}>
              {TICKET_PRIORITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        )}
        {(mode === "status" || mode === "all") && (
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-gray-500">Status</span>
            <select className="input-field" value={status} onChange={(event) => setStatus(event.target.value)}>
              {TICKET_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </ModalShell>
  );
}

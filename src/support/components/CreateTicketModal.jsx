import { useMemo, useState } from "react";
import { ModalShell, SoftButton } from "../../ui";
import { TICKET_PRIORITIES, categoriesForType } from "../model";

const EMPTY = {
  requesterType: "brand",
  requesterName: "",
  brandName: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  subject: "",
  category: "",
  priority: "Medium",
  description: "",
  assignedTo: "",
  relatedOrderId: "",
};

export function CreateTicketModal({ brands, agents, categories, onClose, onCreate }) {
  const [draft, setDraft] = useState(EMPTY);
  const scopedCategories = useMemo(
    () => categoriesForType(categories, draft.requesterType),
    [categories, draft.requesterType],
  );

  const set = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }));

  const canSubmit =
    draft.requesterName.trim() &&
    draft.subject.trim() &&
    draft.description.trim() &&
    (draft.category || scopedCategories[0]?.name);

  const submit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    const category = draft.category || scopedCategories[0]?.name || "Other";
    const agent = (agents || []).find((row) => row.id === draft.assignedTo);
    onCreate({
      ...draft,
      category,
      brandName: draft.requesterType === "brand" ? draft.brandName || draft.requesterName : draft.brandName || null,
      customerName: draft.requesterType === "customer" ? draft.customerName || draft.requesterName : null,
      assignedTo: agent?.id || null,
      assignedName: agent?.name || null,
      relatedOrderId: draft.relatedOrderId || null,
    });
  };

  return (
    <ModalShell
      title="Create ticket"
      eyebrow="Support Management"
      size="lg"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <SoftButton onClick={onClose}>Cancel</SoftButton>
          <button type="submit" form="create-ticket-form" className="btn-primary" disabled={!canSubmit}>
            Create ticket
          </button>
        </div>
      }
    >
      <form id="create-ticket-form" className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Requester type</span>
          <select
            className="input-field"
            value={draft.requesterType}
            onChange={(event) => setDraft((current) => ({ ...current, requesterType: event.target.value, category: "" }))}
          >
            <option value="brand">Brand</option>
            <option value="customer">Customer</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Requester name</span>
          <input className="input-field" value={draft.requesterName} onChange={set("requesterName")} required />
        </label>
        {draft.requesterType === "brand" ? (
          <label>
            <span className="mb-1 block text-[11px] font-medium text-gray-500">Brand</span>
            <select className="input-field" value={draft.brandName} onChange={set("brandName")}>
              <option value="">Select brand</option>
              {(brands || []).map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label>
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Customer name</span>
              <input className="input-field" value={draft.customerName} onChange={set("customerName")} />
            </label>
            <label>
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Customer email</span>
              <input className="input-field" value={draft.customerEmail} onChange={set("customerEmail")} />
            </label>
            <label>
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Phone</span>
              <input className="input-field" value={draft.customerPhone} onChange={set("customerPhone")} />
            </label>
            <label>
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Related order ID</span>
              <input className="input-field" value={draft.relatedOrderId} onChange={set("relatedOrderId")} placeholder="ORD-1048" />
            </label>
          </>
        )}
        <label className="sm:col-span-2">
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Subject</span>
          <input className="input-field" value={draft.subject} onChange={set("subject")} required />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Category</span>
          <select className="input-field" value={draft.category} onChange={set("category")}>
            <option value="">Select category</option>
            {scopedCategories.map((row) => (
              <option key={row.id} value={row.name}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Priority</span>
          <select className="input-field" value={draft.priority} onChange={set("priority")}>
            {TICKET_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Assign agent (optional)</span>
          <select className="input-field" value={draft.assignedTo} onChange={set("assignedTo")}>
            <option value="">Unassigned</option>
            {(agents || [])
              .filter((agent) => agent.status === "Active")
              .map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Description</span>
          <textarea className="input-field min-h-28" value={draft.description} onChange={set("description")} required />
        </label>
        <p className="sm:col-span-2 text-xs text-gray-400">Attachments are mock-only in this demo — describe files in the message if needed.</p>
      </form>
    </ModalShell>
  );
}

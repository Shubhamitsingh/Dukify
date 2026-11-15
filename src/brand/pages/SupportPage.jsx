import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { faqs } from "../data/seed";
import { usePartner } from "../store";
import { Field, PageHead, SoftButton, Status, Surface } from "../ui";

const copy = {
  help: ["Help centre", "Start with the operating rules, then open a ticket if the answer is not here."],
  create: ["Create a ticket", "Raise a problem for this brand. Super Admin Support can see it in this browser demo."],
  tickets: ["My tickets", "Open and resolved requests for this brand only."],
  faq: ["Frequently asked questions", "Short answers for the questions partners ask first."],
  contact: ["Contact platform support", "Pahachan support reads tickets raised from this portal."],
};

const TOPICS = ["Orders", "Products", "Pricing", "Payments", "Technical", "Account", "Platform", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export default function SupportPage({ section }) {
  const partner = usePartner();
  const navigate = useNavigate();
  const [title, description] = copy[section] || copy.help;
  const [form, setForm] = useState({ topic: "Orders", subject: "", message: "", priority: "Medium" });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(null);

  function submit(event) {
    event.preventDefault();
    const next = {};
    if (form.subject.trim().length < 4) next.subject = "Add a subject of at least 4 characters.";
    if (form.message.trim().length < 12) next.message = "Describe the issue in at least 12 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;
    partner.addTicket(form);
    setForm({ topic: "Orders", subject: "", message: "", priority: "Medium" });
    navigate("/brand/support/tickets");
  }

  return (
    <div>
      <PageHead
        title={title}
        description={description}
        action={
          section !== "create" ? (
            <button type="button" className="btn-primary" onClick={() => navigate("/brand/support/create")}>
              Raise ticket
            </button>
          ) : (
            <SoftButton onClick={() => navigate("/brand/support/tickets")}>My tickets</SoftButton>
          )
        }
      />

      {(section === "help" || section === "faq" || section === "contact") && (
        <div className="mb-4 space-y-2">
          {faqs.map((item) => (
            <Surface key={item.q} padded>
              <button type="button" className="w-full text-left" onClick={() => setOpen(open === item.q ? null : item.q)}>
                <span className="text-sm font-semibold">{item.q}</span>
                {open === item.q ? <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.a}</p> : null}
              </button>
            </Surface>
          ))}
        </div>
      )}

      {section === "contact" ? (
        <Surface padded>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Email support@pahachan.test · Desk hours 10:00–19:00 IST. Use a ticket so the request stays attached to {partner.brand.name}.
          </p>
        </Surface>
      ) : null}

      {(section === "create" || section === "help") && (
        <Surface title="New ticket" padded className="mb-4">
          <form onSubmit={submit} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Topic">
                <select className="input-field" value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })}>
                  {TOPICS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select className="input-field" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                  {PRIORITIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Subject" error={errors.subject}>
              <input className="input-field" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Short summary of the problem" />
            </Field>
            <Field label="Describe the problem" error={errors.message}>
              <textarea
                className="input-field min-h-28"
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                placeholder="What broke, which order/product, and what you need from Pahachan."
              />
            </Field>
            <p className="text-xs text-gray-500">This ticket is tagged to {partner.brand.name}. Demo only — stored in this browser.</p>
            <button className="btn-primary w-fit" type="submit">
              Submit ticket
            </button>
          </form>
        </Surface>
      )}

      {(section === "tickets" || section === "help") && (
        <div className="space-y-3">
          {partner.tickets.length ? (
            partner.tickets.map((ticket) => (
              <Surface key={ticket.id} padded>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.subject}</h3>
                  <Status value={ticket.status} />
                  <Status value={ticket.priority} />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {ticket.id} · {ticket.topic}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{ticket.message}</p>
                {ticket.replies?.map((reply) => (
                  <p key={reply.at} className="mt-2 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-950 dark:bg-sky-950/30 dark:text-sky-100">
                    <strong>{reply.from}. </strong>
                    {reply.text}
                  </p>
                ))}
              </Surface>
            ))
          ) : (
            <Surface padded>
              <p className="text-sm text-gray-500">No tickets yet for this brand.</p>
              <button type="button" className="btn-primary mt-3" onClick={() => navigate("/brand/support/create")}>
                Raise your first ticket
              </button>
            </Surface>
          )}
        </div>
      )}
    </div>
  );
}

SupportPage.moduleId = "support";

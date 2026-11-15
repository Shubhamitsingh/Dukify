import { useState } from "react";
import { useParams } from "react-router-dom";
import { faqs } from "../data/seed";
import { formatDate } from "../lib/metrics";
import { usePartner } from "../store";
import { Field, PageHead, Status, Surface } from "../ui";

const topics = ["Products", "Pricing", "Orders", "Payments", "Technical"];

export default function Support() {
  const { section = "help" } = useParams();
  const { tickets, addTicket, brand } = usePartner();
  const [form, setForm] = useState({ topic: "Orders", subject: "", message: "", priority: "Medium" });
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const submit = (event) => {
    event.preventDefault();
    if (form.subject.trim().length < 4 || form.message.trim().length < 10) {
      setError("Add a subject and at least a short message.");
      return;
    }
    addTicket(form);
    setForm({ topic: "Orders", subject: "", message: "", priority: "Medium" });
    setError("");
  };

  return (
    <div>
      <PageHead title="Support centre" description={`Tickets opened here belong to ${brand.name}.`} />
      {(section === "help" || section === "contact") && (
        <Surface title="Contact Pahachan" className="mb-4" padded>
          <p className="text-sm">Platform support reads tickets for products, pricing, orders, payments, and technical issues. Email support@pahachan.test · +91 22 4000 2200. This demo does not send the email.</p>
        </Surface>
      )}
      {(section === "help" || section === "create") && (
        <Surface title="Create a ticket" className="mb-4" padded>
          <form className="grid gap-3" onSubmit={submit}>
            <Field label="Topic">
              <select className="input-field" value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })}>
                {topics.map((topic) => <option key={topic}>{topic}</option>)}
              </select>
            </Field>
            <Field label="Subject" error={error}><input className="input-field" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} /></Field>
            <Field label="Message"><textarea className="input-field min-h-24" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></Field>
            <Field label="Priority">
              <select className="input-field" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                {["Low", "Medium", "High"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <button className="btn-primary w-fit" type="submit">Submit ticket</button>
          </form>
        </Surface>
      )}
      {(section === "tickets" || section === "help") && (
        <Surface title="My tickets" className="mb-4">
          <ul>
            {tickets.map((ticket) => (
              <li key={ticket.id} className="border-b border-gray-100 px-4 py-3 text-sm last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{ticket.id} · {ticket.subject}</span>
                  <span className="flex gap-2"><Status value={ticket.status} /><Status value={ticket.priority} /></span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{ticket.topic} · {formatDate(ticket.createdAt.slice(0, 10))}</p>
                <p className="mt-1 text-gray-600">{ticket.message}</p>
                {ticket.replies.map((reply) => (
                  <p key={reply.at} className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">{reply.from}: {reply.text}</p>
                ))}
              </li>
            ))}
          </ul>
        </Surface>
      )}
      {(section === "faq" || section === "help") && (
        <Surface title="Frequently asked questions" padded>
          <ul className="space-y-2">
            {faqs.map((item, index) => (
              <li key={item.q}>
                <button type="button" className="text-left text-sm font-semibold" onClick={() => setOpenFaq(index)}>{item.q}</button>
                {openFaq === index ? <p className="mt-1 text-sm text-gray-600">{item.a}</p> : null}
              </li>
            ))}
          </ul>
        </Surface>
      )}
    </div>
  );
}

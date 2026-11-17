import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "./ui";
import { demoRequestToTicket, pushDemoTicket } from "./support/bridge";

const KEY = "dukify-demo-requests";

export function readDemoRequests() {
  try {
    const raw = localStorage.getItem(KEY);
    const rows = raw ? JSON.parse(raw) : [];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function writeDemoRequests(rows) {
  localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 200)));
}

export function saveDemoRequest(entry) {
  const row = {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    name: entry.name.trim(),
    phone: entry.phone.trim(),
    email: entry.email.trim(),
    brand: entry.brand.trim(),
    note: entry.note.trim(),
  };
  const ticket = demoRequestToTicket(row);
  row.ticketId = ticket.id;
  pushDemoTicket(ticket);
  writeDemoRequests([row, ...readDemoRequests()]);
  return row;
}

const fieldClass =
  "mt-1.5 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#1F2937] outline-none transition focus:border-[#EE8802] focus:ring-4 focus:ring-[#EE8802]/15";

export function PublicSupportPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) {
      setError("Add your name.");
      return;
    }
    if (digits.length < 10) {
      setError("Add a phone number we can call.");
      return;
    }
    if (!email.includes("@") || email.trim().length < 5) {
      setError("Add an email we can write to.");
      return;
    }
    setSaved(saveDemoRequest({ name, phone, email, brand, note }));
    setError("");
  };

  return (
    <div className="min-h-[100svh] bg-[#F7F9FC]">
      <header className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
        <Link to="/">
          <img src="/logo/logo-ducku-2.png" alt="Dukify" className="h-9 w-auto" />
        </Link>
        <Link to="/" className="text-sm font-semibold text-[#001E55]">
          Back to home
        </Link>
      </header>
      <main className="mx-auto w-full max-w-xl px-5 py-8 pb-16">
        {saved ? (
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#64748B] uppercase">Request received</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#001E55]">We’ll call you.</h1>
            <p className="mt-3 text-base leading-relaxed text-[#64748B]">
              {saved.name}, we’ll reach out on {saved.phone} to walk through catalogue, store, and orders.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold text-[#001E55]"
              style={{ background: "#EE8802" }}
            >
              Back to home
            </Link>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#64748B] uppercase">Support</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#001E55]">Book a demo</h1>
            <p className="mt-3 text-base leading-relaxed text-[#64748B]">
              Leave your details. We’ll call and explain Dukify — catalogue, storefront, and orders.
            </p>
            <label className="mt-8 block text-sm font-medium text-[#001E55]">
              Name
              <input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </label>
            <label className="mt-4 block text-sm font-medium text-[#001E55]">
              Phone
              <input className={fieldClass} value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" placeholder="10-digit mobile" />
            </label>
            <label className="mt-4 block text-sm font-medium text-[#001E55]">
              Email
              <input className={fieldClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            </label>
            <label className="mt-4 block text-sm font-medium text-[#001E55]">
              Brand or Instagram
              <input className={fieldClass} value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Optional" />
            </label>
            <label className="mt-4 block text-sm font-medium text-[#001E55]">
              What should we cover?
              <textarea className={`${fieldClass} min-h-28 resize-y`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional" />
            </label>
            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-bold text-[#001E55] transition hover:brightness-110"
              style={{ background: "#EE8802" }}
            >
              Request a call
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export function DemoRequestsPage() {
  const [rows, setRows] = useState(() => readDemoRequests());

  return (
    <div className="space-y-4">
      <PageHead
        title="Demo calls"
        description="Landing-page demo requests. Each one is also an open ticket in All Tickets, so support can call them back."
      />
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white px-4 py-8 text-sm text-gray-500">
          No demo requests yet. They show up here after someone books a demo on this computer.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {rows.map((row) => (
            <li key={row.id} className="px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-gray-900">{row.name}</p>
                <p className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleString()}</p>
              </div>
              {row.ticketId ? (
                <Link to={`/support/ticket/${row.ticketId}`} className="mt-1 inline-block text-xs font-semibold text-leaf-700">
                  {row.ticketId}
                </Link>
              ) : null}
              <p className="mt-1 text-sm text-gray-700">
                {row.phone}
                <span className="px-1.5 text-gray-300">·</span>
                {row.email}
              </p>
              {row.brand ? <p className="mt-1 text-sm text-gray-500">{row.brand}</p> : null}
              {row.note ? <p className="mt-1 text-sm text-gray-500">{row.note}</p> : null}
            </li>
          ))}
        </ul>
      )}
      {rows.length ? (
        <button
          type="button"
          className="text-sm font-medium text-gray-500"
          onClick={() => {
            writeDemoRequests([]);
            setRows([]);
          }}
        >
          Clear this list
        </button>
      ) : null}
    </div>
  );
}

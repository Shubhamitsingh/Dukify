import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../../store";
import { normalizeSettings } from "../data/defaults";
import { Field, SettingsPanel } from "./SettingsChrome";

function useDraft(saved, onPersist) {
  const [draft, setDraft] = useState(saved);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => setDraft(saved), [saved]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setDraft((current) => ({ ...current, [key]: value }));
    setError("");
    setOk("");
  };

  const toggle = (key) => {
    setDraft((current) => ({ ...current, [key]: !current[key] }));
    setError("");
    setOk("");
  };

  const save = (validate) => {
    if (!dirty) return;
    const message = validate?.(draft);
    if (message) {
      setError(message);
      setOk("");
      return;
    }
    onPersist(draft);
    setOk("Saved in this browser session only.");
    setError("");
  };

  return {
    draft,
    setDraft,
    set,
    toggle,
    dirty,
    error,
    ok,
    save,
    reset: () => {
      setDraft(saved);
      setError("");
      setOk("");
    },
  };
}

export function CompanySection({ value, onSave }) {
  const form = useDraft(value, onSave);
  return (
    <SettingsPanel
      title="Company"
      dirty={form.dirty}
      error={form.error}
      ok={form.ok}
      onReset={form.reset}
      onSave={() =>
        form.save((next) => {
          if (!next.name?.trim()) return "Company name is required.";
          if (!next.supportEmail?.trim()) return "Support email is required.";
          return null;
        })
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Company name" required>
          <input className="input-field" value={form.draft.name} onChange={form.set("name")} />
        </Field>
        <Field label="Support email" required>
          <input className="input-field" type="email" value={form.draft.supportEmail} onChange={form.set("supportEmail")} />
        </Field>
        <Field label="Phone">
          <input className="input-field" value={form.draft.phone} onChange={form.set("phone")} />
        </Field>
        <Field label="Website">
          <input className="input-field" value={form.draft.website} onChange={form.set("website")} />
        </Field>
        <Field label="Registered address" className="sm:col-span-2">
          <textarea className="input-field min-h-16" value={form.draft.address} onChange={form.set("address")} />
        </Field>
        <Field label="City">
          <input className="input-field" value={form.draft.city} onChange={form.set("city")} />
        </Field>
        <Field label="State">
          <input className="input-field" value={form.draft.state} onChange={form.set("state")} />
        </Field>
        <Field label="Country">
          <input className="input-field" value={form.draft.country} onChange={form.set("country")} />
        </Field>
        <Field label="PIN">
          <input className="input-field" value={form.draft.pin} onChange={form.set("pin")} />
        </Field>
        <Field label="GSTIN (optional)" className="sm:col-span-2">
          <input className="input-field" value={form.draft.gstin} onChange={form.set("gstin")} />
        </Field>
      </div>
    </SettingsPanel>
  );
}

export function PreferencesSection({ value, onSave }) {
  const form = useDraft(value, onSave);
  return (
    <SettingsPanel title="Preferences" dirty={form.dirty} error={form.error} ok={form.ok} onReset={form.reset} onSave={() => form.save()}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Default currency">
          <select className="input-field" value={form.draft.currency} onChange={form.set("currency")}>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
        </Field>
        <Field label="Timezone">
          <select className="input-field" value={form.draft.timezone} onChange={form.set("timezone")}>
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
          </select>
        </Field>
        <Field label="Date format">
          <select className="input-field" value={form.draft.dateFormat} onChange={form.set("dateFormat")}>
            <option value="DD MMM YYYY">DD MMM YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </Field>
        <Field label="Language">
          <select className="input-field" value={form.draft.language} onChange={form.set("language")}>
            <option value="en-IN">English (India)</option>
            <option value="hi-IN">Hindi</option>
          </select>
        </Field>
      </div>
    </SettingsPanel>
  );
}

export function CommerceSection({ value, onSave }) {
  const form = useDraft(value, onSave);
  return (
    <SettingsPanel
      title="Commerce defaults"
      dirty={form.dirty}
      error={form.error}
      ok={form.ok}
      onReset={form.reset}
      onSave={() =>
        form.save((next) => {
          if (!String(next.invoicePrefix || "").trim()) return "Invoice prefix is required.";
          return null;
        })
      }
    >
      <p className="text-xs text-gray-500">Defaults only. Live payments, shipping and settlements stay in their modules.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Invoice prefix" required>
          <input className="input-field" value={form.draft.invoicePrefix} onChange={form.set("invoicePrefix")} />
        </Field>
        <Field label="Invoice number format">
          <input className="input-field" value={form.draft.invoiceFormat} onChange={form.set("invoiceFormat")} />
        </Field>
        <Field label="Return window (days)">
          <input
            className="input-field"
            type="number"
            min="0"
            value={form.draft.returnWindowDays}
            onChange={form.set("returnWindowDays")}
          />
        </Field>
        <Field label="Tax note">
          <input className="input-field" value={form.draft.taxNote} onChange={form.set("taxNote")} />
        </Field>
      </div>
    </SettingsPanel>
  );
}

const ALERT_ROWS = [
  ["newOrders", "New orders"],
  ["paymentFailure", "Payment failures"],
  ["newBrand", "New brand registrations"],
  ["pendingApproval", "Pending approvals"],
  ["refunds", "Refunds"],
];

export function AlertsSection({ value, onSave }) {
  const form = useDraft(value, onSave);
  return (
    <SettingsPanel title="Admin alerts" dirty={form.dirty} error={form.error} ok={form.ok} onReset={form.reset} onSave={() => form.save()}>
      <p className="text-xs text-gray-500">Platform owner alerts only. Customer messaging stays under Notifications.</p>
      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200/80 dark:divide-gray-700 dark:border-gray-700">
        {ALERT_ROWS.map(([key, label]) => (
          <li key={key} className="flex items-center justify-between gap-3 px-3 py-3">
            <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(form.draft[key])}
              onClick={() => form.toggle(key)}
              className={`relative h-7 w-12 rounded-full transition ${form.draft[key] ? "bg-leaf-500" : "bg-gray-200 dark:bg-gray-600"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                  form.draft[key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </SettingsPanel>
  );
}

function download(name, body, type) {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function DataSection() {
  const { db, load } = useStore();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const exportJson = () => {
    download("dukify-session.json", JSON.stringify(db, null, 2), "application/json");
    setOk("Exported session JSON.");
    setError("");
  };

  const exportOrders = () => {
    const header = "id,brand,product,sku,qty,value,payment,fulfilment,date";
    const lines = (db.orders || []).map((row) =>
      [row.id, row.brand, row.product, row.sku, row.qty, row.value, row.payment, row.fulfilment, row.date].join(","),
    );
    download("dukify-orders.csv", [header, ...lines].join("\n"), "text/csv");
    setOk("Exported orders CSV.");
    setError("");
  };

  const onFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.orders) || !Array.isArray(parsed.products)) {
          setPreview(null);
          setError("Invalid file — needs orders and products arrays.");
          setOk("");
        } else {
          setPreview({
            name: file.name,
            orders: parsed.orders.length,
            products: parsed.products.length,
            payload: { ...parsed, settings: normalizeSettings(parsed.settings) },
          });
          setError("");
          setOk("");
        }
      } catch {
        setPreview(null);
        setError("Could not parse JSON.");
        setOk("");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!preview) return;
    if (!window.confirm("Replace the current browser session with this file?")) return;
    load(preview.payload);
    setPreview(null);
    setOk("Import applied to this browser session only.");
    setError("");
  };

  return (
    <SettingsPanel title="Data" actions={false} error={error} ok={ok}>
      <p className="text-xs text-gray-500">Session backup tools. Import asks for confirmation before overwrite.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary px-3 py-2 text-xs" onClick={exportJson}>
          Export JSON
        </button>
        <button
          type="button"
          className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"
          onClick={exportOrders}
        >
          Export orders CSV
        </button>
        <button
          type="button"
          className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"
          onClick={() => fileRef.current?.click()}
        >
          Import JSON
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
      </div>

      {preview ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
          <p className="font-semibold">Preview · {preview.name}</p>
          <p className="mt-1">
            {preview.orders} orders · {preview.products} products
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="btn-primary px-3 py-2 text-xs" onClick={confirmImport}>
              Confirm replace
            </button>
            <button
              type="button"
              className="rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold"
              onClick={() => setPreview(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </SettingsPanel>
  );
}

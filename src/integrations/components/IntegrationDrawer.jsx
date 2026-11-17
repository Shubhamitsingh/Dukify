import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { ModalShell, SoftButton } from "../../ui";
import { maskSecret } from "../data/integrations";
import { IntegrationLogo } from "./IntegrationLogo";
import { IntegrationStatus } from "./IntegrationStatus";

export function IntegrationDrawer({
  provider,
  brands,
  record,
  brandId,
  onBrandChange,
  onClose,
  onSave,
  onTest,
}) {
  const [draft, setDraft] = useState({});
  const [reveal, setReveal] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDraft({});
    setReveal({});
    setMessage("");
  }, [provider?.id, brandId]);

  if (!provider) return null;

  const requiredMissing = provider.fields
    .filter((field) => field.required)
    .some((field) => {
      const typed = String(draft[field.key] || "").trim();
      if (typed) return false;
      return !record?.masked?.[field.key];
    });

  const statusLabel = record?.saved
    ? record.enabled === false
      ? "Not Connected"
      : "Connected"
    : "Not Connected";

  const save = (event) => {
    event.preventDefault();
    if (provider.scope === "brand" && !brandId) {
      setMessage("Select a brand. Brand credentials stay isolated.");
      return;
    }
    if (requiredMissing) {
      setMessage("Fill every required field before saving this demo config.");
      return;
    }

    const nextMasked = { ...(record?.masked || {}) };
    provider.fields.forEach((field) => {
      const typed = String(draft[field.key] || "").trim();
      if (typed) nextMasked[field.key] = maskSecret(typed);
    });

    onSave({
      providerId: provider.id,
      brandId: provider.scope === "brand" ? brandId : null,
      masked: nextMasked,
      status: "Connected",
      enabled: true,
    });
    setDraft({});
    setMessage("Configuration saved. This integration is now Connected. You can turn it off anytime from the card.");
  };

  const test = () => {
    const note = onTest(provider.id);
    setMessage(note);
  };

  return (
    <ModalShell
      title={provider.name}
      eyebrow="Configure integration"
      align="center"
      size="md"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <SoftButton className="flex-1" onClick={test}>
              Test connection
            </SoftButton>
            <button type="submit" form="integration-config-form" className="btn-primary flex-1">
              Save configuration
            </button>
          </div>
          <p className="text-center text-[11px] leading-4 text-gray-400">
            Demo only — secrets are not stored in localStorage or sent to an API from this panel.
          </p>
        </div>
      }
    >
      <form id="integration-config-form" className="space-y-4" onSubmit={save}>
        <section className="rounded-xl border border-gray-200/80 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-gray-100 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
              <IntegrationLogo providerId={provider.id} name={provider.name} className="h-8 w-8" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{provider.name}</p>
                <IntegrationStatus value={statusLabel} />
              </div>
              <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                {provider.category} · {provider.scope === "platform" ? "Platform scope" : "Brand scope"}
              </p>
              <p className="mt-2 text-sm leading-5 text-gray-600 dark:text-gray-300">{provider.description}</p>
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-leaf-700 hover:text-leaf-800"
              >
                Documentation
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        {provider.scope === "brand" ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Brand</span>
            <select className="input-field" value={brandId} onChange={(event) => onBrandChange(event.target.value)}>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <span className="mt-1.5 block text-[11px] text-gray-400">
              Credentials stay isolated to this brand ID. Never mix with another brand.
            </span>
          </label>
        ) : (
          <div className="rounded-xl border border-gray-200/80 bg-gray-50 px-3 py-2.5 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900">
            Platform scope — one central credential set for the company.
          </div>
        )}

        <section className="space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">Credentials</p>
          {provider.fields.map((field) => {
            const masked = record?.masked?.[field.key];
            const typed = draft[field.key] ?? "";
            const isSecret = field.type === "password";
            const showMasked = Boolean(masked) && !typed && !reveal[field.key];
            return (
              <label key={field.key} className="block">
                <span className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {field.label}
                    {field.required ? <span className="text-rose-500"> *</span> : null}
                  </span>
                  {masked ? (
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-leaf-700"
                      onClick={() => setReveal((current) => ({ ...current, [field.key]: !current[field.key] }))}
                    >
                      {showMasked ? "Replace" : "Keep masked"}
                    </button>
                  ) : null}
                </span>
                {showMasked ? (
                  <div className="input-field flex items-center text-gray-500">{masked}</div>
                ) : (
                  <input
                    className="input-field"
                    type={isSecret && !reveal[field.key] ? "password" : "text"}
                    value={typed}
                    placeholder={field.placeholder}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                  />
                )}
              </label>
            );
          })}
        </section>

        {message ? <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{message}</p> : null}
        {record?.lastTestNote ? <p className="text-[11px] text-gray-400">Last test · {record.lastTestNote}</p> : null}
      </form>
    </ModalShell>
  );
}

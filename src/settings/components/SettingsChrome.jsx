import { SETTINGS_SECTIONS } from "../data/defaults";

export function SettingsChrome({ active, onChange, children }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="min-w-0">
        <nav className="hidden lg:block">
          <ul className="sticky top-4 space-y-0.5">
            {SETTINGS_SECTIONS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    active === item.id
                      ? "bg-pink-500 text-white shadow-sm shadow-pink-500/25"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <label className="block lg:hidden">
          <span className="mb-1.5 block text-xs font-medium text-gray-500">Section</span>
          <select className="input-field" value={active} onChange={(event) => onChange(event.target.value)}>
            {SETTINGS_SECTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function SettingsPanel({ title, dirty, onSave, onReset, error, ok, children, actions = true }) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
          {dirty ? (
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Unsaved
            </span>
          ) : null}
        </div>
        {actions ? (
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
              disabled={!dirty}
              onClick={onReset}
            >
              Reset
            </button>
            <button type="button" className="btn-primary px-3 py-2 text-xs disabled:opacity-40" disabled={!dirty} onClick={onSave}>
              Save changes
            </button>
          </div>
        ) : null}
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        {children}
        {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
        {ok ? <p className="text-xs font-medium text-emerald-700">{ok}</p> : null}
      </div>
    </section>
  );
}

export function Field({ label, required, className = "", children }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-gray-500">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

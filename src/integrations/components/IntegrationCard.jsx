import { IntegrationLogo } from "./IntegrationLogo";

/**
 * Always shows On/Off.
 * Configured → toggle works instantly (credentials kept).
 * Not configured → turning On opens Configure; Off stays Off.
 */
export function IntegrationCard({ provider, configured, enabled, onConfigure, onToggle }) {
  const handleToggle = () => {
    if (!configured) {
      if (!enabled) onConfigure(provider.id);
      return;
    }
    onToggle?.(provider.id, !enabled);
  };

  return (
    <article className="flex h-full flex-col rounded-xl border border-gray-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_20px_rgba(17,24,39,0.04)] transition hover:shadow-[0_1px_2px_rgba(17,24,39,0.05),0_12px_28px_rgba(17,24,39,0.08)] dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-gray-100 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
          <IntegrationLogo providerId={provider.id} name={provider.name} className="h-8 w-8" />
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={`${enabled ? "Turn off" : "Turn on"} ${provider.name}`}
          onClick={handleToggle}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
            enabled ? "bg-leaf-500" : "bg-gray-200 dark:bg-gray-600"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <h3 className="mt-5 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">{provider.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{provider.description}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        {configured ? (
          <span
            className={`text-xs font-semibold ${
              enabled ? "text-leaf-600 dark:text-leaf-400" : "text-gray-400"
            }`}
          >
            Connected
          </span>
        ) : (
          <span className="text-xs font-semibold text-gray-400">Not configured</span>
        )}
        <button
          type="button"
          className="text-xs font-semibold text-sky-600 transition hover:text-sky-700 dark:text-sky-400"
          onClick={() => onConfigure(provider.id)}
        >
          {configured ? "Edit" : "Configure"}
        </button>
      </div>
    </article>
  );
}

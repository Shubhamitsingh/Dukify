import { useMemo, useState } from "react";
import { PageHead } from "../ui";
import { useStore } from "../store";
import { INTEGRATION_PROVIDERS, getProviderById } from "./config/providers";
import {
  configKey,
  createInitialIntegrationState,
  getProviderCardState,
  getProviderRecord,
  setProviderEnabled,
} from "./data/integrations";
import { IntegrationCard } from "./components/IntegrationCard";
import { IntegrationDrawer } from "./components/IntegrationDrawer";

export function IntegrationsPage() {
  const { db } = useStore();
  const brands = db.brands || [];
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState(() => createInitialIntegrationState());
  const [activeId, setActiveId] = useState(null);
  const [drawerBrandId, setDrawerBrandId] = useState(brands[0]?.id || "");

  const activeProvider = getProviderById(activeId);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return INTEGRATION_PROVIDERS.filter((provider) => {
      const haystack = `${provider.name} ${provider.category} ${provider.description} ${provider.scope}`.toLowerCase();
      return !needle || haystack.includes(needle);
    });
  }, [query]);

  const openConfigure = (providerId) => {
    const provider = getProviderById(providerId);
    setDrawerBrandId(provider?.scope === "brand" ? brands[0]?.id || "" : "");
    setActiveId(providerId);
  };

  const toggleProvider = (providerId, nextOn) => {
    setRecords((current) => setProviderEnabled(current, providerId, nextOn));
  };

  const saveConfig = ({ providerId, brandId, masked, status, enabled = true }) => {
    const key = configKey(providerId, brandId);
    setRecords((current) => ({
      ...current,
      [key]: {
        providerId,
        brandId: brandId || null,
        masked,
        saved: true,
        enabled,
        status,
        updatedAt: new Date().toISOString(),
        lastTestNote: current[key]?.lastTestNote || null,
      },
    }));
    setActiveId(null);
  };

  const testConnection = (providerId, brandId) => {
    const key = configKey(providerId, brandId);
    const note = "Live test is not available in this demo. Credentials stay as saved; use Save to mark Connected.";
    setRecords((current) => ({
      ...current,
      [key]: {
        ...(current[key] || { providerId, brandId: brandId || null, masked: {}, saved: false }),
        lastTestNote: note,
      },
    }));
    return note;
  };

  const activeBrandId = activeProvider?.scope === "brand" ? drawerBrandId || brands[0]?.id || "" : null;
  const activeRecord = activeProvider
    ? getProviderRecord(records, activeProvider.id, activeProvider.scope === "brand" ? activeBrandId : null)
    : null;

  return (
    <div className="space-y-4">
      <PageHead
        title="Integrations"
        description="Manage payment, shipping, communication and other platform services."
        action={
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search integrations"
            className="input-field w-full sm:w-64"
          />
        }
      />

      {visible.length === 0 ? (
        <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800">
          No integrations match this search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((provider) => {
            const state = getProviderCardState(records, provider);
            return (
              <IntegrationCard
                key={provider.id}
                provider={provider}
                configured={state.configured}
                enabled={state.enabled}
                onConfigure={openConfigure}
                onToggle={toggleProvider}
              />
            );
          })}
        </div>
      )}

      {activeProvider ? (
        <IntegrationDrawer
          provider={activeProvider}
          brands={brands}
          record={activeRecord}
          brandId={activeBrandId || ""}
          onBrandChange={setDrawerBrandId}
          onClose={() => setActiveId(null)}
          onSave={saveConfig}
          onTest={(providerId) => testConnection(providerId, activeProvider.scope === "brand" ? activeBrandId : null)}
        />
      ) : null}
    </div>
  );
}

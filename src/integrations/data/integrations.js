import { INTEGRATION_PROVIDERS } from "../config/providers";

export function configKey(providerId, brandId) {
  return brandId ? `${providerId}::${brandId}` : `${providerId}::platform`;
}

export function maskSecret(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= 4) return "••••";
  return `${"•".repeat(Math.min(12, text.length - 2))}${text.slice(-2)}`;
}

/** Compact rows for desks / exception counts (aligned with hub catalog). */
export function integrationsSeedRows() {
  return INTEGRATION_PROVIDERS.map((provider, index) => ({
    id: `INT-${String(index + 1).padStart(2, "0")}`,
    name: provider.name,
    kind: provider.category,
    status: "Not connected",
    note: provider.description,
    providerId: provider.id,
    scope: provider.scope,
  }));
}

/** Empty session map: key = providerId::brandId|platform */
export function createInitialIntegrationState() {
  return {};
}

export function getProviderRecord(records, providerId, brandId) {
  return records[configKey(providerId, brandId)] || null;
}

function providerRows(records, providerId) {
  const prefix = `${providerId}::`;
  return Object.entries(records).filter(([key]) => key.startsWith(prefix));
}

/** Card UI state: configured (saved once) vs active (enabled). */
export function getProviderCardState(records, provider) {
  const matches = providerRows(records, provider.id);
  const configured = matches.some(([, row]) => row?.saved);
  if (!configured) {
    return { configured: false, enabled: false, status: "Not Connected" };
  }
  if (matches.some(([, row]) => row.status === "Error")) {
    return { configured: true, enabled: matches.some(([, row]) => row.enabled !== false), status: "Error" };
  }
  const enabled = matches.some(([, row]) => row.enabled !== false);
  return {
    configured: true,
    enabled,
    status: enabled ? "Connected" : "Not Connected",
  };
}

/** @deprecated prefer getProviderCardState */
export function providerCardStatus(records, provider) {
  return getProviderCardState(records, provider).status;
}

/** @deprecated prefer getProviderCardState */
export function providerIsConfigured(records, provider) {
  return getProviderCardState(records, provider).configured;
}

/** Toggle on/off without wiping masked credentials. */
export function setProviderEnabled(records, providerId, enabled) {
  const next = { ...records };
  const prefix = `${providerId}::`;
  Object.keys(next).forEach((key) => {
    if (!key.startsWith(prefix) || !next[key]?.saved) return;
    next[key] = {
      ...next[key],
      enabled,
      status: enabled ? "Connected" : "Not Connected",
      updatedAt: new Date().toISOString(),
    };
  });
  return next;
}

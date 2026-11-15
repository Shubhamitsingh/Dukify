/** Platform settings mock — slim shape for future DB mapping. */

export const SETTINGS_SECTIONS = [
  { id: "company", label: "Company" },
  { id: "preferences", label: "Preferences" },
  { id: "commerce", label: "Commerce" },
  { id: "alerts", label: "Admin alerts" },
  { id: "data", label: "Data" },
];

export const DEFAULT_SETTINGS = {
  company: {
    name: "Pahachan",
    supportEmail: "ops@pahachan.example",
    phone: "+91 98000 00000",
    website: "https://pahachan.example",
    address: "Sector 44, Industrial Area",
    city: "Gurugram",
    state: "Haryana",
    country: "India",
    pin: "122003",
    gstin: "",
  },
  preferences: {
    currency: "INR",
    timezone: "Asia/Kolkata",
    dateFormat: "DD MMM YYYY",
    language: "en-IN",
  },
  commerce: {
    invoicePrefix: "PHN",
    invoiceFormat: "PHN-{YYYY}-{####}",
    returnWindowDays: 7,
    taxNote: "GST as per company ledger",
  },
  alerts: {
    newOrders: true,
    paymentFailure: true,
    newBrand: true,
    pendingApproval: true,
    refunds: true,
  },
};

export function normalizeSettings(raw) {
  if (!raw || typeof raw !== "object") return structuredClone(DEFAULT_SETTINGS);

  // Current nested shape
  if (raw.company && typeof raw.company === "object") {
    return {
      company: { ...DEFAULT_SETTINGS.company, ...pick(raw.company, DEFAULT_SETTINGS.company) },
      preferences: { ...DEFAULT_SETTINGS.preferences, ...pick(raw.preferences || {}, DEFAULT_SETTINGS.preferences) },
      commerce: {
        ...DEFAULT_SETTINGS.commerce,
        ...pick(raw.commerce || {}, DEFAULT_SETTINGS.commerce),
        returnWindowDays: Number((raw.commerce || {}).returnWindowDays ?? DEFAULT_SETTINGS.commerce.returnWindowDays) || 7,
      },
      alerts: {
        ...DEFAULT_SETTINGS.alerts,
        ...(raw.alerts || pick(raw.notifications || {}, DEFAULT_SETTINGS.alerts)),
      },
    };
  }

  // Legacy flat Settings page
  return {
    company: {
      ...DEFAULT_SETTINGS.company,
      name: raw.company || DEFAULT_SETTINGS.company.name,
      supportEmail: raw.email || DEFAULT_SETTINGS.company.supportEmail,
      phone: raw.phone || DEFAULT_SETTINGS.company.phone,
      city: raw.city || DEFAULT_SETTINGS.company.city,
    },
    preferences: {
      ...DEFAULT_SETTINGS.preferences,
      currency: raw.currency || DEFAULT_SETTINGS.preferences.currency,
    },
    commerce: {
      ...DEFAULT_SETTINGS.commerce,
      taxNote: raw.tax || DEFAULT_SETTINGS.commerce.taxNote,
    },
    alerts: { ...DEFAULT_SETTINGS.alerts },
  };
}

function pick(source, template) {
  const out = {};
  Object.keys(template).forEach((key) => {
    if (source[key] !== undefined) out[key] = source[key];
  });
  return out;
}

export function settingsCurrency(settings) {
  return normalizeSettings(settings).preferences.currency;
}

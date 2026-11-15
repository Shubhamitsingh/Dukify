/** Provider catalog for the Integrations Hub. Status is session/demo only until real APIs exist. */

export const INTEGRATION_CATEGORIES = [
  { id: "All", label: "All" },
  { id: "Payments", label: "Payments" },
  { id: "Shipping", label: "Shipping" },
  { id: "Communication", label: "Communication" },
  { id: "Marketing", label: "Marketing" },
  { id: "Analytics", label: "Analytics" },
  { id: "Support", label: "Support" },
  { id: "Security", label: "Security" },
];

export const INTEGRATION_STATUSES = ["Connected", "Not Connected", "Error", "Testing"];

/**
 * @typedef {{ key: string, label: string, type?: 'text'|'password'|'url', required?: boolean, placeholder?: string }} CredentialField
 * @typedef {{
 *   id: string,
 *   name: string,
 *   category: string,
 *   description: string,
 *   docsUrl: string,
 *   scope: 'platform'|'brand',
 *   icon: string,
 *   fields: CredentialField[],
 * }} IntegrationProvider
 */

/** @type {IntegrationProvider[]} */
export const INTEGRATION_PROVIDERS = [
  {
    id: "razorpay",
    name: "Razorpay",
    category: "Payments",
    description: "Cards, UPI and net banking for brand checkouts.",
    docsUrl: "https://razorpay.com/docs/",
    scope: "brand",
    icon: "credit-card",
    fields: [
      { key: "keyId", label: "Key ID", type: "text", required: true, placeholder: "rzp_live_…" },
      { key: "keySecret", label: "Key Secret", type: "password", required: true, placeholder: "Secret key" },
      { key: "webhookSecret", label: "Webhook secret", type: "password", required: false, placeholder: "Optional" },
    ],
  },
  {
    id: "cashfree",
    name: "Cashfree",
    category: "Payments",
    description: "Payments and COD reconciliation for brand orders.",
    docsUrl: "https://www.cashfree.com/docs/",
    scope: "brand",
    icon: "wallet",
    fields: [
      { key: "appId", label: "App ID", type: "text", required: true, placeholder: "App ID" },
      { key: "secretKey", label: "Secret key", type: "password", required: true, placeholder: "Secret key" },
    ],
  },
  {
    id: "shiprocket",
    name: "Shiprocket",
    category: "Shipping",
    description: "Courier rates, pickup and AWB for brand shipping.",
    docsUrl: "https://apidocs.shiprocket.in/",
    scope: "brand",
    icon: "truck",
    fields: [
      { key: "email", label: "API email", type: "text", required: true, placeholder: "api@brand.example" },
      { key: "password", label: "API password", type: "password", required: true, placeholder: "API password" },
    ],
  },
  {
    id: "delhivery",
    name: "Delhivery",
    category: "Shipping",
    description: "Pan-India logistics labels and tracking for brands.",
    docsUrl: "https://www.delhivery.com/developers/",
    scope: "brand",
    icon: "package",
    fields: [
      { key: "apiToken", label: "API token", type: "password", required: true, placeholder: "Token" },
      { key: "clientName", label: "Client name", type: "text", required: true, placeholder: "Client name" },
    ],
  },
  {
    id: "msg91",
    name: "MSG91",
    category: "Communication",
    description: "Central SMS and OTP delivery for the platform.",
    docsUrl: "https://docs.msg91.com/",
    scope: "platform",
    icon: "message-square",
    fields: [
      { key: "authKey", label: "Auth key", type: "password", required: true, placeholder: "Auth key" },
      { key: "senderId", label: "Sender ID", type: "text", required: true, placeholder: "PAHCHN" },
    ],
  },
  {
    id: "whatsapp-meta",
    name: "WhatsApp Business Cloud API",
    category: "Communication",
    description: "Meta Cloud API for brand or platform WhatsApp messaging.",
    docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api/",
    scope: "brand",
    icon: "messages-square",
    fields: [
      { key: "phoneNumberId", label: "Phone number ID", type: "text", required: true, placeholder: "Phone number ID" },
      { key: "accessToken", label: "Access token", type: "password", required: true, placeholder: "Access token" },
      { key: "wabaId", label: "WABA ID", type: "text", required: false, placeholder: "Optional" },
    ],
  },
  {
    id: "amazon-ses",
    name: "Amazon SES",
    category: "Communication",
    description: "Central transactional email for the platform.",
    docsUrl: "https://docs.aws.amazon.com/ses/",
    scope: "platform",
    icon: "mail",
    fields: [
      { key: "accessKeyId", label: "Access key ID", type: "text", required: true, placeholder: "AKIA…" },
      { key: "secretAccessKey", label: "Secret access key", type: "password", required: true, placeholder: "Secret" },
      { key: "region", label: "Region", type: "text", required: true, placeholder: "ap-south-1" },
      { key: "fromEmail", label: "From email", type: "text", required: true, placeholder: "ops@pahachan.example" },
    ],
  },
  {
    id: "meta-pixel",
    name: "Meta Pixel",
    category: "Marketing",
    description: "Browser pixel events for brand storefronts.",
    docsUrl: "https://developers.facebook.com/docs/meta-pixel/",
    scope: "brand",
    icon: "target",
    fields: [
      { key: "pixelId", label: "Pixel ID", type: "text", required: true, placeholder: "Pixel ID" },
    ],
  },
  {
    id: "meta-capi",
    name: "Meta Conversions API",
    category: "Marketing",
    description: "Server-side conversion events per brand.",
    docsUrl: "https://developers.facebook.com/docs/marketing-api/conversions-api/",
    scope: "brand",
    icon: "radio",
    fields: [
      { key: "pixelId", label: "Pixel ID", type: "text", required: true, placeholder: "Pixel ID" },
      { key: "accessToken", label: "Access token", type: "password", required: true, placeholder: "Access token" },
    ],
  },
  {
    id: "ga4",
    name: "Google Analytics 4",
    category: "Analytics",
    description: "Storefront measurement IDs for each brand.",
    docsUrl: "https://developers.google.com/analytics/devguides/collection/ga4",
    scope: "brand",
    icon: "bar-chart-3",
    fields: [
      { key: "measurementId", label: "Measurement ID", type: "text", required: true, placeholder: "G-XXXXXXXX" },
      { key: "apiSecret", label: "API secret", type: "password", required: false, placeholder: "Optional" },
    ],
  },
  {
    id: "chatwoot",
    name: "Chatwoot",
    category: "Support",
    description: "Central customer support inbox for the platform.",
    docsUrl: "https://www.chatwoot.com/docs/",
    scope: "platform",
    icon: "headset",
    fields: [
      { key: "baseUrl", label: "Base URL", type: "url", required: true, placeholder: "https://app.chatwoot.com" },
      { key: "accountId", label: "Account ID", type: "text", required: true, placeholder: "Account ID" },
      { key: "apiToken", label: "API token", type: "password", required: true, placeholder: "API token" },
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "Security",
    description: "DNS, SSL and edge protection for the platform.",
    docsUrl: "https://developers.cloudflare.com/",
    scope: "platform",
    icon: "shield",
    fields: [
      { key: "apiToken", label: "API token", type: "password", required: true, placeholder: "API token" },
      { key: "zoneId", label: "Zone ID", type: "text", required: true, placeholder: "Zone ID" },
    ],
  },
  {
    id: "sentry",
    name: "Sentry",
    category: "Security",
    description: "Error monitoring for Super Admin and storefronts.",
    docsUrl: "https://docs.sentry.io/",
    scope: "platform",
    icon: "bug",
    fields: [
      { key: "dsn", label: "DSN", type: "password", required: true, placeholder: "https://…@o….ingest.sentry.io/…" },
      { key: "environment", label: "Environment", type: "text", required: false, placeholder: "production" },
    ],
  },
];

export function getProviderById(id) {
  return INTEGRATION_PROVIDERS.find((provider) => provider.id === id) || null;
}

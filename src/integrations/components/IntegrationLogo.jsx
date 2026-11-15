const logoSrc = {
  razorpay: "/integrations/razorpay.svg",
  cashfree: "/integrations/cashfree.png",
  shiprocket: "/integrations/shiprocket.png",
  delhivery: "/integrations/delhivery.png",
  msg91: "/integrations/msg91.png",
  "whatsapp-meta": "/integrations/whatsapp.svg",
  "amazon-ses": "/integrations/amazonaws.png",
  "meta-pixel": "/integrations/meta.svg",
  "meta-capi": "/integrations/facebook.svg",
  ga4: "/integrations/googleanalytics.svg",
  chatwoot: "/integrations/chatwoot.svg",
  cloudflare: "/integrations/cloudflare.svg",
  sentry: "/integrations/sentry.svg",
};

export function IntegrationLogo({ providerId, name, className = "h-12 w-12" }) {
  const src = logoSrc[providerId];

  return (
    <span className={`inline-flex items-center justify-center ${className}`} title={name}>
      {src ? (
        <img src={src} alt={name || ""} className="h-full w-full object-contain" loading="lazy" />
      ) : (
        <span className="text-sm font-bold text-pink-600">{(name || "?").slice(0, 2)}</span>
      )}
    </span>
  );
}

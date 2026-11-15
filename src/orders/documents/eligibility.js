/**
 * Label / document eligibility.
 * Official courier PDF/labelUrl always wins when present (future API).
 */

export function getShipmentPrintState(order) {
  const courier = String(order.courier || "").trim();
  const awb = String(order.awb || "").trim();
  const officialUrl = order.courierLabelUrl || order.labelUrl || null;
  const officialPdf = order.courierLabelPdf || null;

  if (!courier) {
    return {
      canPreviewShippingLabel: false,
      canPrintOfficial: false,
      mode: "no_courier",
      reason: "Assign a courier before printing a shipping label.",
      barcodeValue: null,
      displayAwb: null,
      officialUrl,
      officialPdf,
    };
  }

  if (officialUrl || officialPdf) {
    return {
      canPreviewShippingLabel: true,
      canPrintOfficial: true,
      mode: "official",
      reason: "Official courier label available.",
      barcodeValue: awb || null,
      displayAwb: awb || null,
      officialUrl,
      officialPdf,
    };
  }

  // Mock mode — preview template only, never treated as live courier label
  return {
    canPreviewShippingLabel: true,
    canPrintOfficial: false,
    mode: "mock_preview",
    reason: awb
      ? "Mock preview only — this is not an official courier label. Live API will supply the real PDF/barcode."
      : "Mock preview only — AWB not assigned by courier yet. Sample barcode uses order reference for layout demo.",
    barcodeValue: awb || `MOCK${String(order.id || "").replace(/\D/g, "")}`,
    displayAwb: awb || null,
    officialUrl: null,
    officialPdf: null,
  };
}

export function isEligibleForBulkShippingLabel(order) {
  return Boolean(String(order.courier || "").trim());
}

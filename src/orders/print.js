import { inr } from "../data";
import { orderItems } from "../work";

/** Build a clear ship-to block for packing / courier labels. */
export function getShipTo(order) {
  if (order.shippingAddress && typeof order.shippingAddress === "object") {
    const a = order.shippingAddress;
    return {
      name: a.name || order.customerName || order.customer || "—",
      phone: a.phone || order.customerPhone || "—",
      email: a.email || order.customerEmail || "",
      line1: a.line1 || "",
      line2: a.line2 || "",
      city: a.city || "",
      state: a.state || "",
      pincode: a.pincode || a.pin || "",
      country: a.country || "India",
      full: formatShipToLines({ ...a, name: a.name || order.customerName }).join(", "),
    };
  }

  const raw = String(order.address || "").trim();
  const [left = "", right = ""] = raw.split("·").map((part) => part.trim());
  const pin = (right.match(/\d{6}/) || left.match(/\d{6}/) || [""])[0];
  const chunks = left
    .replace(/\d{6}/, "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const city = chunks.length > 1 ? chunks[chunks.length - 1] : chunks[0] || "";
  const line1 = chunks.length > 1 ? chunks.slice(0, -1).join(", ") : chunks[0] || raw || "Address missing";

  return {
    name: order.customerName || String(order.customer || "").replace(/^Customer ·\s*/, "") || "—",
    phone: order.customerPhone || "—",
    email: order.customerEmail || "",
    line1,
    line2: "",
    city,
    state: order.state || "",
    pincode: pin,
    country: "India",
    full: raw || "Address missing",
  };
}

function formatShipToLines(ship) {
  return [ship.line1, ship.line2, ship.city, ship.state, ship.pincode, ship.country].filter(Boolean);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Print packing slip (inside parcel / pack station) or address label (stick on parcel for courier).
 * Browser print only — not a live courier thermal label API.
 */
export function printOrderDocument(order, type = "packing-slip") {
  const ship = getShipTo(order);
  const items = orderItems(order);
  const pay = order.paymentStatus || order.payment || "Pending";
  const ful = order.fulfillmentStatus || order.fulfilment || "New";
  const isLabel = type === "address-label";

  const itemRows = items
    .map(
      (line) => `
      <tr>
        <td>${escapeHtml(line.sku)}</td>
        <td>${escapeHtml(line.product)}${line.variant ? `<div class="muted">${escapeHtml(line.variant)}</div>` : ""}</td>
        <td class="num">${escapeHtml(line.qty)}</td>
        ${isLabel ? "" : `<td class="num">${escapeHtml(inr(line.value))}</td>`}
      </tr>`,
    )
    .join("");

  const addressBlock = `
    <div class="ship">
      <div class="tag">Ship to</div>
      <div class="name">${escapeHtml(ship.name)}</div>
      <div>${escapeHtml(ship.phone)}</div>
      ${ship.email ? `<div class="muted">${escapeHtml(ship.email)}</div>` : ""}
      <div class="addr">
        ${escapeHtml(ship.line1)}<br/>
        ${ship.line2 ? `${escapeHtml(ship.line2)}<br/>` : ""}
        ${escapeHtml([ship.city, ship.state].filter(Boolean).join(", "))}
        ${ship.pincode ? ` — ${escapeHtml(ship.pincode)}` : ""}<br/>
        ${escapeHtml(ship.country || "India")}
      </div>
    </div>`;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${isLabel ? "Address label" : "Packing slip"} · ${escapeHtml(order.id)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 24px; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .muted { color: #666; font-size: 12px; }
    .row { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
    .ship { border: 2px solid #111; padding: 12px 14px; min-width: 280px; }
    .tag { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #444; margin-bottom: 6px; }
    .name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
    .addr { margin-top: 8px; line-height: 1.45; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border-bottom: 1px solid #ddd; padding: 8px 6px; text-align: left; font-size: 13px; vertical-align: top; }
    th { font-size: 11px; text-transform: uppercase; color: #555; }
    .num { text-align: right; white-space: nowrap; }
    .badge { display: inline-block; border: 1px solid #333; padding: 2px 8px; font-size: 11px; margin-right: 6px; }
    .foot { margin-top: 18px; font-size: 11px; color: #666; }
    .cod { font-weight: 700; font-size: 14px; margin-top: 10px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="row">
    <div>
      <h1>${isLabel ? "Shipping address label" : "Packing slip"}</h1>
      <div class="muted">Pahachan central fulfillment · mock print</div>
      <div style="margin-top:10px">
        <span class="badge">${escapeHtml(order.id)}</span>
        <span class="badge">${escapeHtml(order.brand || "")}</span>
        <span class="badge">${escapeHtml(ful)}</span>
        <span class="badge">${escapeHtml(pay)}</span>
      </div>
      <div class="muted" style="margin-top:8px">Order date · ${escapeHtml(order.date || "—")}</div>
      ${order.awb ? `<div class="muted">AWB · ${escapeHtml(order.awb)} · ${escapeHtml(order.courier || "")}</div>` : `<div class="muted">AWB · not generated yet</div>`}
      ${pay === "COD" || order.method === "COD" ? `<div class="cod">COD — collect ${escapeHtml(inr(order.value))}</div>` : ""}
    </div>
    ${addressBlock}
  </div>

  <div class="muted">From / pickup · ${escapeHtml(order.pickupLocation || "Central warehouse")}</div>

  <table>
    <thead>
      <tr>
        <th>SKU</th>
        <th>Product</th>
        <th class="num">Qty</th>
        ${isLabel ? "" : "<th class=\"num\">Line</th>"}
      </tr>
    </thead>
    <tbody>
      ${itemRows || `<tr><td colspan="${isLabel ? 3 : 4}">No line items</td></tr>`}
    </tbody>
  </table>

  ${
    isLabel
      ? `<p class="foot">Stick this address label on the parcel for the courier. Verify name, phone and PIN before handover.</p>`
      : `<p class="foot">Pack station slip — verify every SKU/qty before sealing. Carrier thermal label (when live) is separate from this document.</p>`
  }
</body>
</html>`;

  // Hidden iframe print — avoids opening a blank "new website" browser tab.
  const existing = document.getElementById("pahachan-print-frame");
  if (existing) existing.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "pahachan-print-frame";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!frameDoc || !iframe.contentWindow) {
    window.alert("Could not prepare print view in this browser.");
    iframe.remove();
    return false;
  }

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } finally {
      window.setTimeout(() => iframe.remove(), 1000);
    }
  };

  if (frameDoc.readyState === "complete") {
    triggerPrint();
  } else {
    iframe.onload = triggerPrint;
    window.setTimeout(triggerPrint, 250);
  }
  return true;
}

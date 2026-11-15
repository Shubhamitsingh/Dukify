import { inr } from "../../data";
import { orderItems } from "../../work";
import { getShipTo } from "../print";
import { barcodeSvg } from "./barcode";
import { getShipmentPrintState } from "./eligibility";
import { PAGE_CSS } from "./types";

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shipFrom(order, settings) {
  const printing = settings?.printing || {};
  const company = settings?.company || {};
  return {
    name: order.pickupLocation || printing.defaultPickupName || "Central warehouse",
    line1: printing.returnAddress || company.address || "Sector 44, Industrial Area",
    city: printing.returnCity || company.city || "Gurugram",
    state: printing.returnState || company.state || "Haryana",
    pincode: printing.returnPin || company.pin || "122003",
    phone: printing.returnPhone || company.phone || "+91 98000 00000",
  };
}

function baseShell({ title, pageSize, body, extraCss = "" }) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #000; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    ${PAGE_CSS[pageSize] || PAGE_CSS.A4}
    ${extraCss}
  </style>
</head>
<body>${body}</body>
</html>`;
}

export function buildShippingLabelHtml(order, settings = {}) {
  const state = getShipmentPrintState(order);
  const ship = getShipTo(order);
  const from = shipFrom(order, settings);
  const items = orderItems(order).slice(0, 6);
  const pay = order.paymentStatus || order.payment || "Pending";
  const isCod = pay === "COD" || order.method === "COD";
  const showPhone = settings?.printing?.showCustomerPhone !== false;
  const showProducts = settings?.printing?.showProductDetails !== false;
  const packages = Number(order.packageCount || 1);
  const seq = Number(order.packageSequence || 1);
  const weight = order.weightKg != null ? `${order.weightKg} kg` : "—";
  const dims = order.dimensions || "—";
  const barcodeValue = state.barcodeValue || "MOCK";
  const awbLine = state.displayAwb || "AWB PENDING (mock preview)";

  const productLines = showProducts
    ? items
        .map(
          (line) =>
            `<div class="line"><span>${esc(line.sku)}</span><span>${esc(line.product)}${line.variant ? ` · ${esc(line.variant)}` : ""}</span><span>×${esc(line.qty)}</span></div>`,
        )
        .join("")
    : "";

  const body = `
  <div class="sheet label">
    <div class="mock-banner">MOCK PREVIEW — NOT A VALID COURIER LABEL · Not for live handover</div>
    <div class="header">
      <div>
        <div class="courier">${esc(order.courier || "COURIER")}</div>
        <div class="svc">Surface / Standard · ${esc(order.shippingStatus || "Label")}</div>
      </div>
      <div class="route">
        <div class="hub">DEST PIN</div>
        <div class="pin">${esc(ship.pincode || "————")}</div>
      </div>
    </div>
    <div class="awb-block">
      <div class="awb-label">AWB / CONSIGNMENT</div>
      <div class="awb">${esc(awbLine)}</div>
      <div class="barcode">${barcodeSvg(barcodeValue, { height: 42, narrow: 1.05 })}</div>
      <div class="refs">Order ${esc(order.id)} · Ref ${esc(order.id)}</div>
      ${!state.displayAwb ? `<div class="warn">Sample barcode for layout only — not a courier-assigned AWB</div>` : `<div class="warn">Mock template — replace with official courier PDF when API is live</div>`}
    </div>
    <div class="ship-to">
      <div class="tag">DELIVER TO</div>
      <div class="name">${esc(ship.name)}</div>
      ${showPhone ? `<div class="phone">${esc(ship.phone)}</div>` : ""}
      <div class="addr">
        ${esc(ship.line1)}${ship.line2 ? `<br/>${esc(ship.line2)}` : ""}<br/>
        ${esc([ship.city, ship.state].filter(Boolean).join(", "))}<br/>
        <strong>PIN ${esc(ship.pincode || "—")}</strong> · ${esc(ship.country || "India")}
      </div>
    </div>
    <div class="meta-row">
      <div class="pay ${isCod ? "cod" : ""}">
        <div class="tag">${isCod ? "COD" : "PREPAID"}</div>
        ${isCod ? `<div class="amt">Collect ${esc(inr(order.value))}</div>` : `<div class="amt">Do not collect</div>`}
        <div class="sub">Order ${esc(inr(order.value))}</div>
      </div>
      <div class="pkg">
        <div class="tag">PACKAGE</div>
        <div>${esc(seq)} of ${esc(packages)}</div>
        <div class="sub">Wt ${esc(weight)} · ${esc(dims)}</div>
      </div>
    </div>
    <div class="ship-from">
      <div class="tag">SHIP FROM / RETURN</div>
      <div>${esc(from.name)}</div>
      <div>${esc(from.line1)}, ${esc(from.city)}, ${esc(from.state)} ${esc(from.pincode)}</div>
      <div>${esc(from.phone)}</div>
    </div>
    ${showProducts && productLines ? `<div class="products"><div class="tag">CONTENTS</div>${productLines}</div>` : ""}
  </div>`;

  const extraCss = `
    .label { padding: 0.12in; display: flex; flex-direction: column; gap: 0.08in; font-size: 9.5px; line-height: 1.25; }
    .mock-banner { background: #000; color: #fff; text-align: center; font-size: 8px; font-weight: 700; letter-spacing: 0.04em; padding: 3px 4px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 4px; }
    .courier { font-size: 14px; font-weight: 800; text-transform: uppercase; }
    .svc { font-size: 8px; }
    .hub { font-size: 7px; letter-spacing: 0.06em; }
    .pin { font-size: 16px; font-weight: 800; }
    .awb-block { text-align: center; border: 1.5px solid #000; padding: 4px; }
    .awb-label { font-size: 7px; letter-spacing: 0.08em; }
    .awb { font-size: 13px; font-weight: 800; margin: 2px 0; }
    .barcode { display: flex; justify-content: center; margin: 2px 0; }
    .barcode svg { max-width: 100%; height: 42px; }
    .refs { font-size: 8px; }
    .warn { font-size: 7px; margin-top: 2px; }
    .ship-to { border: 2px solid #000; padding: 6px; flex: 1; }
    .tag { font-size: 7px; letter-spacing: 0.08em; font-weight: 700; margin-bottom: 2px; }
    .name { font-size: 13px; font-weight: 800; }
    .phone { font-size: 11px; font-weight: 700; }
    .addr { margin-top: 3px; font-size: 10px; }
    .meta-row { display: grid; grid-template-columns: 1.2fr 1fr; gap: 4px; }
    .pay, .pkg { border: 1.5px solid #000; padding: 4px; }
    .pay.cod { background: #000; color: #fff; }
    .pay.cod .tag, .pay.cod .sub { color: #fff; }
    .amt { font-size: 12px; font-weight: 800; }
    .sub { font-size: 8px; }
    .ship-from { border-top: 1px solid #000; padding-top: 3px; font-size: 8px; }
    .products { border-top: 1px dashed #000; padding-top: 3px; }
    .line { display: grid; grid-template-columns: 0.9fr 1.4fr auto; gap: 4px; font-size: 7.5px; }
  `;

  return baseShell({
    title: `Shipping label · ${order.id}`,
    pageSize: settings?.printing?.labelSize === "A4" ? "A4" : "4x6",
    body,
    extraCss,
  });
}

export function buildPackingSlipHtml(order, settings = {}) {
  const ship = getShipTo(order);
  const items = orderItems(order);
  const rows = items
    .map(
      (line) =>
        `<tr><td>${esc(line.sku)}</td><td>${esc(line.product)}${line.variant ? ` · ${esc(line.variant)}` : ""}</td><td class="num">${esc(line.qty)}</td><td class="num">${esc(inr(line.value))}</td></tr>`,
    )
    .join("");
  const body = `
  <div class="sheet">
    <h1>Packing slip</h1>
    <p class="muted">Pahachan central fulfillment · ${esc(order.brand)} · ${esc(order.id)}</p>
    <div class="grid">
      <div>
        <h2>Ship to</h2>
        <p><strong>${esc(ship.name)}</strong><br/>${esc(ship.phone)}<br/>${esc(ship.line1)}<br/>${esc(ship.city)} ${esc(ship.pincode)}</p>
      </div>
      <div>
        <h2>Order</h2>
        <p>Date ${esc(order.date)}<br/>Payment ${esc(order.paymentStatus || order.payment)} · ${esc(order.method)}<br/>Courier ${esc(order.courier || "Not assigned")}<br/>AWB ${esc(order.awb || "—")}</p>
      </div>
    </div>
    <table>
      <thead><tr><th>SKU</th><th>Product</th><th class="num">Qty</th><th class="num">Line</th></tr></thead>
      <tbody>${rows || "<tr><td colspan='4'>No items</td></tr>"}</tbody>
    </table>
    <p class="foot">Verify every SKU before sealing. Shipping label is a separate document.</p>
  </div>`;
  return baseShell({
    title: `Packing slip · ${order.id}`,
    pageSize: "A4",
    body,
    extraCss: a4DocCss(),
  });
}

export function buildTaxInvoiceHtml(order, settings = {}) {
  const company = settings.company || {};
  const ship = getShipTo(order);
  const items = orderItems(order);
  const rows = items
    .map(
      (line, index) =>
        `<tr><td>${index + 1}</td><td>${esc(line.product)}<div class="muted">${esc(line.sku)}</div></td><td class="num">${esc(line.qty)}</td><td class="num">${esc(inr(Number(line.value) / Math.max(1, Number(line.qty) || 1)))}</td><td class="num">${esc(inr(line.value))}</td></tr>`,
    )
    .join("");
  const body = `
  <div class="sheet">
    <h1>Tax invoice</h1>
    <p class="muted">Mock invoice for session demo · ${esc(company.name || "Pahachan")}</p>
    <div class="grid">
      <div>
        <h2>Seller</h2>
        <p>${esc(company.name || "Pahachan")}<br/>${esc(company.address || "")}<br/>${esc(company.city || "")} ${esc(company.pin || "")}<br/>GSTIN ${esc(company.gstin || "—")}</p>
      </div>
      <div>
        <h2>Bill to / Ship to</h2>
        <p><strong>${esc(ship.name)}</strong><br/>${esc(ship.line1)}<br/>${esc(ship.city)} ${esc(ship.pincode)}<br/>${esc(ship.phone)}</p>
      </div>
    </div>
    <p>Invoice for order <strong>${esc(order.id)}</strong> · ${esc(order.date)} · Brand ${esc(order.brand)}</p>
    <table>
      <thead><tr><th>#</th><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="total">Total payable · ${esc(inr(order.value))} · ${esc(order.paymentStatus || order.payment)} · ${esc(order.method)}</p>
    <p class="foot">This mock invoice is not a GST-compliant e-invoice. Wire finance module / GSTN later.</p>
  </div>`;
  return baseShell({ title: `Tax invoice · ${order.id}`, pageSize: "A4", body, extraCss: a4DocCss() });
}

export function buildPickupManifestHtml(order, settings = {}) {
  const from = shipFrom(order, settings);
  const ship = getShipTo(order);
  const body = `
  <div class="sheet">
    <h1>Pickup manifest</h1>
    <p class="muted">Handover sheet for courier pickup · mock</p>
    <table>
      <thead><tr><th>Field</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Order</td><td>${esc(order.id)}</td></tr>
        <tr><td>Brand</td><td>${esc(order.brand)}</td></tr>
        <tr><td>Courier</td><td>${esc(order.courier || "Not assigned")}</td></tr>
        <tr><td>AWB</td><td>${esc(order.awb || "—")}</td></tr>
        <tr><td>Pickup</td><td>${esc(from.name)} · ${esc(from.line1)}, ${esc(from.city)} ${esc(from.pincode)}</td></tr>
        <tr><td>Deliver to</td><td>${esc(ship.name)} · ${esc(ship.city)} ${esc(ship.pincode)} · ${esc(ship.phone)}</td></tr>
        <tr><td>Payment</td><td>${esc(order.method)} · ${esc(order.paymentStatus || order.payment)} · ${esc(inr(order.value))}</td></tr>
        <tr><td>Packages</td><td>${esc(order.packageCount || 1)}</td></tr>
      </tbody>
    </table>
    <p class="foot">Courier signature ________________ · Date ________ · This is not a live manifest API document.</p>
  </div>`;
  return baseShell({ title: `Pickup manifest · ${order.id}`, pageSize: "A4", body, extraCss: a4DocCss() });
}

function a4DocCss() {
  return `
    .sheet { padding: 4mm 0; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    h2 { font-size: 12px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.06em; }
    .muted { color: #444; font-size: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border-bottom: 1px solid #222; padding: 8px 6px; text-align: left; font-size: 12px; vertical-align: top; }
    th { font-size: 10px; text-transform: uppercase; }
    .num { text-align: right; }
    .total { font-size: 14px; font-weight: 700; margin-top: 14px; }
    .foot { margin-top: 18px; font-size: 11px; color: #444; }
  `;
}

export function buildDocumentHtml(type, order, settings = {}) {
  if (type === "shipping-label") return buildShippingLabelHtml(order, settings);
  if (type === "tax-invoice") return buildTaxInvoiceHtml(order, settings);
  if (type === "pickup-manifest") return buildPickupManifestHtml(order, settings);
  return buildPackingSlipHtml(order, settings);
}

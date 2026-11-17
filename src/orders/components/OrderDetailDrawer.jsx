import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { inr } from "../../data";
import { ModalShell, SoftButton, Status } from "../../ui";
import { COURIERS, PICKUP_LOCATIONS } from "../constants";
import { applyOrderAction, availableActions, fulfillmentOf, paymentOf } from "../model";
import { printOrderDocument } from "../print";

function copyText(value) {
  if (!value || !navigator.clipboard) return;
  navigator.clipboard.writeText(String(value));
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-gray-200/80 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
      <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">{title}</p>
      {children}
    </section>
  );
}

export function OrderDetailDrawer({ order, brand, onClose, onApply }) {
  const [courier, setCourier] = useState(order.courier || "Shiprocket");
  const [pickup, setPickup] = useState(order.pickupLocationId || "WH-01");
  const [message, setMessage] = useState("");

  const actions = useMemo(() => availableActions(order), [order]);
  const ful = fulfillmentOf(order);
  const pay = paymentOf(order);

  const run = (actionId) => {
    const next = applyOrderAction(order, actionId, { courier, pickupLocationId: pickup });
    onApply(next, actionId);
    setMessage(
      actionId.includes("awb") || actionId.includes("courier") || actionId.includes("pickup") || actionId.includes("out_for")
        ? "Mock action applied in this browser session — no live courier API call."
        : "Order updated in this browser session.",
    );
  };

  return (
    <ModalShell
      title={order.id}
      eyebrow="Order details"
      align="center"
      size="lg"
      className="border-sky-200 dark:border-sky-900/60"
      onClose={onClose}
      footer={
        <div className="space-y-2">
          {message ? <p className="text-center text-[11px] text-amber-700 dark:text-amber-300">{message}</p> : null}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:bg-gray-900 dark:text-sky-300"
              onClick={() => printOrderDocument(order, "packing-slip")}
            >
              Print packing slip
            </button>
            <button
              type="button"
              className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:bg-gray-900 dark:text-sky-300"
              onClick={() => printOrderDocument(order, "address-label")}
            >
              Print address label
            </button>
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-600/20 transition hover:bg-sky-700"
                onClick={() => run(action.id)}
              >
                {action.label}
              </button>
            ))}
            {!actions.length ? <SoftButton onClick={onClose}>Close</SoftButton> : null}
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Status value={ful} />
          <Status value={pay} />
          <Status value={order.shippingStatus} />
          <span className="text-xs text-gray-500">{order.date}</span>
        </div>

        <Section title="Brand">
          <div className="grid gap-1 text-sm">
            <p className="font-semibold text-gray-900 dark:text-white">{order.brand}</p>
            <p className="text-xs text-gray-500">
              {order.brandId || brand?.id || "—"} · {order.brandDomain || brand?.domain || "—"}
            </p>
            <p className="text-xs text-gray-500">
              {order.brandEmail || brand?.email || "—"} · {order.brandPhone || brand?.phone || "—"}
            </p>
          </div>
        </Section>

        <Section title="Ship to (for courier label)">
          <div className="space-y-2 text-sm">
            <RowCopy label="Name" value={order.shipTo?.name || order.customerName} />
            <RowCopy label="Phone" value={order.shipTo?.phone || order.customerPhone} />
            <RowCopy label="Email" value={order.shipTo?.email || order.customerEmail || "—"} />
            <RowCopy label="Address line" value={order.shipTo?.line1 || order.address} />
            <RowCopy
              label="City / State / PIN"
              value={[order.shipTo?.city, order.shipTo?.state, order.shipTo?.pincode].filter(Boolean).join(" · ") || "—"}
            />
            <RowCopy label="Country" value={order.shipTo?.country || "India"} />
            <RowCopy label="Billing address" value={order.billingAddress || order.address} />
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Print packing slip for the carton, then print address label to stick on the parcel before courier handover.
          </p>
        </Section>

        <Section title="Ordered products">
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {(order.items || []).map((line) => (
              <li key={`${line.sku}-${line.product}`} className="flex items-start justify-between gap-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{line.product}</p>
                  <p className="text-[11px] text-gray-400">
                    {line.sku}
                    {line.variant ? ` · ${line.variant}` : ""} · Qty {line.qty}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium tabular-nums">{inr(line.value)}</p>
                  <p className="text-[11px] text-gray-400">Supply {inr(line.supply || 0)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Payment summary">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <Meta label="Method" value={order.method} />
            <Meta label="Provider" value={order.paymentProvider || "—"} />
            <Meta label="Transaction" value={order.transactionId || "—"} />
            <Meta label="Status" value={pay} />
            <Meta label="Subtotal" value={inr(order.subtotal ?? order.value)} />
            <Meta label="Discount" value={inr(order.discount || 0)} />
            <Meta label="Shipping" value={inr(order.shippingFee || 0)} />
            <Meta label="Tax" value={inr(order.tax || 0)} />
            <Meta label="COD charge" value={inr(order.codCharge || 0)} />
            <Meta label="Total" value={inr(order.value)} />
          </dl>
          <p className="mt-2 text-[11px] text-gray-400">Payment status is independent of fulfillment and shipping.</p>
        </Section>

        <Section title="Shipping">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <Meta label="Pickup" value={order.pickupLocation || "Central warehouse"} />
            <Meta label="Courier" value={order.courier || "Not assigned"} />
            <Meta label="AWB" value={order.awb || "—"} />
            <Meta label="Shipping status" value={order.shippingStatus} />
            <Meta label="Carrier label" value={order.awb ? "AWB on file (mock)" : "Not generated — print address label for pack desk"} />
          </dl>
          {(ful === "Ready to Ship" || actions.some((action) => action.id === "assign_courier")) && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="text-xs">
                <span className="mb-1 block text-gray-500">Courier (mock)</span>
                <select className="input-field" value={courier} onChange={(event) => setCourier(event.target.value)}>
                  {COURIERS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs">
                <span className="mb-1 block text-gray-500">Pickup location</span>
                <select className="input-field" value={pickup} onChange={(event) => setPickup(event.target.value)}>
                  {PICKUP_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <p className="mt-2 text-[11px] text-gray-400">Mock shipping only — AWB / labels are not live courier bookings.</p>
        </Section>

        <Section title="Timeline">
          <ol className="space-y-3">
            {(order.timeline || []).map((event, index) => (
              <li key={`${event.at}-${event.event}-${index}`} className="relative border-l border-sky-200 pl-3 dark:border-sky-900/50">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{event.event}</p>
                <p className="text-[11px] text-gray-500">{event.detail}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {event.at} · {event.actor}
                </p>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </ModalShell>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-800 dark:text-gray-100">{value}</dd>
    </div>
  );
}

function RowCopy({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="text-gray-800 dark:text-gray-100">{value || "—"}</p>
      </div>
      {value && value !== "—" ? (
        <button type="button" className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => copyText(value)}>
          <Copy className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

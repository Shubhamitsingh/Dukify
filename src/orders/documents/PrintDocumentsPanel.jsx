import { DOCUMENT_TYPES } from "./types";
import { getShipmentPrintState } from "./eligibility";

export function PrintDocumentsPanel({ order, onOpen }) {
  const state = getShipmentPrintState(order);

  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
      <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">Print documents</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {DOCUMENT_TYPES.map((doc) => {
          const disabled = doc.id === "shipping-label" && !state.canPreviewShippingLabel;
          return (
            <button
              key={doc.id}
              type="button"
              disabled={disabled}
              onClick={() => onOpen(doc.id)}
              className={`rounded-xl border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                doc.primary
                  ? "border-sky-600 bg-sky-600 text-white hover:bg-sky-700"
                  : "border-gray-200 bg-white hover:border-sky-200 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <p className={`text-xs font-semibold ${doc.primary ? "text-white" : "text-gray-900 dark:text-white"}`}>
                {doc.primary ? "Print shipping label" : doc.label}
              </p>
              <p className={`mt-0.5 text-[11px] ${doc.primary ? "text-white/80" : "text-gray-500"}`}>{doc.description}</p>
              {disabled ? <p className="mt-1 text-[11px] text-amber-100">Assign courier first</p> : null}
            </button>
          );
        })}
      </div>
      {state.mode === "mock_preview" ? (
        <p className="mt-2 text-[11px] text-gray-400">
          Shipping label opens as a mock 4×6 preview until courier APIs return the official PDF/label URL.
        </p>
      ) : null}
      {state.mode === "no_courier" ? (
        <p className="mt-2 text-[11px] text-amber-700">No courier assigned — shipping label is blocked. Packing slip and invoice remain available.</p>
      ) : null}
    </section>
  );
}

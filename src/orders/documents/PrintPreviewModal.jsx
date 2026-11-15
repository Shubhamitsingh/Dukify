import { useMemo } from "react";
import { ModalShell, SoftButton } from "../../ui";
import { DOCUMENT_TYPES } from "./types";
import { getShipmentPrintState } from "./eligibility";
import { downloadDocumentAsPdfHint, printDocumentHtml, renderOrderDocument } from "./engine";

export function PrintPreviewModal({ order, type, settings, onClose }) {
  const meta = DOCUMENT_TYPES.find((item) => item.id === type) || DOCUMENT_TYPES[0];
  const state = useMemo(() => getShipmentPrintState(order), [order]);
  const html = useMemo(() => renderOrderDocument(type, order, settings), [type, order, settings]);

  const blocked = type === "shipping-label" && !state.canPreviewShippingLabel;

  return (
    <ModalShell
      title={meta.label}
      eyebrow="Print preview"
      align="center"
      size="lg"
      className="border-sky-200 dark:border-sky-900/60"
      zClass="z-50"
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-center gap-2">
          <SoftButton onClick={onClose}>Close</SoftButton>
          {!blocked ? (
            <>
              <button
                type="button"
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                onClick={() => downloadDocumentAsPdfHint(html, `${type}-${order.id}`)}
              >
                Download HTML (Print → PDF)
              </button>
              <button
                type="button"
                className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700"
                onClick={() => {
                  if (settings?.printing?.warnDuplicatePrint) {
                    const ok = window.confirm("Print this document? Duplicate prints can confuse warehouse handover.");
                    if (!ok) return;
                  }
                  if (state.mode === "official" && state.officialUrl) {
                    window.open(state.officialUrl, "_blank", "noopener,noreferrer");
                    return;
                  }
                  printDocumentHtml(html);
                }}
              >
                Print
              </button>
            </>
          ) : null}
        </div>
      }
    >
      <div className="space-y-3">
        <dl className="grid gap-2 sm:grid-cols-2 text-sm">
          <Meta label="Document" value={meta.label} />
          <Meta label="Order" value={order.id} />
          <Meta label="Courier" value={order.courier || "Not assigned"} />
          <Meta label="Page size" value={meta.pageLabel} />
          <Meta label="Pages" value="1" />
          <Meta
            label="Label source"
            value={
              state.mode === "official" ? "Official courier document" : state.mode === "mock_preview" ? "Mock preview template" : "Blocked"
            }
          />
        </dl>

        {blocked ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
            {state.reason} Use fulfillment actions to assign Shiprocket or Delhivery first.
          </div>
        ) : (
          <>
            {type === "shipping-label" && state.mode === "mock_preview" ? (
              <div className="rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-800">
                MOCK PREVIEW — not a valid courier shipping label. Official Shiprocket/Delhivery PDF will replace this when API is connected.
              </div>
            ) : null}
            <div className="overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
              <div
                className={`mx-auto bg-white shadow-sm ${type === "shipping-label" ? "w-[4in] min-h-[6in]" : "w-full max-w-[210mm]"}`}
              >
                <iframe title="Document preview" srcDoc={html} className="h-[70vh] w-full border-0 bg-white" />
              </div>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  );
}

function Meta({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
      <dt className="text-[11px] text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-900 dark:text-white">{value}</dd>
    </div>
  );
}

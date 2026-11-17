import { SoftButton } from "../../ui";

export function BulkActionsBar({ count, onClear, onExport, onProcess, onReady, onPrintSlips }) {
  if (!count) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-leaf-200 bg-leaf-50 px-3 py-2.5 dark:border-leaf-900/40 dark:bg-leaf-950/20">
      <p className="text-xs font-semibold text-leaf-800 dark:text-leaf-200">{count} selected</p>
      <div className="flex flex-wrap gap-2">
        <SoftButton onClick={onExport}>Export selected</SoftButton>
        <SoftButton onClick={onPrintSlips}>Print packing slips</SoftButton>
        <SoftButton onClick={onProcess}>Assign processing</SoftButton>
        <SoftButton onClick={onReady}>Mark ready to ship</SoftButton>
        <button type="button" className="text-xs font-semibold text-leaf-700" onClick={onClear}>
          Clear selection
        </button>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { downloadBlob } from "../../catalogue";
import { inr } from "../../data";
import { blanks } from "../../local";
import { ModalShell, SoftButton, Surface } from "../../ui";
import { useStore } from "../../store";
import { expenseCategory, expenseHeads } from "../model";

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function ExpenseLedger() {
  const { db, add, patch, removeMany } = useStore();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(null);
  const [creating, setCreating] = useState(false);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (db.expenses || []).filter((row) => {
      if (!needle) return true;
      return `${row.id} ${row.head} ${row.month} ${row.note}`.toLowerCase().includes(needle);
    });
  }, [db.expenses, query]);

  const byCategory = useMemo(() => {
    const bag = Object.fromEntries(["Courier", "Packaging", "Warehouse", "Payment gateway", "Marketing", "Other"].map((key) => [key, 0]));
    (db.expenses || []).forEach((row) => {
      if (row.head === "Refunds") return;
      const key = expenseCategory(row.head);
      bag[key] = (bag[key] || 0) + (Number(row.amount) || 0);
    });
    return bag;
  }, [db.expenses]);

  const exportCsv = () => {
    const header = "id,head,amount,month,note";
    const lines = rows.map((row) => [row.id, row.head, row.amount, row.month, csvEscape(row.note)].join(","));
    downloadBlob("pahachan-expenses.csv", [header, ...lines].join("\n"), "text/csv;charset=utf-8");
  };

  const exportXlsx = () => {
    const data = [["ID", "Head", "Amount", "Month", "Note"], ...rows.map((row) => [row.id, row.head, row.amount, row.month, row.note])];
    const sheet = XLSX.utils.aoa_to_sheet(data);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Expenses");
    XLSX.writeFile(book, "pahachan-expenses.xlsx");
  };

  const openCreate = () => {
    setCreating(true);
    setDraft({ ...blanks.expenses });
  };

  const openEdit = (row) => {
    setCreating(false);
    setDraft({ ...row });
  };

  const save = (event) => {
    event.preventDefault();
    if (!draft) return;
    const amount = Number(draft.amount) || 0;
    if (!String(draft.head || "").trim()) return;
    if (creating) {
      add("expenses", { head: draft.head, amount, month: draft.month, note: draft.note || "" });
    } else {
      patch("expenses", draft.id, { head: draft.head, amount, month: draft.month, note: draft.note || "" }, `Expense ${draft.id} edited`);
    }
    setDraft(null);
  };

  const remove = (row) => {
    if (!window.confirm(`Delete expense ${row.id}? This only affects the browser session.`)) return;
    removeMany("expenses", [row.id]);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {Object.entries(byCategory).map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200/80 bg-white px-3 py-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-[11px] font-semibold text-gray-400 uppercase">{label}</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">{inr(value)}</p>
          </div>
        ))}
      </div>

      <Surface
        title="Expense ledger"
        action={
          <div className="flex flex-wrap gap-2">
            <SoftButton onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" />
              CSV
            </SoftButton>
            <SoftButton onClick={exportXlsx}>
              <Download className="h-3.5 w-3.5" />
              Excel
            </SoftButton>
            <button type="button" className="btn-primary" onClick={openCreate}>
              Add record
            </button>
          </div>
        }
      >
        <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-700">
          <input
            className="input-field sm:max-w-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search expenses"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2.5">ID</th>
                <th className="px-3 py-2.5">Head</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Amount</th>
                <th className="px-3 py-2.5">Month</th>
                <th className="px-3 py-2.5">Note</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2.5 font-medium">{row.id}</td>
                  <td className="px-3 py-2.5">{row.head}</td>
                  <td className="px-3 py-2.5 text-gray-500">{expenseCategory(row.head)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{inr(row.amount)}</td>
                  <td className="px-3 py-2.5">{row.month}</td>
                  <td className="px-3 py-2.5 text-gray-500">{row.note}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-2">
                      <button type="button" className="text-xs font-semibold text-sky-700" onClick={() => openEdit(row)}>
                        Edit
                      </button>
                      <button type="button" className="text-xs font-semibold text-rose-600" onClick={() => remove(row)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Surface>

      {draft ? (
        <ModalShell
          title={creating ? "Add expense" : `Edit ${draft.id}`}
          eyebrow="Expense ledger"
          align="center"
          size="md"
          onClose={() => setDraft(null)}
          footer={
            <div className="flex justify-end gap-2">
              <SoftButton onClick={() => setDraft(null)}>Cancel</SoftButton>
              <button type="submit" form="expense-form" className="btn-primary px-3 py-2 text-xs">
                {creating ? "Add to this session" : "Save edits"}
              </button>
            </div>
          }
        >
          <form id="expense-form" className="grid gap-3 sm:grid-cols-2" onSubmit={save}>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-gray-500">Head</span>
              <select
                className="input-field"
                value={draft.head}
                onChange={(event) => setDraft((current) => ({ ...current, head: event.target.value }))}
              >
                {expenseHeads().map((head) => (
                  <option key={head} value={head}>
                    {head}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-gray-500">Amount</span>
              <input
                className="input-field"
                type="number"
                value={draft.amount}
                onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-gray-500">Month</span>
              <input
                className="input-field"
                value={draft.month}
                onChange={(event) => setDraft((current) => ({ ...current, month: event.target.value }))}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-gray-500">Note</span>
              <textarea
                className="input-field min-h-20"
                value={draft.note}
                onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
              />
            </label>
          </form>
        </ModalShell>
      ) : null}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { paginate, sortRows } from "../model";

export function useReportTable(rows, { defaultSort, defaultDir = "desc", pageSize = 8, searchKeys = [] } = {}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(defaultSort);
  const [sortDir, setSortDir] = useState(defaultDir);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(needle)),
    );
  }, [rows, query, searchKeys]);

  const sorted = useMemo(() => sortRows(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);

  const pageData = useMemo(() => paginate(sorted, page, pageSize), [sorted, page, pageSize]);

  useEffect(() => {
    if (pageData.page !== page) setPage(pageData.page);
  }, [pageData.page, page]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  return {
    query,
    setQuery: (value) => {
      setQuery(value);
      setPage(1);
    },
    sortKey,
    sortDir,
    toggleSort,
    page: pageData.page,
    pages: pageData.pages,
    total: pageData.total,
    rows: pageData.rows,
    setPage,
    allRows: sorted,
  };
}

export function SortTh({ label, column, sortKey, sortDir, onSort, align = "left" }) {
  const active = sortKey === column;
  return (
    <th className={`px-3 py-2.5 ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        className={`inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase ${
          active ? "text-leaf-700" : "text-gray-500"
        }`}
        onClick={() => onSort(column)}
      >
        {label}
        <span className="text-[10px] opacity-70">{active ? (sortDir === "asc" ? "↑" : "↓") : ""}</span>
      </button>
    </th>
  );
}

export function TableSearch({ value, onChange, placeholder }) {
  return (
    <input
      className="input-field sm:max-w-xs"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

export function TablePager({ page, pages, total, onPage }) {
  if (total <= 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-3 py-2.5 text-xs text-gray-500 dark:border-gray-700">
      <span>
        {total} row{total === 1 ? "" : "s"}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-gray-200 px-2 py-1 font-semibold disabled:opacity-40 dark:border-gray-700"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Prev
        </button>
        <span className="tabular-nums">
          {page} / {pages}
        </span>
        <button
          type="button"
          className="rounded-lg border border-gray-200 px-2 py-1 font-semibold disabled:opacity-40 dark:border-gray-700"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

import { useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { downloadBlob } from "./catalogue";
import { inr } from "./data";
import { useStore } from "./store";
import { FilterChip, Kpi, PageHead, SoftButton, StatPills, Status, Surface } from "./ui";
import { approvals, exceptions } from "./work";

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadNdrCsv(rows) {
  const columns = [
    ["order", "Order"],
    ["awb", "AWB"],
    ["courier", "Courier"],
    ["ndrReason", "NDR reason"],
    ["attempts", "Attempts"],
    ["status", "Status"],
    ["charge", "Charge"],
  ];
  const header = columns.map(([, label]) => label).join(",");
  const lines = rows.map((row) =>
    columns.map(([key]) => csvEscape(key === "charge" ? inr(row.charge) : row[key] ?? "")).join(","),
  );
  downloadBlob("dukify-ndr.csv", [header, ...lines].join("\n"), "text/csv;charset=utf-8");
}

function downloadNdrXlsx(rows) {
  const data = [
    ["Order", "AWB", "Courier", "NDR reason", "Attempts", "Status", "Charge"],
    ...rows.map((row) => [row.order, row.awb, row.courier, row.ndrReason || "", row.attempts ?? 0, row.status, row.charge ?? 0]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "NDR");
  XLSX.writeFile(book, "dukify-ndr.xlsx");
}

export function NdrPage() {
  const { db, patch } = useStore();
  const navigate = useNavigate();
  const [reason, setReason] = useState("All");
  const rows = useMemo(
    () => (db.shipments || []).filter((row) => row.status === "NDR"),
    [db.shipments],
  );
  const reasons = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((row) => row.ndrReason || "No reason")))],
    [rows],
  );
  const visible = reason === "All" ? rows : rows.filter((row) => (row.ndrReason || "No reason") === reason);
  const highAttempts = rows.filter((row) => (row.attempts || 0) >= 2).length;
  const totalAttempts = rows.reduce((bag, row) => bag + (Number(row.attempts) || 0), 0);

  const resolve = (row, next) => {
    if (!window.confirm(`Mark ${row.order} as ${next}?`)) return;
    patch("shipments", row.id, { status: next }, `NDR ${row.order} set to ${next}`);
  };

  return (
    <div className="space-y-4">
      <PageHead
        title="NDR desk"
        description="Non-delivery reports only. Courier could not deliver — follow up, reschedule, or mark RTO / delivered from here."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <SoftButton onClick={() => downloadNdrCsv(visible)} disabled={!visible.length}>
              <Download className="h-3.5 w-3.5" />
              CSV
            </SoftButton>
            <SoftButton onClick={() => downloadNdrXlsx(visible)} disabled={!visible.length}>
              <Download className="h-3.5 w-3.5" />
              Excel
            </SoftButton>
            <SoftButton onClick={() => navigate("/shipping")}>All shipping</SoftButton>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Open NDR" value={rows.length} note="Need follow-up now" tone="amber" />
        <Kpi label="2+ attempts" value={highAttempts} note="Higher chance of RTO" tone="rose" />
        <Kpi label="Total attempts" value={totalAttempts} note="Across open NDR" tone="slate" />
        <Kpi
          label="RTO nearby"
          value={(db.shipments || []).filter((row) => row.status === "RTO").length}
          note="Already returned"
          tone="pink"
          onClick={() => navigate("/shipping")}
        />
      </div>

      <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="font-semibold">What is NDR?</p>
        <p className="mt-1 text-xs leading-5 text-amber-900/80 dark:text-amber-100/80">
          NDR means the courier tried delivery but it failed (customer not available, refused, wrong address). This desk shows only those stuck shipments so any admin can act without searching the full shipping list.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {reasons.map((item) => {
          const count = item === "All" ? rows.length : rows.filter((row) => (row.ndrReason || "No reason") === item).length;
          return (
            <FilterChip key={item} active={reason === item} count={count} onClick={() => setReason(item)}>
              {item}
            </FilterChip>
          );
        })}
      </div>

      <Surface title={reason === "All" ? "Open NDR shipments" : `NDR · ${reason}`}>
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-gray-500">No NDR waiting. Delivery queue is clear.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {visible.map((row) => (
              <li key={row.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => navigate(`/shipping?record=${row.id}`)}
                >
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {row.order} · {row.awb}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {row.courier} · {row.ndrReason || "No reason"} · {row.attempts || 0} attempts · {inr(row.charge)}
                  </span>
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <Status value={row.status} />
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-600"
                    onClick={() => resolve(row, "In transit")}
                  >
                    Reattempt
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                    onClick={() => resolve(row, "Delivered")}
                  >
                    Delivered
                  </button>
                  <SoftButton danger onClick={() => resolve(row, "RTO")}>
                    Mark RTO
                  </SoftButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </div>
  );
}

export function ExceptionsPage() {
  const { db } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const rows = exceptions(db);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((row) => row.category)))],
    [rows],
  );
  const visible = filter === "All" ? rows : rows.filter((row) => row.category === filter);
  const high = rows.filter((row) => row.priority === "High").length;
  const medium = rows.filter((row) => row.priority === "Medium").length;
  const integrationsDown = (db.integrations || []).filter((row) => row.status !== "Connected").length;
  return (
    <div className="space-y-4">
      <PageHead
        title="Exceptions"
        description="Open issues from the local sample. Fix the linked record to clear one."
        action={
          <StatPills
            items={[
              { label: "Open", value: rows.length, className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100" },
              { label: "High", value: high, className: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" },
              { label: "Medium", value: medium, className: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
              { label: "Integrations", value: integrationsDown, className: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
            ]}
          />
        }
      />

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const count = category === "All" ? rows.length : rows.filter((row) => row.category === category).length;
          return (
            <FilterChip key={category} active={filter === category} count={count} onClick={() => setFilter(category)}>
              {category}
            </FilterChip>
          );
        })}
      </div>

      <Surface title={filter === "All" ? "All open exceptions" : `${filter} exceptions`}>
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-gray-500">Nothing in this category right now.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {visible.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-leaf-50/40 dark:hover:bg-gray-700/40"
                  onClick={() => navigate(row.to)}
                >
                  <span className="w-[5.5rem] shrink-0 truncate rounded-lg bg-gray-50 px-2 py-1 text-center text-[10px] font-semibold tracking-wide text-gray-500 uppercase dark:bg-gray-900">
                    {row.category}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{row.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500">
                      {row.detail} · {row.owner}
                    </span>
                  </span>
                  <Status value={row.priority} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </div>
  );
}

export function ApprovalsPage() {
  const { db, patch } = useStore();
  const navigate = useNavigate();
  const [kind, setKind] = useState("All");
  const rows = approvals(db);
  const kindCounts = useMemo(() => {
    const bag = {};
    rows.forEach((row) => {
      bag[row.kind] = (bag[row.kind] || 0) + 1;
    });
    return bag;
  }, [rows]);
  const visible = kind === "All" ? rows : rows.filter((row) => row.kind === kind);

  const decide = (row, next) => {
    if (row.rejectTo === next && !window.confirm(`Set ${row.recordId} to ${next}? Linked local records update with it.`)) return;
    patch(row.collection, row.recordId, { status: next }, `${row.kind} ${row.recordId} set to ${next}`);
  };

  return (
    <div className="space-y-4">
      <PageHead
        title="Approvals"
        description="Work waiting on Super Admin in this browser session. Approve or reject writes the same status used on the source page."
      />
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-7">
        <button
          type="button"
          onClick={() => setKind("All")}
          className={`rounded-xl border p-3.5 text-left shadow-[var(--app-shadow)] transition ${
            kind === "All"
              ? "border-leaf-500 bg-leaf-50 dark:bg-leaf-950/40"
              : "border-gray-200/80 bg-white hover:-translate-y-0.5 dark:border-gray-700 dark:bg-gray-800"
          }`}
        >
          <p className="text-xs font-medium text-gray-500">Waiting</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-amber-700">{rows.length}</p>
        </button>
        {["Brand", "Partner", "Purchase", "Private label", "Return", "Settlement"].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setKind(kind === label ? "All" : label)}
            className={`rounded-xl border p-3.5 text-left shadow-[var(--app-shadow)] transition ${
              kind === label
                ? "border-leaf-500 bg-leaf-50 dark:bg-leaf-950/40"
                : "border-gray-200/80 bg-white hover:-translate-y-0.5 dark:border-gray-700 dark:bg-gray-800"
            }`}
          >
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900 dark:text-white">{kindCounts[label] || 0}</p>
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <Surface>
          <p className="px-4 py-10 text-center text-sm text-gray-500">
            {rows.length === 0 ? "Nothing is waiting. Sample rows move here when their status is pending." : `No ${kind.toLowerCase()} approvals waiting.`}
          </p>
        </Surface>
      ) : (
        <Surface title={kind === "All" ? "Decide these next" : `${kind} queue`}>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {visible.map((row) => (
              <li key={row.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => navigate(row.to)}>
                  <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">{row.kind}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-gray-900 dark:text-white">{row.title}</span>
                  <span className="block text-xs text-gray-500">{row.detail}</span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    onClick={() => decide(row, row.approveTo)}
                  >
                    {row.approveTo}
                  </button>
                  <SoftButton danger onClick={() => decide(row, row.rejectTo)}>
                    {row.rejectTo}
                  </SoftButton>
                </div>
              </li>
            ))}
          </ul>
        </Surface>
      )}
    </div>
  );
}

export function QualityPage() {
  const { db, patch } = useStore();
  const navigate = useNavigate();
  const inspections = db.inspections || [];
  const pending = inspections.filter((row) => row.result === "Pending");

  const decide = (row, result) => {
    patch("inspections", row.id, { result }, `Inspection ${row.id} ${result}`);
  };

  return (
    <div className="space-y-4">
      <PageHead
        title="Quality"
        description="Inbound goods and returns. Pass on an inbound inspection marks that purchase Received and adds stock in this session."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Pending" value={pending.length} note="Waiting on the sample QC desk" tone="amber" />
        <Kpi label="Passed" value={inspections.filter((row) => row.result === "Pass").length} note="Already on file" tone="emerald" />
        <Kpi label="Failed" value={inspections.filter((row) => row.result === "Fail").length} note="Does not add sellable stock" tone="rose" />
      </div>
      <Surface title="Inspection queue">
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {inspections.map((row) => (
            <li key={row.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => {
                  if (row.type === "Inbound") navigate(`/purchasing?record=${row.ref}`);
                  else if (row.type === "Return") navigate(`/returns?record=${row.ref}`);
                  else navigate(`/packaging?record=${row.ref}`);
                }}
              >
                <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">{row.type} · {row.id}</span>
                <span className="mt-0.5 block text-sm font-semibold text-gray-900 dark:text-white">{row.product} · {row.ref}</span>
                <span className="block text-xs text-gray-500">{row.inspector} · qty {row.qty} · {row.notes}</span>
              </button>
              <Status value={row.result} />
              {row.result === "Pending" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    onClick={() => decide(row, "Pass")}
                  >
                    Pass
                  </button>
                  <SoftButton danger onClick={() => decide(row, "Fail")}>
                    Fail
                  </SoftButton>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  );
}

export { IntegrationsPage } from "./integrations";

export function DataTools({ className = "" }) {
  const { db, load } = useStore();
  const fileRef = useRef(null);

  const download = (name, body, type) => {
    const blob = new Blob([body], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => download("dukify-local-session.json", JSON.stringify(db, null, 2), "application/json");

  const exportOrders = () => {
    const header = "id,brand,product,sku,qty,value,supply,payment,fulfilment,date";
    const lines = db.orders.map((order) =>
      [order.id, order.brand, order.product, order.sku, order.qty, order.value, order.supply, order.payment, order.fulfilment, order.date].join(","),
    );
    download("dukify-orders.csv", [header, ...lines].join("\n"), "text/csv");
  };

  const importJson = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.orders) || !Array.isArray(parsed.products)) {
          window.alert("That file is not a Dukify local session.");
          return;
        }
        load(parsed);
      } catch {
        window.alert("Could not read that JSON file.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className={className}>
      <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Local import and export</p>
      <p className="mb-4 text-xs leading-5 text-gray-500">Downloads this browser session. Import replaces the session. Nothing is sent to a server.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary px-3 py-2 text-xs" onClick={exportJson}>Export JSON</button>
        <SoftButton onClick={exportOrders}>Export orders CSV</SoftButton>
        <SoftButton onClick={() => fileRef.current?.click()}>Import JSON</SoftButton>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importJson} />
      </div>
    </div>
  );
}

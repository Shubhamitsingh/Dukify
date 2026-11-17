import { useMemo, useRef, useState } from "react";
import {
  CATALOGUE_FIELDS,
  applyCatalogueImport,
  attachImages,
  buildImageLibrary,
  detectMapping,
  downloadBlob,
  exportProductsCsv,
  parseCatalogueFile,
  rowsFromMapping,
  sampleTemplateCsv,
  validateCatalogueRows,
} from "./catalogue";
import { inr } from "./data";
import { blanks } from "./local";
import { useStore } from "./store";
import { DrawerShell, Kpi, PageHead, SoftButton, Status, Surface, Toolbar } from "./ui";

const STATUSES = ["Active", "Hidden", "Draft"];
const STEPS = ["Upload", "Map", "Validate", "Preview", "Commit"];

export function PricingPage() {
  const { db, patch, add, load, removeMany, toast } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(() => new Set());
  const [draft, setDraft] = useState(null);
  const [creating, setCreating] = useState(false);
  const [bulkPercent, setBulkPercent] = useState("5");
  const [importOpen, setImportOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [headers, setHeaders] = useState([]);
  const [records, setRecords] = useState([]);
  const [sourceName, setSourceName] = useState("");
  const [mapping, setMapping] = useState({});
  const [previewRows, setPreviewRows] = useState([]);
  const [validation, setValidation] = useState({ errors: [], warnings: [], ok: false });
  const [imageLibrary, setImageLibrary] = useState({});
  const [imageNames, setImageNames] = useState([]);
  const [manualImageMap, setManualImageMap] = useState({});
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const imageRef = useRef(null);

  const products = db.products;

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((row) => {
      const matchesStatus = status === "All" || row.status === status;
      const haystack = [row.name, row.sku, row.category, row.vendor, row.handle].join(" ").toLowerCase();
      return matchesStatus && (needle.length === 0 || haystack.includes(needle));
    });
  }, [products, query, status]);

  const kpis = useMemo(() => {
    const margins = products.map((row) => Number(row.supply) - Number(row.cost));
    const avg = margins.length ? Math.round(margins.reduce((a, b) => a + b, 0) / margins.length) : 0;
    const missingPrice = products.filter((row) => !row.retail && row.retail !== 0).length;
    const skuCounts = {};
    products.forEach((row) => {
      if (!row.sku) return;
      skuCounts[row.sku] = (skuCounts[row.sku] || 0) + 1;
    });
    const duplicateRisk = Object.values(skuCounts).filter((count) => count > 1).length;
    return { skus: products.length, avg, missingPrice, duplicateRisk };
  }, [products]);

  const toggle = (id) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === rows.length) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(rows.map((row) => row.id)));
  };

  const openEdit = (row) => {
    setCreating(false);
    setDraft({ ...row, images: Array.isArray(row.images) ? row.images : [] });
  };

  const closeEdit = () => {
    setCreating(false);
    setDraft(null);
  };

  const saveEdit = (event) => {
    event.preventDefault();
    if (creating) {
      const id = add("products", {
        ...draft,
        cost: Number(draft.cost) || 0,
        supply: Number(draft.supply) || 0,
        retail: Number(draft.retail) || 0,
        images: Array.isArray(draft.images) ? draft.images : [],
      });
      setCreating(false);
      setDraft({ ...draft, id });
      return;
    }
    const original = products.find((row) => row.id === draft.id);
    if (!original) return;
    const changes = {};
    ["name", "handle", "description", "vendor", "tags", "sku", "barcode", "category", "sizes", "colors", "status"].forEach((key) => {
      if (draft[key] !== original[key]) changes[key] = draft[key];
    });
    ["cost", "supply", "retail"].forEach((key) => {
      const value = Number(draft[key]) || 0;
      if (value !== Number(original[key])) changes[key] = value;
    });
    if (JSON.stringify(draft.images || []) !== JSON.stringify(original.images || [])) {
      changes.images = draft.images || [];
    }
    if (Object.keys(changes).length) {
      patch("products", draft.id, changes, `Pricing ${draft.id} edited`);
    }
  };

  const bulkSetStatus = (next) => {
    if (!selected.size) return;
    selected.forEach((id) => {
      patch("products", id, { status: next }, `Pricing ${id} set to ${next}`);
    });
    toast(`Set ${selected.size} SKUs to ${next} in this session.`);
  };

  const bulkBump = (field) => {
    if (!selected.size) return;
    const percent = Number(bulkPercent);
    if (!Number.isFinite(percent)) {
      toast("Enter a valid percent.");
      return;
    }
    selected.forEach((id) => {
      const row = products.find((item) => item.id === id);
      if (!row) return;
      const next = Math.round((Number(row[field]) || 0) * (1 + percent / 100));
      patch("products", id, { [field]: next }, `Pricing ${id} ${field} bumped ${percent}%`);
    });
  };

  const bulkDelete = () => {
    if (!selected.size) return;
    if (!window.confirm(`Remove ${selected.size} products from this browser session?`)) return;
    removeMany("products", [...selected], "Pricing catalogue rows removed");
    setSelected(new Set());
  };

  const resetImport = () => {
    setStep(0);
    setHeaders([]);
    setRecords([]);
    setSourceName("");
    setMapping({});
    setPreviewRows([]);
    setValidation({ errors: [], warnings: [], ok: false });
    setImageLibrary({});
    setImageNames([]);
    setManualImageMap({});
    setBusy(false);
  };

  const onCatalogueFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const parsed = await parseCatalogueFile(file);
      if (!parsed.headers.length) throw new Error("No header row found.");
      const auto = detectMapping(parsed.headers);
      setHeaders(parsed.headers);
      setRecords(parsed.records);
      setSourceName(parsed.sourceName || file.name);
      setMapping(auto);
      setStep(1);
      toast(`Parsed ${parsed.records.length} rows from ${file.name}.`);
    } catch (error) {
      toast(error.message || "Could not parse file.");
    } finally {
      setBusy(false);
    }
  };

  const onImageFiles = async (fileList) => {
    const files = [...fileList];
    if (!files.length) return;
    setBusy(true);
    try {
      const library = await buildImageLibrary(files);
      setImageLibrary((current) => ({ ...current, ...library }));
      setImageNames((current) => [...new Set([...current, ...files.map((file) => file.name)])]);
      toast(`Attached ${files.length} image file(s) for SKU / filename mapping.`);
    } catch (error) {
      toast(error.message || "Could not read images.");
    } finally {
      setBusy(false);
    }
  };

  const runValidate = () => {
    const mapped = rowsFromMapping(records, mapping);
    const withImages = attachImages(mapped, imageLibrary, manualImageMap);
    const result = validateCatalogueRows(withImages, products);
    setPreviewRows(withImages);
    setValidation(result);
    setStep(2);
  };

  const goPreview = () => {
    setStep(3);
  };

  const commitImport = () => {
    if (!validation.ok) {
      toast("Fix validation errors before commit.");
      return;
    }
    const result = applyCatalogueImport(db, previewRows);
    load(result.db);
    toast(
      `Import committed: ${result.summary.created} created, ${result.summary.updated} updated` +
        (result.summary.inventoryTouched ? `, ${result.summary.inventoryTouched} inventory rows synced` : "") +
        ". Session only.",
    );
    setStep(4);
    setSelected(new Set());
  };

  const updatePreviewCell = (index, key, value) => {
    setPreviewRows((current) => {
      const next = [...current];
      const row = { ...next[index], [key]: value };
      if (["cost", "supply", "retail", "inventoryQty"].includes(key)) {
        row[key] = value === "" ? null : Number(value);
      }
      next[index] = row;
      return next;
    });
  };

  const revalidatePreview = () => {
    const result = validateCatalogueRows(previewRows, products);
    setValidation(result);
  };

  return (
    <div>
      <PageHead
        title="Pricing and catalogue"
        description="Company cost, partner supply and retail. Import Shopify-style CSV or Excel into this browser session only — refresh resets unless you export."
        action={
          <div className="flex flex-wrap gap-2">
            <SoftButton onClick={() => downloadBlob("dukify-catalogue-template.csv", sampleTemplateCsv(), "text/csv;charset=utf-8")}>
              Download template
            </SoftButton>
            <SoftButton onClick={() => downloadBlob("dukify-pricing-export.csv", exportProductsCsv(products), "text/csv;charset=utf-8")}>
              Export CSV
            </SoftButton>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                resetImport();
                setImportOpen(true);
              }}
            >
              Import
            </button>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="SKUs" value={kpis.skus} note="Products in session" />
        <Kpi label="Avg company margin" value={inr(kpis.avg)} note="Supply − cost" tone="pink" />
        <Kpi label="Missing retail" value={kpis.missingPrice} note="Need a sell price" tone={kpis.missingPrice ? "amber" : "emerald"} />
        <Kpi label="Duplicate SKU risk" value={kpis.duplicateRisk} note="Same SKU more than once" tone={kpis.duplicateRisk ? "rose" : "emerald"} />
      </div>

      <Toolbar meta={`${rows.length} shown · ${selected.size} selected`}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, SKU, category, vendor"
          className="input-field sm:max-w-sm"
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="input-field sm:w-40">
          <option>All</option>
          {STATUSES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <SoftButton
          onClick={() => {
            setCreating(true);
            setDraft({ ...blanks.products });
          }}
        >
          Add product
        </SoftButton>
      </Toolbar>

      {selected.size ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-leaf-100 bg-leaf-50/70 px-3 py-2.5 text-sm shadow-[var(--app-shadow)] dark:border-leaf-900/40 dark:bg-leaf-950/20">
          <span className="text-xs font-semibold text-leaf-900 dark:text-leaf-200">{selected.size} selected</span>
          <select
            className="input-field py-1.5 text-xs sm:w-36"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) bulkSetStatus(event.target.value);
              event.target.value = "";
            }}
          >
            <option value="">Set status…</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <input
            className="input-field w-20 py-1.5 text-xs"
            value={bulkPercent}
            onChange={(event) => setBulkPercent(event.target.value)}
            title="Percent bump"
          />
          <SoftButton onClick={() => bulkBump("supply")}>Bump supply %</SoftButton>
          <SoftButton onClick={() => bulkBump("retail")}>Bump retail %</SoftButton>
          <SoftButton danger onClick={bulkDelete}>Delete from session</SoftButton>
        </div>
      ) : null}

      <Surface>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:border-gray-700 dark:bg-gray-900/40">
              <tr>
                <th className="px-3 py-3">
                  <input type="checkbox" checked={rows.length > 0 && selected.size === rows.length} onChange={toggleAll} />
                </th>
                <th className="px-3 py-3">Image</th>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Cost</th>
                <th className="px-3 py-3">Supply</th>
                <th className="px-3 py-3">Retail</th>
                <th className="px-3 py-3">Margin</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-500">No products match.</td>
                </tr>
              ) : (
                rows.map((row) => {
                  const thumb = Array.isArray(row.images) && row.images[0] ? row.images[0] : "";
                  return (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-b border-gray-50 transition hover:bg-leaf-50/40 dark:border-gray-700 dark:hover:bg-gray-700/40"
                      onClick={() => openEdit(row)}
                    >
                      <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggle(row.id)} />
                      </td>
                      <td className="px-3 py-3">
                        {thumb ? (
                          <img src={thumb} alt="" className="h-9 w-9 rounded-xl object-cover" />
                        ) : (
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-[10px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
                        <p className="text-[11px] text-gray-500">{row.category}</p>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">{row.sku}</td>
                      <td className="px-3 py-3 tabular-nums">{inr(row.cost)}</td>
                      <td className="px-3 py-3 tabular-nums">{inr(row.supply)}</td>
                      <td className="px-3 py-3 tabular-nums">{inr(row.retail)}</td>
                      <td className="px-3 py-3 tabular-nums">{inr(Number(row.supply) - Number(row.cost))}</td>
                      <td className="px-3 py-3"><Status value={row.status} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Surface>

      {draft ? (
        <DrawerShell
          title={creating ? "New product" : draft.id}
          onClose={closeEdit}
          footer={
            <button form="pricing-edit-form" className="btn-primary w-full" type="submit">
              {creating ? "Add to this session" : "Save edits"}
            </button>
          }
        >
          <form id="pricing-edit-form" className="space-y-3" onSubmit={saveEdit}>
            {Array.isArray(draft.images) && draft.images[0] ? (
              <img src={draft.images[0]} alt="" className="h-28 w-full rounded-xl object-cover" />
            ) : null}
            {[
              ["name", "Name"],
              ["handle", "Handle"],
              ["sku", "SKU"],
              ["barcode", "Barcode"],
              ["category", "Category"],
              ["vendor", "Vendor"],
              ["tags", "Tags"],
              ["sizes", "Sizes"],
              ["colors", "Colours"],
              ["cost", "Cost"],
              ["supply", "Supply price"],
              ["retail", "Retail"],
            ].map(([key, label]) => (
              <label key={key} className="block text-xs font-medium text-gray-600">
                {label}
                <input
                  className="input-field mt-1"
                  value={draft[key] ?? ""}
                  onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                />
              </label>
            ))}
            <label className="block text-xs font-medium text-gray-600">
              Description
              <textarea
                className="input-field mt-1 min-h-20"
                value={draft.description || ""}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium text-gray-600">
              Status
              <select
                className="input-field mt-1"
                value={draft.status || "Draft"}
                onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
              >
                {STATUSES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-gray-600">
              Attach image
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-xs"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setDraft((current) => ({ ...current, images: [String(reader.result || "")] }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </form>
        </DrawerShell>
      ) : null}

      {importOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="flex h-full w-full max-w-2xl flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 dark:border-gray-800">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-leaf-600 uppercase">Catalogue</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Import catalogue</p>
                <p className="text-xs text-gray-500">Shopify-compatible CSV / Excel · session only</p>
              </div>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setImportOpen(false);
                  resetImport();
                }}
              >
                Close
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
              {STEPS.map((label, index) => (
                <span
                  key={label}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    index === step ? "bg-leaf-100 text-leaf-900" : index < step ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {index + 1}. {label}
                </span>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {step === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Upload a Shopify product export or the Dukify template. Optional image files map by filename, SKU, or row.
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.txt,.xlsx,.xls"
                    className="block w-full text-sm"
                    onChange={(event) => onCatalogueFile(event.target.files?.[0])}
                  />
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-600">Optional images</p>
                    <input
                      ref={imageRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="block w-full text-sm"
                      onChange={(event) => onImageFiles(event.target.files || [])}
                    />
                    {imageNames.length ? (
                      <p className="mt-2 text-xs text-gray-500">{imageNames.length} image(s) ready: {imageNames.slice(0, 4).join(", ")}{imageNames.length > 4 ? "…" : ""}</p>
                    ) : null}
                  </div>
                  {busy ? <p className="text-xs text-gray-500">Reading file…</p> : null}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Source: <span className="font-medium">{sourceName}</span> · {records.length} data rows. Adjust column mapping if auto-detect missed a header.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CATALOGUE_FIELDS.map((field) => (
                      <label key={field.key} className="block text-xs font-medium text-gray-600">
                        {field.label}
                        <select
                          className="input-field mt-1"
                          value={mapping[field.key] || ""}
                          onChange={(event) => setMapping((current) => ({ ...current, [field.key]: event.target.value }))}
                        >
                          <option value="">— ignore —</option>
                          {headers.map((header) => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                  {imageNames.length ? (
                    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      <p className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-200">Map images by SKU (optional override)</p>
                      <div className="max-h-40 space-y-2 overflow-y-auto">
                        {rowsFromMapping(records.slice(0, 12), mapping).map((row) => (
                          <label key={`${row.__row}-${row.sku}`} className="flex items-center gap-2 text-xs">
                            <span className="w-36 truncate font-mono">{row.sku || `row ${row.__row}`}</span>
                            <select
                              className="input-field py-1"
                              value={manualImageMap[row.sku] || ""}
                              onChange={(event) =>
                                setManualImageMap((current) => ({ ...current, [row.sku]: event.target.value }))
                              }
                            >
                              <option value="">Auto / Image Src</option>
                              {imageNames.map((name) => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <button type="button" className="btn-primary" onClick={runValidate} disabled={!mapping.sku}>
                    Validate rows
                  </button>
                  {!mapping.sku ? <p className="text-xs text-rose-600">Map a SKU column to continue.</p> : null}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Kpi label="Rows" value={previewRows.length} />
                    <Kpi label="Errors" value={validation.errors.length} tone={validation.errors.length ? "rose" : "emerald"} />
                    <Kpi label="Warnings" value={validation.warnings.length} tone={validation.warnings.length ? "amber" : "emerald"} />
                  </div>
                  {validation.errors.length ? (
                    <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                      {validation.errors.map((item, index) => (
                        <li key={`${item.row}-${index}`}>Row {item.row} · {item.sku || "—"} · {item.message}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-emerald-700">No blocking errors. Review warnings, then preview.</p>
                  )}
                  {validation.warnings.length ? (
                    <ul className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      {validation.warnings.slice(0, 40).map((item, index) => (
                        <li key={`${item.row}-w-${index}`}>Row {item.row} · {item.sku || "—"} · {item.message}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="flex gap-2">
                    <SoftButton onClick={() => setStep(1)}>Back to map</SoftButton>
                    <button type="button" className="btn-primary" disabled={!validation.ok} onClick={goPreview}>
                      Open preview
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Edit cells before commit. Re-validate after changes.</p>
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full min-w-[880px] text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800">
                        <tr>
                          {["Row", "Name", "SKU", "Cost", "Supply", "Retail", "Status", "Qty", "Img"].map((label) => (
                            <th key={label} className="px-2 py-2">{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, index) => (
                          <tr key={`${row.__row}-${index}`} className="border-t border-gray-100 dark:border-gray-800">
                            <td className="px-2 py-1">{row.__row}</td>
                            <td className="px-2 py-1">
                              <input className="input-field py-1" value={row.name || ""} onChange={(event) => updatePreviewCell(index, "name", event.target.value)} />
                            </td>
                            <td className="px-2 py-1">
                              <input className="input-field py-1 font-mono" value={row.sku || ""} onChange={(event) => updatePreviewCell(index, "sku", event.target.value)} />
                            </td>
                            <td className="px-2 py-1">
                              <input className="input-field py-1" value={row.cost ?? ""} onChange={(event) => updatePreviewCell(index, "cost", event.target.value)} />
                            </td>
                            <td className="px-2 py-1">
                              <input className="input-field py-1" value={row.supply ?? ""} onChange={(event) => updatePreviewCell(index, "supply", event.target.value)} />
                            </td>
                            <td className="px-2 py-1">
                              <input className="input-field py-1" value={row.retail ?? ""} onChange={(event) => updatePreviewCell(index, "retail", event.target.value)} />
                            </td>
                            <td className="px-2 py-1">
                              <select className="input-field py-1" value={row.status || "Draft"} onChange={(event) => updatePreviewCell(index, "status", event.target.value)}>
                                {STATUSES.map((item) => (
                                  <option key={item}>{item}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-1">
                              <input className="input-field py-1" value={row.inventoryQty ?? ""} onChange={(event) => updatePreviewCell(index, "inventoryQty", event.target.value)} />
                            </td>
                            <td className="px-2 py-1">
                              {row.images?.[0] ? <img src={row.images[0]} alt="" className="h-8 w-8 rounded object-cover" /> : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SoftButton onClick={revalidatePreview}>Re-validate</SoftButton>
                    <button type="button" className="btn-primary" onClick={commitImport} disabled={!validation.ok}>
                      Commit to session
                    </button>
                    {!validation.ok ? <p className="self-center text-xs text-rose-600">Resolve errors before commit.</p> : null}
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-3">
                  <p className="text-sm text-emerald-700">Import written to this browser session. Export CSV if you need a durable copy.</p>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setImportOpen(false);
                      resetImport();
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

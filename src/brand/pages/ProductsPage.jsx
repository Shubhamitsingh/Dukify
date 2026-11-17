import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePartner } from "../store";
import { Empty, Field, PageHead, Status, Surface, Swatch, Table, useTable } from "../ui";
import { formatDate, inr } from "../lib/metrics";

const copy = {
  browse: ["Browse products", "The catalogue belongs to Dukify. Select styles your brand is allowed to sell."],
  selected: ["My selected products", "These approved styles are listed on your storefront."],
  details: ["Product details", "Open a style to see specifications, images, and variants from the central record."],
  variants: ["Product variants", "Sizes and stock splits are read-only. Inventory is not edited here."],
  pricing: ["My product pricing", "Set a retail price between the supply price and MRP. Estimated margin is not the settlement."],
  featured: ["Featured products", "Featured styles appear in the storefront preview."],
  availability: ["Product availability", "Stock is the central position. You can read it and request a change."],
  recent: ["Recently added", "Styles added to the central catalogue on or after 1 Nov 2026."],
};

export default function ProductsPage({ section }) {
  const partner = usePartner();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [picked, setPicked] = useState([]);
  const [bulk, setBulk] = useState("");
  const [request, setRequest] = useState({ name: "", note: "" });
  const categories = ["All", ...new Set(partner.products.map((product) => product.category))];
  const rows = useMemo(() => {
    return partner.products.filter((product) => {
      if (section === "selected" && !product.selected) return false;
      if (section === "featured" && !product.featured) return false;
      if (section === "recent" && product.addedOn < "2026-11-01") return false;
      if (category !== "All" && product.category !== category) return false;
      if (availability !== "All" && product.availability !== availability) return false;
      const needle = query.trim().toLowerCase();
      if (needle && !`${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [availability, category, partner.products, query, section]);
  const table = useTable(rows.map((product) => ({ ...product, margin: product.grossMargin })));
  const [title, description] = copy[section];

  const columns = [
    {
      key: "name",
      label: "Product",
      render: (row) => (
        <button type="button" className="flex items-center gap-2 text-left" onClick={() => navigate(`/brand/products/item/${row.id}`)}>
          <Swatch color={row.color} label={row.name} />
          <span>
            <span className="block font-medium">{row.name}</span>
            <span className="block text-xs text-gray-500">{row.sku}</span>
          </span>
        </button>
      ),
    },
    { key: "category", label: "Category" },
    { key: "supplyPrice", label: "Supply", render: (row) => inr(row.supplyPrice) },
    { key: "retail", label: "Retail", render: (row) => inr(row.retail) },
    { key: "margin", label: "Est. margin", render: (row) => inr(row.grossMargin) },
    { key: "availability", label: "Stock", render: (row) => <Status value={row.availability} /> },
    { key: "approval", label: "Approval", render: (row) => <Status value={row.approval} /> },
    {
      key: "selected",
      label: "Store",
      sort: false,
      render: (row) => (
        <input
          type="checkbox"
          checked={row.selected}
          onChange={(event) => partner.toggleSelected(row.id, event.target.checked)}
          aria-label={`List ${row.name}`}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHead title={title} description={description} />
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input className="toolbar-field w-full" placeholder="Search name or SKU" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="toolbar-field w-full" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="toolbar-field w-full" value={availability} onChange={(event) => setAvailability(event.target.value)}>
          {["All", "In stock", "Low", "Out of stock"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      {section === "pricing" ? (
        <Surface title="Bulk retail update" padded className="mb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Field label="Retail price for ticked rows">
              <input className="input-field" value={bulk} onChange={(event) => setBulk(event.target.value)} />
            </Field>
            <button
              type="button"
              className="btn-primary"
              onClick={() => partner.bulkRetail(picked, bulk)}
            >
              Apply to {picked.length} selected
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {rows.filter((row) => row.selected).map((row) => (
              <label key={row.id} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs">
                <input type="checkbox" checked={picked.includes(row.id)} onChange={(event) => setPicked((current) => event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id))} />
                {row.name}
              </label>
            ))}
          </div>
        </Surface>
      ) : null}
      {section === "variants" ? (
        <Surface title="Variant stock" className="mb-4">
          {rows.length === 0 ? <Empty title="No variants in this filter" body="Change the category or availability filter." /> : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.slice(0, 8).map((product) => (
                <li key={product.id} className="px-4 py-3">
                  <p className="text-sm font-medium">{product.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <span key={variant.id} className="rounded-full bg-gray-50 px-2.5 py-1 text-xs dark:bg-gray-900">{variant.size} · {variant.sku} · {variant.stock}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      ) : null}
      {section === "featured" ? (
        <Surface title="Featured on the draft storefront" className="mb-4">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {partner.products.filter((product) => product.selected && product.approval === "Approved").map((product) => (
              <li key={product.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{product.name}</span>
                <label className="inline-flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" checked={product.featured} onChange={(event) => partner.toggleFeatured(product.id, event.target.checked)} />
                  Featured
                </label>
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}
      <Surface title={`${table.total} styles`}>
        {table.total === 0 ? <Empty title="Nothing matches" body="Try another search, or select styles from Browse Products." /> : <Table columns={columns} table={table} />}
      </Surface>
      <Surface title="Request a catalogue change" padded className="mt-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Style name"><input className="input-field" value={request.name} onChange={(event) => setRequest({ ...request, name: event.target.value })} /></Field>
          <Field label="What should change"><input className="input-field" value={request.note} onChange={(event) => setRequest({ ...request, note: event.target.value })} /></Field>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (!request.name.trim()) return;
              partner.addRequest(request);
              setRequest({ name: "", note: "" });
            }}
          >
            Send request
          </button>
        </div>
        <ul className="mt-3 space-y-1 text-xs text-gray-500">
          {partner.requests.map((item) => <li key={item.id}>{item.name} — {item.status}</li>)}
        </ul>
      </Surface>
      <p className="mt-3 text-xs text-gray-400">Added dates run through {formatDate("2026-11-08")}. Pending styles cannot be listed.</p>
    </div>
  );
}

ProductsPage.moduleId = "products";

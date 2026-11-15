import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addDays, ANCHOR, inr } from "../lib/metrics";
import { usePartner } from "../store";
import { Empty, PageHead, Status, Surface, Swatch, Table, useTable } from "../ui";

export default function Products() {
  const { section = "browse" } = useParams();
  const navigate = useNavigate();
  const { products, toggleSelected, savePrice, bulkRetail, toggleFeatured, addRequest } = usePartner();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [stock, setStock] = useState("All");
  const [picked, setPicked] = useState([]);
  const [bulk, setBulk] = useState("");
  const [request, setRequest] = useState({ name: "", note: "" });

  const categories = ["All", ...new Set(products.map((product) => product.category))];
  const rows = useMemo(() => {
    const recentCut = addDays(ANCHOR, -21);
    return products.filter((product) => {
      if (section === "selected" && !product.selected) return false;
      if (section === "featured" && !product.featured) return false;
      if (section === "recent" && product.addedOn < recentCut) return false;
      if (category !== "All" && product.category !== category) return false;
      if (stock !== "All" && product.availability !== stock) return false;
      const hay = `${product.name} ${product.sku} ${product.category}`.toLowerCase();
      return hay.includes(query.trim().toLowerCase());
    });
  }, [category, products, query, section, stock]);

  const table = useTable(rows.map((product) => ({ ...product, margin: product.grossMargin })), 8);

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
    { key: "availability", label: "Availability", render: (row) => <Status value={row.availability} /> },
    { key: "approval", label: "Approval", render: (row) => <Status value={row.approval} /> },
    { key: "supplyPrice", label: "Supply", render: (row) => inr(row.supplyPrice) },
    { key: "retail", label: "Your retail", render: (row) => inr(row.retail) },
    { key: "margin", label: "Est. margin", render: (row) => inr(row.grossMargin) },
    {
      key: "selected",
      label: "Store",
      sort: false,
      render: (row) => (
        <input type="checkbox" checked={row.selected} onChange={(event) => toggleSelected(row.id, event.target.checked)} aria-label={`List ${row.name}`} />
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title={{
          browse: "Browse products",
          selected: "My selected products",
          details: "Product details",
          variants: "Product variants",
          pricing: "My product pricing",
          featured: "Featured products",
          availability: "Product availability",
          recent: "Recently added products",
        }[section] || "Products"}
        description="Styles come from the central catalogue. You choose what to sell and set a retail price inside the allowed band. Purchase cost stays hidden."
      />
      <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-gray-200/80 bg-white p-3 sm:flex-row sm:flex-wrap dark:border-gray-700 dark:bg-gray-800">
        <input className="toolbar-field flex-1" placeholder="Search name or SKU" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="toolbar-field" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="toolbar-field" value={stock} onChange={(event) => setStock(event.target.value)}>
          {["All", "In stock", "Low", "Out of stock"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      {section === "pricing" ? (
        <Surface title="Bulk retail update" className="mb-4" padded>
          <div className="flex flex-wrap items-center gap-2">
            <input className="toolbar-field" placeholder="Retail price" value={bulk} onChange={(event) => setBulk(event.target.value)} />
            <button type="button" className="btn-primary" onClick={() => bulkRetail(picked, bulk)}>Apply to selected rows</button>
            <span className="text-xs text-gray-500">{picked.length} ticked</span>
          </div>
        </Surface>
      ) : null}

      <Surface title={`${rows.length} styles`}>
        {rows.length === 0 ? <Empty title="Nothing in this view" body="Change the search or filters. Another brand's private prices are not in this list." /> : (
          <Table
            table={table}
            columns={section === "pricing" ? [
              {
                key: "pick",
                label: "Pick",
                sort: false,
                render: (row) => (
                  <input type="checkbox" checked={picked.includes(row.id)} onChange={(event) => setPicked((current) => event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id))} />
                ),
              },
              ...columns,
              {
                key: "edit",
                label: "Edit",
                sort: false,
                render: (row) => <PriceEditor product={row} onSave={savePrice} />,
              },
            ] : section === "variants" ? [
              columns[0],
              { key: "variants", label: "Variants", sort: false, render: (row) => row.variants.map((variant) => `${variant.size} (${variant.stock})`).join(", ") },
              columns[3],
            ] : section === "featured" ? [
              ...columns,
              { key: "featured", label: "Featured", sort: false, render: (row) => <input type="checkbox" checked={row.featured} onChange={(event) => toggleFeatured(row.id, event.target.checked)} /> },
            ] : columns}
          />
        )}
      </Surface>

      <Surface title="Request a catalogue change" className="mt-4" padded>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <input className="input-field" placeholder="Style or colourway" value={request.name} onChange={(event) => setRequest({ ...request, name: event.target.value })} />
          <input className="input-field" placeholder="What should Pahachan review?" value={request.note} onChange={(event) => setRequest({ ...request, note: event.target.value })} />
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (!request.name.trim()) return;
              addRequest(request);
              setRequest({ name: "", note: "" });
            }}
          >
            Send request
          </button>
        </div>
      </Surface>
    </div>
  );
}

function PriceEditor({ product, onSave }) {
  const [retail, setRetail] = useState(String(product.retail));
  const [promo, setPromo] = useState(product.promo ?? "");
  const [error, setError] = useState("");
  return (
    <form
      className="flex min-w-48 flex-col gap-1"
      onSubmit={(event) => {
        event.preventDefault();
        setError(onSave(product, retail, promo));
      }}
    >
      <input className="toolbar-field" value={retail} onChange={(event) => setRetail(event.target.value)} aria-label="Retail price" />
      <input className="toolbar-field" value={promo} placeholder="Promo" onChange={(event) => setPromo(event.target.value)} aria-label="Promo price" />
      <button type="submit" className="btn-soft">Save</button>
      {error ? <span className="text-[11px] text-rose-600">{error}</span> : null}
    </form>
  );
}

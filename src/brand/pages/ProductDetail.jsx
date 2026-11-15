import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usePartner } from "../store";
import { Field, PageHead, Status, Surface, Swatch } from "../ui";
import { inr, priceError } from "../lib/metrics";

export default function ProductDetail() {
  const { id } = useParams();
  const partner = usePartner();
  const product = partner.products.find((item) => item.id === id);
  const [retail, setRetail] = useState(product?.retail ?? "");
  const [promo, setPromo] = useState(product?.promo ?? "");
  const [error, setError] = useState("");
  const [seen, setSeen] = useState("");
  if (product && seen !== `${partner.brand.id}:${product.id}:${product.retail}:${product.promo}`) {
    setSeen(`${partner.brand.id}:${product.id}:${product.retail}:${product.promo}`);
    setRetail(product.retail);
    setPromo(product.promo ?? "");
  }
  if (!product) return <PageHead title="Product missing" description="This style is not in the central catalogue." />;

  return (
    <div>
      <PageHead
        eyebrow="Catalogue"
        title={product.name}
        description={product.description}
        action={<Link className="btn-soft" to="/brand/products/browse">Back to catalogue</Link>}
      />
      <div className="grid gap-4 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        <Surface padded>
          <div className="mb-4 h-36 rounded-2xl sm:h-40" style={{ background: product.color }} />
          <Swatch color={product.color} label={product.name} />
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-gray-500">SKU</dt><dd>{product.sku}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Category</dt><dd>{product.category}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Fabric</dt><dd>{product.fabric}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Care</dt><dd>{product.care}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">MRP</dt><dd>{inr(product.mrp)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Supply</dt><dd>{inr(product.supplyPrice)}</dd></div>
          </dl>
          <div className="mt-3 flex gap-2"><Status value={product.approval} /><Status value={product.availability} /></div>
        </Surface>
        <div className="space-y-4">
          <Surface title="Your price" padded>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Retail selling price" error={error}>
                <input className="input-field" value={retail} onChange={(event) => setRetail(event.target.value)} />
              </Field>
              <Field label="Promotional price">
                <input className="input-field" value={promo} placeholder="Optional" onChange={(event) => setPromo(event.target.value)} />
              </Field>
            </div>
            <p className="mt-3 text-sm">Estimated gross margin at the selling price: <strong>{inr((promo || retail || 0) - product.supplyPrice)}</strong> per unit. This is not the payable settlement.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  const message = priceError(product, retail, promo) || partner.savePrice(product, retail, promo);
                  setError(message);
                }}
              >
                Save price
              </button>
              <button type="button" className="btn-soft" onClick={() => partner.toggleSelected(product.id, !product.selected)}>
                {product.selected ? "Remove from store" : "Add to store"}
              </button>
            </div>
          </Surface>
          <Surface title="Variants from the central record">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                <tr><th className="px-3 py-3 sm:px-4">Size</th><th className="px-3 py-3 sm:px-4">SKU</th><th className="px-3 py-3 sm:px-4">Units</th></tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => (
                  <tr key={variant.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-3 py-3 sm:px-4">{variant.size}</td>
                    <td className="px-3 py-3 sm:px-4">{variant.sku}</td>
                    <td className="px-3 py-3 tabular-nums sm:px-4">{variant.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}

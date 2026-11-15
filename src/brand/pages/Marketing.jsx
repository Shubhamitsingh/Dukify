import { useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../data/seed";
import { usePartner } from "../store";
import { Drawer, Field, PageHead, Status, Surface } from "../ui";

export default function Marketing() {
  const { section = "overview" } = useParams();
  const { brand, coupons, campaigns, products, addCoupon, addCampaign, toggleFeatured } = usePartner();
  const [coupon, setCoupon] = useState({ code: "", type: "percent", value: "10", minOrder: "1499" });
  const [error, setError] = useState("");
  const [campaign, setCampaign] = useState({ name: "", channel: "Storefront", start: "2026-11-12", end: "2026-11-30", note: "" });
  const [asset, setAsset] = useState(null);
  const socials = campaigns.filter((item) => item.channel !== "Storefront");
  const promos = campaigns.filter((item) => item.channel === "Storefront");
  const referral = `${brand.name.replace(/\s+/g, "").toUpperCase()}-REF`;

  return (
    <div>
      <PageHead title="Marketing" description="Create coupons and campaigns inside this brand's discount cap. Past orders are not rewritten." />
      {(section === "overview" || section === "campaigns" || section === "promotions" || section === "social") && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Surface padded><p className="text-xs text-gray-500">Campaigns</p><p className="text-xl font-semibold">{campaigns.length}</p></Surface>
          <Surface padded><p className="text-xs text-gray-500">Coupons</p><p className="text-xl font-semibold">{coupons.length}</p></Surface>
          <Surface padded><p className="text-xs text-gray-500">Featured styles</p><p className="text-xl font-semibold">{products.filter((product) => product.featured).length}</p></Surface>
        </div>
      )}
      {(section === "overview" || section === "coupons") && (
        <Surface title="Discount coupons" className="mb-4" padded>
          <form
            className="mb-4 grid gap-3 sm:grid-cols-5"
            onSubmit={(event) => {
              event.preventDefault();
              const message = addCoupon({ ...coupon, value: Number(coupon.value), minOrder: Number(coupon.minOrder) });
              setError(message);
              if (!message) setCoupon({ code: "", type: "percent", value: "10", minOrder: "1499" });
            }}
          >
            <Field label="Code" error={error}><input className="input-field" value={coupon.code} onChange={(event) => setCoupon({ ...coupon, code: event.target.value.toUpperCase() })} required /></Field>
            <Field label="Type">
              <select className="input-field" value={coupon.type} onChange={(event) => setCoupon({ ...coupon, type: event.target.value })}>
                <option value="percent">Percent</option>
                <option value="flat">Flat rupees</option>
              </select>
            </Field>
            <Field label="Value"><input className="input-field" value={coupon.value} onChange={(event) => setCoupon({ ...coupon, value: event.target.value })} required /></Field>
            <Field label="Minimum order"><input className="input-field" value={coupon.minOrder} onChange={(event) => setCoupon({ ...coupon, minOrder: event.target.value })} required /></Field>
            <button className="btn-primary self-end" type="submit">Create</button>
          </form>
          <ul className="space-y-2">
            {coupons.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-2 text-sm">
                <span className="font-semibold">{row.code}</span>
                <span>{row.type === "percent" ? `${row.value}%` : `₹${row.value}`} · min ₹{row.minOrder}</span>
                <Status value={row.status} />
              </li>
            ))}
          </ul>
        </Surface>
      )}
      {(section === "campaigns" || section === "promotions" || section === "social" || section === "overview") && (
        <Surface title={section === "social" ? "Social campaigns" : "Promotional campaigns"} className="mb-4" padded>
          <form
            className="mb-4 grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!campaign.name.trim()) return;
              addCampaign(campaign);
              setCampaign({ ...campaign, name: "", note: "" });
            }}
          >
            <Field label="Name"><input className="input-field" value={campaign.name} onChange={(event) => setCampaign({ ...campaign, name: event.target.value })} required /></Field>
            <Field label="Channel">
              <select className="input-field" value={campaign.channel} onChange={(event) => setCampaign({ ...campaign, channel: event.target.value })}>
                {["Storefront", "Instagram", "WhatsApp"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Start"><input className="input-field" type="date" value={campaign.start} onChange={(event) => setCampaign({ ...campaign, start: event.target.value })} /></Field>
            <Field label="End"><input className="input-field" type="date" value={campaign.end} onChange={(event) => setCampaign({ ...campaign, end: event.target.value })} /></Field>
            <Field label="Note"><input className="input-field" value={campaign.note} onChange={(event) => setCampaign({ ...campaign, note: event.target.value })} /></Field>
            <button className="btn-primary self-end" type="submit">Save campaign</button>
          </form>
          <ul className="space-y-2">
            {(section === "social" ? socials : section === "promotions" ? promos : campaigns).map((row) => (
              <li key={row.id} className="rounded-xl border border-gray-100 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2"><span className="font-semibold">{row.name}</span><Status value={row.status} /></div>
                <p className="text-xs text-gray-500">{row.channel} · {row.start} to {row.end}. {row.note}</p>
              </li>
            ))}
          </ul>
        </Surface>
      )}
      {(section === "featured" || section === "overview") && (
        <Surface title="Featured products" className="mb-4">
          <ul>
            {products.filter((product) => product.selected).map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-sm last:border-0">
                <span>{product.name}</span>
                <input type="checkbox" checked={product.featured} onChange={(event) => toggleFeatured(product.id, event.target.checked)} aria-label={`Feature ${product.name}`} />
              </li>
            ))}
          </ul>
        </Surface>
      )}
      {(section === "assets" || section === "overview") && (
        <Surface title="Marketing assets" className="mb-4">
          <ul>
            {assets.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-sm">
                <span><span className="block font-medium">{item.name}</span><span className="text-xs text-gray-500">{item.kind}</span></span>
                <button type="button" className="btn-soft" onClick={() => setAsset(item)}>Preview</button>
              </li>
            ))}
          </ul>
        </Surface>
      )}
      {(section === "referral" || section === "overview") && (
        <Surface title="Referral code" padded>
          <p className="text-sm">Share <strong>{referral}</strong>. This demo copies the code. It does not pay a referral fee.</p>
          <button type="button" className="btn-primary mt-3" onClick={() => navigator.clipboard?.writeText(referral)}>Copy code</button>
        </Surface>
      )}
      {asset ? (
        <Drawer title={asset.name} onClose={() => setAsset(null)}>
          <p className="text-sm text-gray-600">{asset.note}</p>
          <div className="mt-4 grid h-40 place-items-center rounded-2xl text-sm font-semibold text-white" style={{ background: brand.color }}>{brand.name}</div>
        </Drawer>
      ) : null}
    </div>
  );
}

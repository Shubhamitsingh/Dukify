import { useState } from "react";
import { assets } from "../data/seed";
import { usePartner } from "../store";
import { Drawer, Field, PageHead, Status, Surface } from "../ui";

const copy = {
  overview: ["Marketing overview", "Promotions stay inside your discount cap and the central price floor."],
  coupons: ["Discount coupons", "A new code does not change orders that already exist."],
  campaigns: ["Promotional campaigns", "Campaigns are brand content. They do not move warehouse stock."],
  featured: ["Featured products", "The same featured flag used by the storefront."],
  social: ["Social campaigns", "These are plans. No ad account is connected in the demo."],
  assets: ["Marketing assets", "Preview the creative brief. Catalogue photography stays owned by Pahachan."],
  referral: ["Referral", "Share the demo code. Redemptions are not tracked against a live programme."],
  promotions: ["Sales promotions", "Active storefront offers for this brand."],
};

export default function MarketingPage({ section }) {
  const partner = usePartner();
  const [title, description] = copy[section];
  const [coupon, setCoupon] = useState({ code: "", type: "percent", value: 10, minOrder: 1499 });
  const [couponError, setCouponError] = useState("");
  const [campaign, setCampaign] = useState({ name: "", channel: "Storefront", start: "2026-11-12", end: "2026-11-30", note: "" });
  const [asset, setAsset] = useState(null);
  const code = `${partner.brand.name.split(" ")[0].toUpperCase()}-REF`;

  return (
    <div>
      <PageHead title={title} description={description} />
      {(section === "overview" || section === "campaigns" || section === "promotions" || section === "social") && (
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          {partner.campaigns.filter((item) => section !== "social" || item.channel !== "Storefront").filter((item) => section !== "promotions" || item.channel === "Storefront").map((item) => (
            <Surface key={item.id} padded>
              <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">{item.name}</h3><Status value={item.status} /></div>
              <p className="mt-2 text-xs text-gray-500">{item.channel} · {item.start} to {item.end}</p>
              <p className="mt-2 text-sm text-gray-600">{item.note}</p>
            </Surface>
          ))}
        </div>
      )}
      {(section === "overview" || section === "coupons") && (
        <Surface title="Coupons" padded className="mb-4">
          <ul className="mb-4 divide-y divide-gray-100 dark:divide-gray-800">
            {partner.coupons.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0 break-words"><strong>{item.code}</strong> · {item.type === "percent" ? `${item.value}%` : `₹${item.value}`} · min {item.minOrder}</span>
                <Status value={item.status} />
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Code" error={couponError}><input className="input-field" value={coupon.code} onChange={(event) => setCoupon({ ...coupon, code: event.target.value.toUpperCase() })} /></Field>
            <Field label="Type">
              <select className="input-field" value={coupon.type} onChange={(event) => setCoupon({ ...coupon, type: event.target.value })}>
                <option value="percent">Percent</option>
                <option value="flat">Flat amount</option>
              </select>
            </Field>
            <Field label="Value"><input className="input-field" type="number" value={coupon.value} onChange={(event) => setCoupon({ ...coupon, value: Number(event.target.value) })} /></Field>
            <Field label="Minimum order"><input className="input-field" type="number" value={coupon.minOrder} onChange={(event) => setCoupon({ ...coupon, minOrder: Number(event.target.value) })} /></Field>
          </div>
          <button
            type="button"
            className="btn-primary mt-3"
            onClick={() => {
              if (!coupon.code.trim()) {
                setCouponError("Enter a code.");
                return;
              }
              const message = partner.addCoupon(coupon);
              setCouponError(message);
              if (!message) setCoupon({ code: "", type: "percent", value: 10, minOrder: 1499 });
            }}
          >
            Create demo coupon
          </button>
        </Surface>
      )}
      {(section === "campaigns" || section === "social") && (
        <Surface title={section === "social" ? "Plan a social campaign" : "Plan a campaign"} padded className="mb-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name"><input className="input-field" value={campaign.name} onChange={(event) => setCampaign({ ...campaign, name: event.target.value })} /></Field>
            <Field label="Channel">
              <select className="input-field" value={campaign.channel} onChange={(event) => setCampaign({ ...campaign, channel: event.target.value })}>
                {["Storefront", "Instagram", "WhatsApp"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Start"><input className="input-field" type="date" value={campaign.start} onChange={(event) => setCampaign({ ...campaign, start: event.target.value })} /></Field>
            <Field label="End"><input className="input-field" type="date" value={campaign.end} onChange={(event) => setCampaign({ ...campaign, end: event.target.value })} /></Field>
          </div>
          <button type="button" className="btn-primary mt-3" onClick={() => campaign.name.trim() && partner.addCampaign(campaign)}>Save demo campaign</button>
        </Surface>
      )}
      {section === "featured" ? (
        <Surface title="Featured styles">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {partner.products.filter((product) => product.selected && product.approval === "Approved").map((product) => (
              <li key={product.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{product.name}</span>
                <input type="checkbox" checked={product.featured} onChange={(event) => partner.toggleFeatured(product.id, event.target.checked)} aria-label={`Feature ${product.name}`} />
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}
      {section === "assets" ? (
        <div className="grid gap-3 md:grid-cols-3">
          {assets.map((item) => (
            <Surface key={item.id} padded>
              <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">{item.kind}</p>
              <h3 className="mt-1 text-sm font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.note}</p>
              <button type="button" className="btn-soft mt-3" onClick={() => setAsset(item)}>Preview brief</button>
            </Surface>
          ))}
        </div>
      ) : null}
      {section === "referral" ? (
        <Surface title="Referral code" padded>
          <p className="text-2xl font-semibold tracking-tight">{code}</p>
          <p className="mt-2 text-sm text-gray-500">Copy the code for a pitch. This demo does not pay referral commission.</p>
          <button type="button" className="btn-primary mt-3" onClick={() => navigator.clipboard.writeText(code).then(() => partner.notify("Referral code copied."))}>Copy code</button>
        </Surface>
      ) : null}
      {asset ? (
        <Drawer title={asset.name} onClose={() => setAsset(null)}>
          <p className="text-sm text-gray-600">{asset.note}</p>
          <p className="mt-3 text-xs text-gray-500">No file is downloaded. Production assets would come from the central brand kit.</p>
        </Drawer>
      ) : null}
    </div>
  );
}

MarketingPage.moduleId = "marketing";

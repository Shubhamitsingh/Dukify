import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FONTS } from "../data/seed";
import { usePartner } from "../store";
import { Field, Modal, PageHead, Status, Surface } from "../ui";

export default function StorePage() {
  const { section = "overview" } = useParams();
  const { brand, draft, published, products, saveDraft, publish } = usePartner();
  const [form, setForm] = useState(draft);
  const [device, setDevice] = useState("desktop");
  const [ask, setAsk] = useState(false);

  useEffect(() => setForm(draft), [draft, brand.id]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const featured = products.filter((product) => product.featured && product.selected);
  const dirty = JSON.stringify(form) !== JSON.stringify(published);

  const preview = (
    <div className={`mx-auto overflow-hidden rounded-2xl border border-gray-200 bg-white ${device === "mobile" ? "max-w-[320px]" : "w-full"}`}>
      <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: form.color }}>
        <strong style={{ fontFamily: form.font }}>{form.logoText || brand.name}</strong>
        <span className="text-[11px]">{form.links.map((link) => link.label).join(" · ")}</span>
      </div>
      {form.sections.find((item) => item.id === "hero")?.enabled ? (
        <div className="px-4 py-8" style={{ background: `${form.color}14` }}>
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: form.color }}>Hero</p>
          <h3 className="mt-1 text-lg font-semibold" style={{ fontFamily: form.font }}>{form.heroTitle}</h3>
          <p className="mt-1 text-sm text-gray-600">{form.heroText}</p>
        </div>
      ) : null}
      {form.banners.map((banner) => (
        <div key={banner.id} className="border-t border-gray-100 px-4 py-3">
          <p className="text-sm font-semibold">{banner.title}</p>
          <p className="text-xs text-gray-500">{banner.subtitle}</p>
        </div>
      ))}
      {form.sections.find((item) => item.id === "featured")?.enabled ? (
        <div className="grid grid-cols-2 gap-2 px-4 py-3">
          {featured.slice(0, 4).map((product) => (
            <div key={product.id} className="rounded-xl border border-gray-100 p-2 text-xs">
              <span className="mb-2 block h-8 rounded-lg" style={{ background: product.color }} />
              {product.name}
            </div>
          ))}
        </div>
      ) : null}
      {form.sections.find((item) => item.id === "about")?.enabled ? <p className="px-4 py-3 text-sm text-gray-600">{form.about}</p> : null}
      {form.sections.find((item) => item.id === "footer")?.enabled ? <p className="bg-gray-50 px-4 py-3 text-[11px] text-gray-500">{form.footer}</p> : null}
    </div>
  );

  return (
    <div>
      <PageHead
        title={{
          overview: "Store overview",
          editor: "Storefront editor",
          theme: "Theme and appearance",
          identity: "Logo and brand identity",
          homepage: "Homepage sections",
          banners: "Banners",
          navigation: "Navigation and menus",
          domain: "Domain",
          preview: "Store preview",
          publish: "Publish store",
        }[section] || "Store"}
        description="Shape your storefront. Checkout, payments, tax, and shipping stay with Pahachan."
        action={
          <>
            <button type="button" className="btn-soft" onClick={() => saveDraft(form)}>Save draft</button>
            <button type="button" className="btn-primary" onClick={() => setAsk(true)}>Publish</button>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <Status value={dirty ? "Draft" : "Live"} />
        <span>{form.domain}</span>
        {published.publishedAt ? <span>Last demo publish {new Date(published.publishedAt).toLocaleString("en-IN")}</span> : <span>Using the starter storefront</span>}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Surface title="Settings" padded>
          {(section === "overview" || section === "editor" || section === "identity") && (
            <div className="grid gap-3">
              <Field label="Logo text"><input className="input-field" value={form.logoText} onChange={(event) => set("logoText", event.target.value)} /></Field>
              <Field label="Favicon letter"><input className="input-field" maxLength={2} value={form.faviconText} onChange={(event) => set("faviconText", event.target.value)} /></Field>
            </div>
          )}
          {(section === "overview" || section === "editor" || section === "theme") && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Brand colour"><input className="input-field" type="color" value={form.color} onChange={(event) => set("color", event.target.value)} /></Field>
              <Field label="Typeface">
                <select className="input-field" value={form.font} onChange={(event) => set("font", event.target.value)}>
                  {FONTS.map((font) => <option key={font}>{font}</option>)}
                </select>
              </Field>
            </div>
          )}
          {(section === "editor" || section === "homepage" || section === "overview") && (
            <div className="mt-3 grid gap-3">
              <Field label="Hero title"><input className="input-field" value={form.heroTitle} onChange={(event) => set("heroTitle", event.target.value)} /></Field>
              <Field label="Hero text"><textarea className="input-field min-h-20" value={form.heroText} onChange={(event) => set("heroText", event.target.value)} /></Field>
              <Field label="About"><textarea className="input-field min-h-20" value={form.about} onChange={(event) => set("about", event.target.value)} /></Field>
              <Field label="Footer"><input className="input-field" value={form.footer} onChange={(event) => set("footer", event.target.value)} /></Field>
            </div>
          )}
          {(section === "homepage" || section === "editor") && (
            <ul className="mt-4 space-y-2">
              {form.sections.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-sm">
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(event) => set("sections", form.sections.map((row) => row.id === item.id ? { ...row, enabled: event.target.checked } : row))}
                  />
                </li>
              ))}
            </ul>
          )}
          {(section === "banners" || section === "editor") && (
            <div className="mt-4 space-y-3">
              {form.banners.map((banner, index) => (
                <div key={banner.id} className="grid gap-2">
                  <input className="input-field" value={banner.title} onChange={(event) => {
                    const banners = form.banners.map((row, rowIndex) => rowIndex === index ? { ...row, title: event.target.value } : row);
                    set("banners", banners);
                  }} />
                  <input className="input-field" value={banner.subtitle} onChange={(event) => {
                    const banners = form.banners.map((row, rowIndex) => rowIndex === index ? { ...row, subtitle: event.target.value } : row);
                    set("banners", banners);
                  }} />
                </div>
              ))}
              <button type="button" className="btn-soft" onClick={() => set("banners", [...form.banners, { id: `b-${Date.now()}`, title: "New banner", subtitle: "Promotional message" }])}>
                Add banner
              </button>
            </div>
          )}
          {(section === "navigation" || section === "editor") && (
            <div className="mt-4 space-y-2">
              {form.links.map((link, index) => (
                <div key={link.id} className="grid grid-cols-2 gap-2">
                  <input className="input-field" value={link.label} onChange={(event) => set("links", form.links.map((row, rowIndex) => rowIndex === index ? { ...row, label: event.target.value } : row))} />
                  <input className="input-field" value={link.href} onChange={(event) => set("links", form.links.map((row, rowIndex) => rowIndex === index ? { ...row, href: event.target.value } : row))} />
                </div>
              ))}
            </div>
          )}
          {(section === "domain" || section === "overview") && (
            <div className="mt-3">
              <Field label="Store domain">
                <input className="input-field" value={form.domain} onChange={(event) => set("domain", event.target.value.toLowerCase().replace(/\s/g, ""))} />
              </Field>
              <p className="mt-2 text-xs text-gray-500">Custom DNS is handled by Pahachan. This field only stores the requested host.</p>
            </div>
          )}
          {section === "publish" ? (
            <div className="mt-2 text-sm text-gray-600">
              <p>{dirty ? "The draft differs from the published storefront." : "The draft matches the published storefront."}</p>
              <p className="mt-2 text-xs text-gray-500">Locked: checkout, payment gateway, tax, courier, and warehouse settings.</p>
            </div>
          ) : null}
        </Surface>
        <Surface
          title="Live preview"
          action={
            <div className="flex gap-2">
              <button type="button" className="btn-soft" onClick={() => setDevice("desktop")}>Desktop</button>
              <button type="button" className="btn-soft" onClick={() => setDevice("mobile")}>Mobile</button>
            </div>
          }
          padded
        >
          {preview}
        </Surface>
      </div>
      {ask ? (
        <Modal
          title="Publish this draft?"
          body="This demo copies the draft over the published preview. It does not change central checkout or shipping."
          confirmLabel="Publish demo"
          onClose={() => setAsk(false)}
          onConfirm={() => {
            publish(form);
            setAsk(false);
          }}
        />
      ) : null}
    </div>
  );
}

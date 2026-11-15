import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ExternalLink,
  Globe,
  LayoutTemplate,
  Monitor,
  Palette,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { FONTS } from "../data/seed";
import { usePartner } from "../store";
import { Field, Modal, PageHead, SoftButton, Status, Surface } from "../ui";

const copy = {
  overview: ["Store overview", "Your public storefront uses the last published draft. Checkout, tax, and shipping stay with Pahachan."],
  editor: ["Storefront editor", "Change the parts of the store you own. Save a draft before you publish."],
  theme: ["Theme and appearance", "Pick a permitted colour and typeface. Platform checkout styling does not change."],
  identity: ["Logo and brand identity", "The logo mark is text in this demo. A file upload is simulated as the letters you enter."],
  homepage: ["Homepage sections", "Turn sections on or off. The preview follows this order."],
  banners: ["Banners", "Promotional banners render in the preview. They do not create a live campaign by themselves."],
  navigation: ["Navigation and menus", "These links appear in the storefront header."],
  domain: ["Domain", "The demo subdomain is reserved for this brand. Custom DNS is not connected."],
  preview: ["Store preview", "This preview reads the current draft, including unsaved edits on this page."],
  publish: ["Publish store", "Publishing copies the draft over the live demo storefront."],
};

function Preview({ draft, products, mode }) {
  const featured = products.filter((product) => product.featured && product.selected).slice(0, 3);
  const mobile = mode === "mobile";
  return (
    <div
      className={`overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 ${
        mobile ? "mx-auto max-w-[320px] rounded-[1.75rem]" : "rounded-2xl"
      }`}
    >
      {mobile ? <div className="mx-auto mt-2 mb-1 h-1 w-16 rounded-full bg-gray-200 dark:bg-gray-700" /> : null}
      <div className="flex items-center justify-between gap-2 px-4 py-3 text-white" style={{ background: draft.color }}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/20 text-[11px] font-bold">
            {(draft.faviconText || draft.logoText || "B").slice(0, 1)}
          </span>
          <strong className="min-w-0 truncate text-sm" style={{ fontFamily: draft.font }}>
            {draft.logoText || "Brand"}
          </strong>
        </div>
        {!mobile ? (
          <span className="max-w-[55%] truncate text-[11px] text-white/85">{draft.links.map((link) => link.label).join(" · ")}</span>
        ) : (
          <span className="text-[11px] text-white/80">Menu</span>
        )}
      </div>
      {draft.sections.find((section) => section.id === "hero")?.enabled ? (
        <div className="px-4 py-7 sm:py-8" style={{ background: `${draft.color}12` }}>
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase" style={{ color: draft.color }}>
            New season
          </p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight sm:text-xl" style={{ fontFamily: draft.font }}>
            {draft.heroTitle}
          </h3>
          <p className="mt-1.5 max-w-xl text-sm leading-5 text-gray-600 dark:text-gray-300">{draft.heroText}</p>
          <button type="button" className="mt-4 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white" style={{ background: draft.color }}>
            Shop now
          </button>
        </div>
      ) : null}
      {draft.banners.length ? (
        <div className="space-y-2 px-4 py-3">
          {draft.banners.map((banner) => (
            <div key={banner.id} className="rounded-xl border border-dashed px-3 py-2.5" style={{ borderColor: `${draft.color}55`, background: `${draft.color}08` }}>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{banner.title}</p>
              <p className="text-xs text-gray-500">{banner.subtitle}</p>
            </div>
          ))}
        </div>
      ) : null}
      {draft.sections.find((section) => section.id === "featured")?.enabled ? (
        <div className="px-4 pb-4">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">Featured</p>
          <div className={`grid gap-2 ${mobile ? "grid-cols-2" : "grid-cols-3"}`}>
            {featured.map((product) => (
              <div key={product.id} className="rounded-xl bg-gray-50 p-2 dark:bg-gray-800/80">
                <div className="mb-2 h-14 rounded-lg sm:h-16" style={{ background: product.color }} />
                <p className="truncate text-[11px] font-medium text-gray-800 dark:text-gray-100">{product.name}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {draft.sections.find((section) => section.id === "about")?.enabled ? (
        <p className="px-4 pb-4 text-sm leading-5 text-gray-600 dark:text-gray-300">{draft.about}</p>
      ) : null}
      {draft.sections.find((section) => section.id === "footer")?.enabled ? (
        <p className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-[11px] text-gray-500 dark:border-gray-800 dark:bg-gray-950/40">{draft.footer}</p>
      ) : null}
    </div>
  );
}

function Overview({ partner, draft, mode, setMode, onPublish, onSave }) {
  const navigate = useNavigate();
  const draftDiffers = JSON.stringify(draft) === JSON.stringify(partner.published) ? false : true;
  const enabledSections = draft.sections.filter((item) => item.enabled).length;
  const featuredCount = partner.products.filter((product) => product.featured && product.selected).length;
  const shortcuts = [
    { label: "Edit theme", to: "/brand/store/theme", icon: Palette },
    { label: "Identity", to: "/brand/store/identity", icon: Sparkles },
    { label: "Homepage", to: "/brand/store/homepage", icon: LayoutTemplate },
    { label: "Domain", to: "/brand/store/domain", icon: Globe },
  ];

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Surface padded>
          <p className="text-[11px] font-medium text-gray-500">Store status</p>
          <div className="mt-2"><Status value={partner.brand.status} /></div>
        </Surface>
        <Surface padded>
          <p className="text-[11px] font-medium text-gray-500">Draft status</p>
          <p className={`mt-2 text-sm font-semibold ${draftDiffers ? "text-amber-700" : "text-emerald-700"}`}>
            {draftDiffers ? "Unpublished changes" : "In sync"}
          </p>
        </Surface>
        <Surface padded>
          <p className="text-[11px] font-medium text-gray-500">Live domain</p>
          <p className="mt-2 truncate text-sm font-semibold text-gray-900 dark:text-white">{partner.published.domain}</p>
        </Surface>
        <Surface padded>
          <p className="text-[11px] font-medium text-gray-500">Sections on</p>
          <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
            {enabledSections}/{draft.sections.length}
            <span className="ml-1 text-xs font-medium text-gray-400">· {featuredCount} featured</span>
          </p>
        </Surface>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <Surface title="Brand snapshot" padded>
            <div className="flex items-start gap-3">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-base font-bold text-white shadow-sm"
                style={{ background: draft.color }}
              >
                {(draft.faviconText || draft.logoText || "B").slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-gray-900 dark:text-white" style={{ fontFamily: draft.font }}>
                  {draft.logoText || partner.brand.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500">{draft.heroTitle}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium dark:border-gray-700 dark:bg-gray-900">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: draft.color }} />
                    {draft.color}
                  </span>
                  <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium dark:border-gray-700 dark:bg-gray-900">
                    {draft.font}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-5 text-gray-600 dark:text-gray-300">{draft.heroText}</p>
          </Surface>

          <Surface title="Homepage sections" padded>
            <ul className="space-y-2">
              {draft.sections.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                  <span className="text-sm text-gray-700 dark:text-gray-200">{item.label}</span>
                  <span className={`text-[11px] font-semibold ${item.enabled ? "text-emerald-700" : "text-gray-400"}`}>
                    {item.enabled ? "On" : "Off"}
                  </span>
                </li>
              ))}
            </ul>
            <SoftButton className="mt-3" onClick={() => navigate("/brand/store/homepage")}>
              Manage sections
            </SoftButton>
          </Surface>

          <Surface title="Quick actions" padded>
            <div className="grid grid-cols-2 gap-2">
              {shortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => navigate(item.to)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-gray-700 transition hover:border-pink-200 hover:bg-pink-50/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  >
                    <Icon className="h-3.5 w-3.5 text-pink-600" />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-soft" onClick={onSave}>
                Save draft
              </button>
              <button type="button" className="btn-primary" onClick={onPublish}>
                Publish
              </button>
              <button type="button" className="btn-soft" onClick={() => navigate("/brand/store/editor")}>
                Open editor
              </button>
            </div>
          </Surface>

          <Surface title="Publish details" padded>
            <dl className="space-y-2.5 text-sm">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                <dt className="text-gray-500">Published domain</dt>
                <dd className="break-all font-medium">{partner.published.domain}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                <dt className="text-gray-500">Draft domain</dt>
                <dd className="break-all font-medium">{draft.domain}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                <dt className="text-gray-500">Last publish</dt>
                <dd className="font-medium">{partner.published.publishedAt || "Not published yet"}</dd>
              </div>
            </dl>
          </Surface>
        </div>

        <Surface
          title="Live preview"
          padded
          action={
            <div className="flex gap-1.5">
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold ${
                  mode === "desktop" ? "border-pink-500 bg-pink-50 text-pink-800" : "border-gray-200 bg-white text-gray-600"
                }`}
                onClick={() => setMode("desktop")}
              >
                <Monitor className="h-3.5 w-3.5" />
                Desktop
              </button>
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold ${
                  mode === "mobile" ? "border-pink-500 bg-pink-50 text-pink-800" : "border-gray-200 bg-white text-gray-600"
                }`}
                onClick={() => setMode("mobile")}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile
              </button>
            </div>
          }
        >
          <div className="mb-3 flex items-center justify-between gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5 truncate">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              {draft.domain}
            </span>
            <span>{draftDiffers ? "Showing draft" : "Matches live"}</span>
          </div>
          <div className={`rounded-2xl bg-gray-50 p-3 dark:bg-gray-950/40 ${mode === "mobile" ? "py-5" : ""}`}>
            <Preview draft={draft} products={partner.products} mode={mode} />
          </div>
        </Surface>
      </div>
    </div>
  );
}

export default function StorePage({ section }) {
  const partner = usePartner();
  const [brandId, setBrandId] = useState(partner.brand.id);
  const [draft, setDraft] = useState(partner.draft);
  const [mode, setMode] = useState("desktop");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  if (brandId !== partner.brand.id) {
    setBrandId(partner.brand.id);
    setDraft(partner.draft);
  }
  const [title, description] = copy[section];

  function update(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function validate() {
    if (!draft.logoText.trim() || !draft.heroTitle.trim() || !draft.domain.trim()) {
      setError("Logo text, hero title, and domain are required.");
      return false;
    }
    if (!/^[a-z0-9.-]+$/.test(draft.domain)) {
      setError("Use a lowercase domain without spaces.");
      return false;
    }
    setError("");
    return true;
  }

  const showIdentity = ["editor", "identity"].includes(section);
  const showTheme = ["editor", "theme"].includes(section);
  const showHome = ["editor", "homepage"].includes(section);
  const showBanners = ["editor", "banners"].includes(section);
  const showNav = ["editor", "navigation"].includes(section);
  const showDomain = ["editor", "domain"].includes(section);
  const showPreview = ["editor", "preview", "publish"].includes(section);

  if (section === "overview") {
    return (
      <div>
        <PageHead
          title={title}
          description={description}
          action={
            <>
              <button type="button" className="btn-soft" onClick={() => validate() && partner.saveDraft(draft)}>
                Save draft
              </button>
              <button type="button" className="btn-primary" onClick={() => validate() && setConfirm(true)}>
                Publish
              </button>
            </>
          }
        />
        {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
        <Overview
          partner={partner}
          draft={draft}
          mode={mode}
          setMode={setMode}
          onSave={() => validate() && partner.saveDraft(draft)}
          onPublish={() => validate() && setConfirm(true)}
        />
        {confirm ? (
          <Modal
            title="Publish this draft?"
            body="This demo copies the draft onto the brand storefront stored in this browser. Central checkout and fulfilment settings stay unchanged."
            confirmLabel="Publish demo"
            onClose={() => setConfirm(false)}
            onConfirm={() => {
              partner.publish(draft);
              setConfirm(false);
            }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <PageHead
        title={title}
        description={description}
        action={
          <>
            <button type="button" className="btn-soft" onClick={() => validate() && partner.saveDraft(draft)}>
              Save draft
            </button>
            <button type="button" className="btn-primary" onClick={() => validate() && setConfirm(true)}>
              Publish
            </button>
          </>
        }
      />
      {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
      <div className={`grid gap-4 ${showPreview ? "xl:grid-cols-[0.9fr_1.1fr]" : ""}`}>
        <div className="space-y-4">
          {showIdentity ? (
            <Surface title="Identity" padded>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Logo text">
                  <input className="input-field" value={draft.logoText} onChange={(event) => update({ logoText: event.target.value })} />
                </Field>
                <Field label="Favicon letter">
                  <input className="input-field" maxLength={2} value={draft.faviconText} onChange={(event) => update({ faviconText: event.target.value })} />
                </Field>
              </div>
            </Surface>
          ) : null}
          {showTheme ? (
            <Surface title="Theme" padded>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Brand colour">
                  <input className="input-field" type="color" value={draft.color} onChange={(event) => update({ color: event.target.value })} />
                </Field>
                <Field label="Typography">
                  <select className="input-field" value={draft.font} onChange={(event) => update({ font: event.target.value })}>
                    {FONTS.map((font) => (
                      <option key={font}>{font}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Hero title">
                  <input className="input-field" value={draft.heroTitle} onChange={(event) => update({ heroTitle: event.target.value })} />
                </Field>
              </div>
              <Field label="Hero text">
                <textarea className="input-field mt-3 min-h-20" value={draft.heroText} onChange={(event) => update({ heroText: event.target.value })} />
              </Field>
            </Surface>
          ) : null}
          {showHome ? (
            <Surface title="Homepage sections" padded>
              <div className="space-y-2">
                {draft.sections.map((item) => (
                  <label key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-sm dark:border-gray-700">
                    {item.label}
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(event) =>
                        update({
                          sections: draft.sections.map((sectionItem) =>
                            sectionItem.id === item.id ? { ...sectionItem, enabled: event.target.checked } : sectionItem,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <Field label="About brand">
                <textarea className="input-field mt-3 min-h-20" value={draft.about} onChange={(event) => update({ about: event.target.value })} />
              </Field>
              <Field label="Footer">
                <input className="input-field mt-3" value={draft.footer} onChange={(event) => update({ footer: event.target.value })} />
              </Field>
            </Surface>
          ) : null}
          {showBanners ? (
            <Surface title="Banners" padded>
              <div className="space-y-3">
                {draft.banners.map((banner) => (
                  <div key={banner.id} className="grid gap-2 sm:grid-cols-2">
                    <input
                      className="input-field"
                      value={banner.title}
                      onChange={(event) =>
                        update({ banners: draft.banners.map((item) => (item.id === banner.id ? { ...item, title: event.target.value } : item)) })
                      }
                    />
                    <input
                      className="input-field"
                      value={banner.subtitle}
                      onChange={(event) =>
                        update({ banners: draft.banners.map((item) => (item.id === banner.id ? { ...item, subtitle: event.target.value } : item)) })
                      }
                    />
                  </div>
                ))}
              </div>
            </Surface>
          ) : null}
          {showNav ? (
            <Surface title="Navigation" padded>
              <div className="space-y-2">
                {draft.links.map((link) => (
                  <div key={link.id} className="grid gap-2 sm:grid-cols-2">
                    <input
                      className="input-field"
                      value={link.label}
                      onChange={(event) =>
                        update({ links: draft.links.map((item) => (item.id === link.id ? { ...item, label: event.target.value } : item)) })
                      }
                    />
                    <input
                      className="input-field"
                      value={link.href}
                      onChange={(event) =>
                        update({ links: draft.links.map((item) => (item.id === link.id ? { ...item, href: event.target.value } : item)) })
                      }
                    />
                  </div>
                ))}
              </div>
            </Surface>
          ) : null}
          {showDomain ? (
            <Surface title="Domain" padded>
              <Field label="Store domain" error={error}>
                <input className="input-field" value={draft.domain} onChange={(event) => update({ domain: event.target.value })} />
              </Field>
              <p className="mt-2 text-xs text-gray-500">This demo does not register DNS. The published domain is shown inside the portal.</p>
            </Surface>
          ) : null}
          {section === "publish" ? (
            <Surface title="Ready to publish" padded>
              <p className="text-sm text-gray-600">
                Live domain: {partner.published.domain}. Draft domain: {draft.domain}.{" "}
                {partner.published.publishedAt ? `Last demo publish ${partner.published.publishedAt}.` : "This brand has not published a custom draft yet."}
              </p>
            </Surface>
          ) : null}
        </div>
        {showPreview ? (
          <Surface
            title="Live preview of the draft"
            padded
            action={
              <div className="flex gap-2">
                <button type="button" className="btn-soft" onClick={() => setMode("desktop")}>
                  Desktop
                </button>
                <button type="button" className="btn-soft" onClick={() => setMode("mobile")}>
                  Mobile
                </button>
              </div>
            }
          >
            <div className={`rounded-2xl bg-gray-50 p-3 dark:bg-gray-950/40 ${mode === "mobile" ? "py-5" : ""}`}>
              <Preview draft={draft} products={partner.products} mode={mode} />
            </div>
          </Surface>
        ) : null}
      </div>
      {confirm ? (
        <Modal
          title="Publish this draft?"
          body="This demo copies the draft onto the brand storefront stored in this browser. Central checkout and fulfilment settings stay unchanged."
          confirmLabel="Publish demo"
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            partner.publish(draft);
            setConfirm(false);
          }}
        />
      ) : null}
    </div>
  );
}

StorePage.moduleId = "store";

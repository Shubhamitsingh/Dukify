import { useState } from "react";
import { documents } from "../data/seed";
import { usePartner } from "../store";
import { Drawer, Field, Modal, PageHead, Status, Surface } from "../ui";

const copy = {
  profile: ["Brand profile", "The public name and story customers see."],
  business: ["Business information", "Legal entity details used on invoices. GST edits are demo-only."],
  contact: ["Contact information", "Who Dukify should call for this brand."],
  store: ["Store information", "City, focus, and the published domain."],
  security: ["Account security", "This browser session. Two-factor authentication is requested, not switched on locally."],
  password: ["Password", "Updates the demo password stored in this browser."],
  team: ["Team members", "Seats appear only when the brand has team access enabled."],
  preferences: ["Notification preferences", "Which notice types this demo login wants to emphasise."],
  bank: ["Bank and settlement details", "The account is masked. Confirm before replacing it."],
  legal: ["Legal documents", "Verified files held by Dukify. This demo shows the record, not the file."],
};

export default function SettingsPage({ section }) {
  const partner = usePartner();
  const brand = partner.brand;
  const [title, description] = copy[section] || ["Settings", "Brand account settings for this demo login."];
  const [profile, setProfile] = useState({ name: brand.name, about: brand.about, focus: brand.focus });
  const [business, setBusiness] = useState({ legalName: brand.legalName, gstin: brand.gstin });
  const [contact, setContact] = useState({ contactName: brand.contactName, phone: brand.phone, email: brand.email });
  const [seen, setSeen] = useState(brand.id);
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [member, setMember] = useState({ name: "", email: "", role: "Marketing" });
  const [memberError, setMemberError] = useState("");
  const [prefs, setPrefs] = useState(partner.prefs);
  const [bank, setBank] = useState(brand.bank);
  const [confirmBank, setConfirmBank] = useState(false);
  const [doc, setDoc] = useState(null);
  const [removeId, setRemoveId] = useState(null);
  if (seen !== brand.id) {
    setSeen(brand.id);
    setProfile({ name: brand.name, about: brand.about, focus: brand.focus });
    setBusiness({ legalName: brand.legalName, gstin: brand.gstin });
    setContact({ contactName: brand.contactName, phone: brand.phone, email: brand.email });
    setPrefs(partner.prefs);
    setBank(brand.bank);
  }

  return (
    <div>
      <PageHead title={title} description={description} />
      {section === "profile" ? (
        <Surface padded>
          <div className="grid gap-3">
            <Field label="Brand name"><input className="input-field" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></Field>
            <Field label="Focus"><input className="input-field" value={profile.focus} onChange={(event) => setProfile({ ...profile, focus: event.target.value })} /></Field>
            <Field label="About"><textarea className="input-field min-h-24" value={profile.about} onChange={(event) => setProfile({ ...profile, about: event.target.value })} /></Field>
            <button type="button" className="btn-primary w-fit" onClick={() => partner.saveProfile(profile)}>Save profile</button>
          </div>
        </Surface>
      ) : null}
      {section === "business" ? (
        <Surface padded>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Legal name"><input className="input-field" value={business.legalName} onChange={(event) => setBusiness({ ...business, legalName: event.target.value })} /></Field>
            <Field label="GSTIN"><input className="input-field" value={business.gstin} onChange={(event) => setBusiness({ ...business, gstin: event.target.value })} /></Field>
          </div>
          <button type="button" className="btn-primary mt-3" onClick={() => partner.saveProfile(business)}>Save business details</button>
        </Surface>
      ) : null}
      {section === "contact" ? (
        <Surface padded>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Contact name"><input className="input-field" value={contact.contactName} onChange={(event) => setContact({ ...contact, contactName: event.target.value })} /></Field>
            <Field label="Phone"><input className="input-field" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} /></Field>
            <Field label="Email"><input className="input-field" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} /></Field>
          </div>
          <button type="button" className="btn-primary mt-3" onClick={() => partner.saveProfile(contact)}>Save contact</button>
        </Surface>
      ) : null}
      {section === "store" ? (
        <Surface padded>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3"><dt className="text-gray-500">Status</dt><dd><Status value={brand.status} /></dd></div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between"><dt className="text-gray-500">City</dt><dd className="break-words">{brand.address}</dd></div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between"><dt className="text-gray-500">Domain</dt><dd className="break-all">{partner.published.domain}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Partner since</dt><dd>{brand.since}</dd></div>
          </dl>
        </Surface>
      ) : null}
      {section === "security" ? (
        <Surface padded>
          <p className="text-sm">Signed in as {brand.email}. Session is stored in this browser only.</p>
          <p className="mt-2 text-sm text-gray-500">{partner.twoFa ? "A 2FA request is on file for the security team." : "Two-factor authentication is not enabled."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={partner.requestTwoFa} disabled={partner.twoFa}>Request 2FA</button>
            <button type="button" className="btn-soft" onClick={partner.resetDemo}>Reset demo data</button>
            <button
              type="button"
              className="btn-soft"
              onClick={() => {
                localStorage.removeItem("pahachan-unified-session");
                localStorage.removeItem("pahachan-partner-session");
                localStorage.removeItem("pahachan-session");
                window.location.assign("/");
              }}
            >
              Log out
            </button>
          </div>
        </Surface>
      ) : null}
      {section === "password" ? (
        <Surface padded>
          <div className="grid max-w-md gap-3">
            <Field label="Current password" error={passwordError}><input className="input-field" type="password" value={password.current} onChange={(event) => setPassword({ ...password, current: event.target.value })} /></Field>
            <Field label="New password"><input className="input-field" type="password" value={password.next} onChange={(event) => setPassword({ ...password, next: event.target.value })} /></Field>
            <Field label="Confirm"><input className="input-field" type="password" value={password.confirm} onChange={(event) => setPassword({ ...password, confirm: event.target.value })} /></Field>
            <button type="button" className="btn-primary w-fit" onClick={() => setPasswordError(partner.changePassword(password.next, password.confirm, password.current))}>Update demo password</button>
          </div>
        </Surface>
      ) : null}
      {section === "team" ? (
        <Surface padded>
          {brand.teamEnabled ? (
            <>
              <ul className="mb-4 divide-y divide-gray-100 dark:divide-gray-800">
                {brand.team.map((person) => (
                  <li key={person.id} className="flex flex-col gap-2 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="min-w-0"><span className="font-medium">{person.name}</span><span className="block break-all text-xs text-gray-500">{person.email} · {person.role}</span></span>
                    {person.role === "Owner" ? null : <button type="button" className="btn-soft w-fit" onClick={() => setRemoveId(person.id)}>Remove</button>}
                  </li>
                ))}
              </ul>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Name" error={memberError}><input className="input-field" value={member.name} onChange={(event) => setMember({ ...member, name: event.target.value })} /></Field>
                <Field label="Email"><input className="input-field" value={member.email} onChange={(event) => setMember({ ...member, email: event.target.value })} /></Field>
                <Field label="Role">
                  <select className="input-field" value={member.role} onChange={(event) => setMember({ ...member, role: event.target.value })}>
                    <option>Marketing</option>
                    <option>Analyst</option>
                  </select>
                </Field>
              </div>
              <button type="button" className="btn-primary mt-3" onClick={() => setMemberError(partner.addMember(member))}>Add teammate</button>
            </>
          ) : <p className="text-sm text-gray-600">Team access is not enabled for {brand.name}. Dukify turns this on per agreement.</p>}
        </Surface>
      ) : null}
      {section === "preferences" ? (
        <Surface padded>
          <div className="space-y-2">
            {Object.entries(prefs).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-sm capitalize">
                {key}
                <input type="checkbox" checked={value} onChange={(event) => setPrefs({ ...prefs, [key]: event.target.checked })} />
              </label>
            ))}
          </div>
          <button type="button" className="btn-primary mt-3" onClick={() => partner.savePrefs(prefs)}>Save preferences</button>
        </Surface>
      ) : null}
      {section === "bank" ? (
        <Surface padded>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Account name"><input className="input-field" value={bank.holder} onChange={(event) => setBank({ ...bank, holder: event.target.value })} /></Field>
            <Field label="Bank"><input className="input-field" value={bank.bank} onChange={(event) => setBank({ ...bank, bank: event.target.value })} /></Field>
            <Field label="Masked account"><input className="input-field" value={bank.account} onChange={(event) => setBank({ ...bank, account: event.target.value })} /></Field>
            <Field label="IFSC"><input className="input-field" value={bank.ifsc} onChange={(event) => setBank({ ...bank, ifsc: event.target.value })} /></Field>
          </div>
          <button type="button" className="btn-primary mt-3" onClick={() => setConfirmBank(true)}>Save settlement account</button>
        </Surface>
      ) : null}
      {section === "legal" ? (
        <div className="grid gap-3 md:grid-cols-3">
          {documents.map((item) => (
            <Surface key={item.id} padded>
              <h3 className="text-sm font-semibold">{item.name}</h3>
              <div className="mt-2"><Status value={item.status} /></div>
              <p className="mt-2 text-xs text-gray-500">Updated {item.updated}</p>
              <button type="button" className="btn-soft mt-3" onClick={() => setDoc(item)}>View record</button>
            </Surface>
          ))}
        </div>
      ) : null}
      {confirmBank ? <Modal title="Replace settlement account?" body="This demo stores the new account in the browser. It does not notify a bank." confirmLabel="Save" onClose={() => setConfirmBank(false)} onConfirm={() => { partner.saveBank(bank); setConfirmBank(false); }} /> : null}
      {removeId ? <Modal title="Remove teammate?" body="They disappear from this demo team list." danger confirmLabel="Remove" onClose={() => setRemoveId(null)} onConfirm={() => { partner.removeMember(removeId); setRemoveId(null); }} /> : null}
      {doc ? <Drawer title={doc.name} onClose={() => setDoc(null)}><p className="text-sm">Status {doc.status}. The signed file stays with Dukify records. This panel is the demo index entry only.</p></Drawer> : null}
    </div>
  );
}

SettingsPage.moduleId = "settings";

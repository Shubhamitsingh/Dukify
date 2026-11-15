import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { documents } from "../data/seed";
import { usePartner } from "../store";
import { Drawer, Field, Modal, PageHead, Status, Surface } from "../ui";

export default function Settings() {
  const { section = "profile" } = useParams();
  const navigate = useNavigate();
  const partner = usePartner();
  const { brand } = partner;
  const [profile, setProfile] = useState({ contactName: brand.contactName, phone: brand.phone, about: brand.about, city: brand.city });
  const [bank, setBank] = useState(brand.bank);
  const [confirmBank, setConfirmBank] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [member, setMember] = useState({ name: "", email: "", role: "Marketing" });
  const [memberError, setMemberError] = useState("");
  const [prefs, setPrefs] = useState(partner.prefs);
  const [doc, setDoc] = useState(null);
  const [removeId, setRemoveId] = useState(null);

  useEffect(() => {
    setProfile({ contactName: brand.contactName, phone: brand.phone, about: brand.about, city: brand.city });
    setBank(brand.bank);
    setPrefs(partner.prefs);
  }, [brand.id]);

  return (
    <div>
      <PageHead title="Account and settings" description="Sensitive fields stay on this brand. Logout ends the demo session." action={<button type="button" className="btn-soft" onClick={() => { localStorage.removeItem("pahachan-partner-session"); window.location.assign("/login"); }}>Log out</button>} />
      {section === "profile" || section === "contact" ? (
        <Surface title={section === "contact" ? "Contact information" : "Brand profile"} padded>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); partner.saveProfile(profile); }}>
            <Field label="Contact name"><input className="input-field" value={profile.contactName} onChange={(event) => setProfile({ ...profile, contactName: event.target.value })} /></Field>
            <Field label="Phone"><input className="input-field" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></Field>
            <Field label="City"><input className="input-field" value={profile.city} onChange={(event) => setProfile({ ...profile, city: event.target.value })} /></Field>
            <Field label="About the brand"><textarea className="input-field min-h-20" value={profile.about} onChange={(event) => setProfile({ ...profile, about: event.target.value })} /></Field>
            <button className="btn-primary w-fit" type="submit">Save profile</button>
          </form>
        </Surface>
      ) : null}
      {section === "business" ? (
        <Surface title="Business information" padded>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-gray-500">Legal name</dt><dd>{brand.legalName}</dd></div>
            <div><dt className="text-xs text-gray-500">GSTIN</dt><dd>{brand.gstin}</dd></div>
            <div><dt className="text-xs text-gray-500">State</dt><dd>{brand.state}</dd></div>
            <div><dt className="text-xs text-gray-500">Partner since</dt><dd>{brand.since}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-gray-500">Legal name and GSTIN are locked in this demo. Ask Pahachan support to change them.</p>
        </Surface>
      ) : null}
      {section === "store" ? (
        <Surface title="Store information" padded>
          <p className="text-sm">{brand.domain}</p>
          <p className="text-sm text-gray-500">{brand.focus}</p>
          <Status value={brand.status} />
          <button type="button" className="btn-primary mt-3" onClick={() => navigate("/brand/store/editor")}>Open storefront editor</button>
        </Surface>
      ) : null}
      {section === "security" ? (
        <Surface title="Account security" padded>
          <p className="text-sm">Last demo sign-in on this browser. Two-factor authentication is controlled by Pahachan.</p>
          <button type="button" className="btn-primary mt-3" disabled={partner.twoFa} onClick={partner.requestTwoFa}>{partner.twoFa ? "2FA request noted" : "Request 2FA"}</button>
          <button type="button" className="btn-soft mt-3 ml-2" onClick={partner.resetDemo}>Reset demo data</button>
        </Surface>
      ) : null}
      {section === "password" ? (
        <Surface title="Password" padded>
          <form className="grid max-w-md gap-3" onSubmit={(event) => { event.preventDefault(); setPasswordError(partner.changePassword(passwords.next, passwords.confirm, passwords.current)); }}>
            <Field label="Current password" error={passwordError}><input className="input-field" type="password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} /></Field>
            <Field label="New password"><input className="input-field" type="password" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} /></Field>
            <Field label="Confirm"><input className="input-field" type="password" value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} /></Field>
            <button className="btn-primary w-fit" type="submit">Update password</button>
          </form>
        </Surface>
      ) : null}
      {section === "team" ? (
        <Surface title="Team members" padded>
          {brand.teamEnabled ? (
            <>
              <ul className="mb-4 space-y-2">
                {brand.team.map((person) => (
                  <li key={person.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2 text-sm">
                    <span>{person.name} · {person.email}<span className="block text-xs text-gray-500">{person.role}</span></span>
                    {person.role === "Owner" ? null : <button type="button" className="btn-soft" onClick={() => setRemoveId(person.id)}>Remove</button>}
                  </li>
                ))}
              </ul>
              <form className="grid gap-3 sm:grid-cols-4" onSubmit={(event) => { event.preventDefault(); setMemberError(partner.addMember(member)); }}>
                <Field label="Name" error={memberError}><input className="input-field" value={member.name} onChange={(event) => setMember({ ...member, name: event.target.value })} /></Field>
                <Field label="Email"><input className="input-field" value={member.email} onChange={(event) => setMember({ ...member, email: event.target.value })} /></Field>
                <Field label="Role">
                  <select className="input-field" value={member.role} onChange={(event) => setMember({ ...member, role: event.target.value })}>
                    <option>Marketing</option>
                    <option>Analyst</option>
                  </select>
                </Field>
                <button className="btn-primary self-end" type="submit">Add</button>
              </form>
            </>
          ) : <p className="text-sm text-gray-600">Team seats are not enabled for {brand.name}. Pahachan can turn them on later.</p>}
        </Surface>
      ) : null}
      {section === "preferences" ? (
        <Surface title="Notification preferences" padded>
          <form onSubmit={(event) => { event.preventDefault(); partner.savePrefs(prefs); }}>
            {Object.entries(prefs).map(([key, value]) => (
              <label key={key} className="mb-2 flex items-center justify-between text-sm capitalize">
                {key}
                <input type="checkbox" checked={value} onChange={(event) => setPrefs({ ...prefs, [key]: event.target.checked })} />
              </label>
            ))}
            <button className="btn-primary mt-3" type="submit">Save preferences</button>
          </form>
        </Surface>
      ) : null}
      {section === "bank" ? (
        <Surface title="Bank and settlement details" padded>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); setConfirmBank(true); }}>
            <Field label="Account holder"><input className="input-field" value={bank.holder} onChange={(event) => setBank({ ...bank, holder: event.target.value })} /></Field>
            <Field label="Bank"><input className="input-field" value={bank.bank} onChange={(event) => setBank({ ...bank, bank: event.target.value })} /></Field>
            <Field label="Account"><input className="input-field" value={bank.account} onChange={(event) => setBank({ ...bank, account: event.target.value })} /></Field>
            <Field label="IFSC"><input className="input-field" value={bank.ifsc} onChange={(event) => setBank({ ...bank, ifsc: event.target.value.toUpperCase() })} /></Field>
            <button className="btn-primary w-fit" type="submit">Save account</button>
          </form>
        </Surface>
      ) : null}
      {section === "legal" ? (
        <Surface title="Legal documents">
          <ul>
            {documents.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-sm">
                <span>{item.name}<span className="block text-xs text-gray-500">Updated {item.updated}</span></span>
                <span className="flex items-center gap-2"><Status value={item.status} /><button type="button" className="btn-soft" onClick={() => setDoc(item)}>View</button></span>
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}
      {confirmBank ? <Modal title="Update settlement account?" body="This demo stores the account in the browser. It does not verify the IFSC or send a payout." confirmLabel="Save demo account" onClose={() => setConfirmBank(false)} onConfirm={() => { partner.saveBank(bank); setConfirmBank(false); }} /> : null}
      {removeId ? <Modal title="Remove teammate?" body="They will disappear from this demo team list. No email is sent." danger confirmLabel="Remove" onClose={() => setRemoveId(null)} onConfirm={() => { partner.removeMember(removeId); setRemoveId(null); }} /> : null}
      {doc ? <Drawer title={doc.name} onClose={() => setDoc(null)}><p className="text-sm text-gray-600">Demo copy of {doc.name} for {brand.legalName}. Status {doc.status}. The original file stays with Pahachan.</p></Drawer> : null}
      </div>
  );
}

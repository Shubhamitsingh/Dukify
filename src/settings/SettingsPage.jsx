import { useMemo, useState } from "react";
import { PageHead } from "../ui";
import { useStore } from "../store";
import { normalizeSettings } from "./data/defaults";
import { SettingsChrome } from "./components/SettingsChrome";
import {
  AlertsSection,
  CommerceSection,
  CompanySection,
  DataSection,
  PreferencesSection,
} from "./components/SettingsSections";

export function SettingsPage() {
  const { db, saveSettings } = useStore();
  const [section, setSection] = useState("company");
  const settings = useMemo(() => normalizeSettings(db.settings), [db.settings]);

  const save = (key) => (next) => {
    saveSettings({ ...settings, [key]: next }, `Settings · ${key} updated`);
  };

  return (
    <div className="space-y-4">
      <PageHead
        title="Settings"
        description="Platform defaults for this admin. Saves stay in the browser session only."
      />
      <SettingsChrome active={section} onChange={setSection}>
        {section === "company" ? <CompanySection value={settings.company} onSave={save("company")} /> : null}
        {section === "preferences" ? <PreferencesSection value={settings.preferences} onSave={save("preferences")} /> : null}
        {section === "commerce" ? <CommerceSection value={settings.commerce} onSave={save("commerce")} /> : null}
        {section === "alerts" ? <AlertsSection value={settings.alerts} onSave={save("alerts")} /> : null}
        {section === "data" ? <DataSection /> : null}
      </SettingsChrome>
    </div>
  );
}

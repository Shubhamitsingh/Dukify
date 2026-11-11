import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./login";
import { Dashboard, ModulePage, Reports, SettingsPage } from "./pages";
import { Shell } from "./shell";

const moduleIds = [
  "brands",
  "partners",
  "websites",
  "products",
  "categories",
  "pricing",
  "suppliers",
  "purchasing",
  "warehouses",
  "inventory",
  "orders",
  "fulfilment",
  "shipping",
  "private-label",
  "packaging",
  "returns",
  "customers",
  "payments",
  "finance",
  "settlements",
  "marketing",
  "academy",
  "support",
  "notifications",
  "staff",
  "roles",
  "security",
];

export default function App({ session, dark, onLogin, onLogout, onToggleDark }) {
  if (!session) {
    return <Login onSuccess={onLogin} />;
  }

  return (
    <Shell onLogout={onLogout} dark={dark} onToggleDark={onToggleDark}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<SettingsPage />} />
        {moduleIds.map((id) => (
          <Route key={id} path={`/${id}`} element={<ModulePage id={id} />} />
        ))}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Shell>
  );
}

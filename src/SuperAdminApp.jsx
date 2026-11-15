import { Navigate, Route, Routes } from "react-router-dom";
import { ApprovalsPage, ExceptionsPage, IntegrationsPage, NdrPage, QualityPage } from "./ops";
import { Dashboard, ModulePage, SettingsPage } from "./pages";
import { FinancePage } from "./finance";
import { OrdersPage } from "./orders";
import { PricingPage } from "./pricing";
import { ReportsPage } from "./reports";
import { AgentsPage, CategoriesPage, TicketDetailPage, TicketsPage } from "./support";
import { Shell } from "./shell";

const moduleIds = [
  "brands",
  "partners",
  "websites",
  "products",
  "categories",
  "suppliers",
  "purchasing",
  "warehouses",
  "inventory",
  "fulfilment",
  "shipping",
  "private-label",
  "packaging",
  "returns",
  "customers",
  "payments",
  "settlements",
  "marketing",
  "academy",
  "notifications",
  "staff",
  "roles",
  "security",
];

function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/super-admin" element={<Navigate to="/dashboard" replace />} />
      <Route path="/super-admin/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/approvals" element={<ApprovalsPage />} />
      <Route path="/exceptions" element={<ExceptionsPage />} />
      <Route path="/ndr" element={<NdrPage />} />
      <Route path="/quality" element={<QualityPage />} />
      <Route path="/integrations" element={<IntegrationsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/finance" element={<FinancePage />} />
      {/* Explicit module routes first so /brands is never swallowed by /brand/* or * */}
      <Route path="/brands" element={<ModulePage id="brands" />} />
      <Route path="/partners" element={<ModulePage id="partners" />} />
      <Route path="/websites" element={<ModulePage id="websites" />} />
      <Route path="/products" element={<ModulePage id="products" />} />
      <Route path="/support" element={<TicketsPage initialTab="all" />} />
      <Route path="/support/brand" element={<TicketsPage initialTab="brand" />} />
      <Route path="/support/customer" element={<TicketsPage initialTab="customer" />} />
      <Route path="/support/ticket/:id" element={<TicketDetailPage />} />
      <Route path="/support/agents" element={<AgentsPage />} />
      <Route path="/support/categories" element={<CategoriesPage />} />
      {moduleIds
        .filter((id) => !["brands", "partners", "websites", "products"].includes(id))
        .map((id) => (
          <Route key={id} path={`/${id}`} element={<ModulePage id={id} />} />
        ))}
      {/* Brand Partner workspace is a different app — Super Admin cannot open it here */}
      <Route path="/brand" element={<Navigate to="/dashboard" replace />} />
      <Route path="/brand/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

/** Existing Super Admin panel — unchanged UI/shell/pages. */
export function SuperAdminApp({ onLogout, dark, onToggleDark }) {
  return (
    <Shell onLogout={onLogout} dark={dark} onToggleDark={onToggleDark}>
      <SuperAdminRoutes />
    </Shell>
  );
}

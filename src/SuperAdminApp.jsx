import { Navigate, Route, Routes } from "react-router-dom";
import { ApprovalsPage, ExceptionsPage, IntegrationsPage, NdrPage, QualityPage } from "./ops";
import { Dashboard, ModulePage, SettingsPage } from "./pages";
import { FinancePage } from "./finance";
import { OrdersPage } from "./orders";
import { PricingPage } from "./pricing";
import { ReportsPage } from "./reports";
import { AgentsPage, CategoriesPage, TicketDetailPage, TicketsPage } from "./support";
import { Shell } from "./shell";
import { RequireAccess } from "./access";
import { AccessStoreBridge } from "./access/AccessStoreBridge";
import { StaffAccessPage } from "./access/pages/StaffAccessPage";
import { PermissionEditorPage } from "./access/pages/PermissionEditorPage";
import { AccessAuditPage } from "./access/pages/AccessAuditPage";

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
  "fulfillment",
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

function Gate({ children }) {
  return <RequireAccess>{children}</RequireAccess>;
}

function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/super-admin" element={<Navigate to="/dashboard" replace />} />
      <Route path="/super-admin/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Gate><Dashboard /></Gate>} />
      <Route path="/approvals" element={<Gate><ApprovalsPage /></Gate>} />
      <Route path="/exceptions" element={<Gate><ExceptionsPage /></Gate>} />
      <Route path="/ndr" element={<Gate><NdrPage /></Gate>} />
      <Route path="/quality" element={<Gate><QualityPage /></Gate>} />
      <Route path="/integrations" element={<Gate><IntegrationsPage /></Gate>} />
      <Route path="/reports" element={<Gate><ReportsPage /></Gate>} />
      <Route path="/settings" element={<Gate><SettingsPage /></Gate>} />
      <Route path="/pricing" element={<Gate><PricingPage /></Gate>} />
      <Route path="/orders" element={<Gate><OrdersPage /></Gate>} />
      <Route path="/finance" element={<Gate><FinancePage /></Gate>} />
      <Route path="/brands" element={<Gate><ModulePage id="brands" /></Gate>} />
      <Route path="/partners" element={<Gate><ModulePage id="partners" /></Gate>} />
      <Route path="/websites" element={<Gate><ModulePage id="websites" /></Gate>} />
      <Route path="/products" element={<Gate><ModulePage id="products" /></Gate>} />
      <Route path="/support" element={<Gate><TicketsPage initialTab="all" /></Gate>} />
      <Route path="/support/brand" element={<Gate><TicketsPage initialTab="brand" /></Gate>} />
      <Route path="/support/customer" element={<Gate><TicketsPage initialTab="customer" /></Gate>} />
      <Route path="/support/ticket/:id" element={<Gate><TicketDetailPage /></Gate>} />
      <Route path="/support/agents" element={<Gate><AgentsPage /></Gate>} />
      <Route path="/support/categories" element={<Gate><CategoriesPage /></Gate>} />
      <Route path="/access/staff" element={<Gate><StaffAccessPage /></Gate>} />
      <Route path="/access/permissions" element={<Gate><PermissionEditorPage /></Gate>} />
      <Route path="/access/audit" element={<Gate><AccessAuditPage /></Gate>} />
      <Route path="/staff" element={<Navigate to="/access/staff" replace />} />
      <Route path="/roles" element={<Navigate to="/access/permissions" replace />} />
      <Route path="/security" element={<Navigate to="/access/audit" replace />} />
      {moduleIds
        .filter((id) => !["brands", "partners", "websites", "products", "staff", "roles", "security"].includes(id))
        .map((id) => (
          <Route key={id} path={`/${id}`} element={<Gate><ModulePage id={id} /></Gate>} />
        ))}
      <Route path="/brand" element={<Navigate to="/dashboard" replace />} />
      <Route path="/brand/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export function SuperAdminApp({ onLogout, dark, onToggleDark }) {
  return (
    <AccessStoreBridge>
      <Shell onLogout={onLogout} dark={dark} onToggleDark={onToggleDark}>
        <SuperAdminRoutes />
      </Shell>
    </AccessStoreBridge>
  );
}

import { useEffect } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Shell from "./shell";
import Dashboard from "./pages/Dashboard";
import StorePage from "./pages/StorePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetail from "./pages/ProductDetail";
import OrdersPage from "./pages/OrdersPage";
import OrderDetail from "./pages/OrderDetail";
import CustomersPage from "./pages/CustomersPage";
import CustomerDetail from "./pages/CustomerDetail";
import MarketingPage from "./pages/MarketingPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import EarningsPage from "./pages/EarningsPage";
import AcademyPage from "./pages/AcademyPage";
import SupportPage from "./pages/SupportPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import { menu } from "./nav";
import { usePartner } from "./store";

function Section({ Page }) {
  const { section } = useParams();
  const allowed = menu.find((item) => Page.moduleId === item.id)?.items.some((item) => item[0] === section);
  if (!allowed) {
    return <Navigate to={`/brand/${Page.moduleId}/${menu.find((item) => item.id === Page.moduleId).items[0][0]}`} replace />;
  }
  return <Page section={section} />;
}

/**
 * Existing Brand Partner dashboard — separate shell/nav from Super Admin.
 * Auth is handled by the unified root app; this only renders brand routes.
 */
export function BrandApp({ session, onLogout, dark, onToggleDark }) {
  const { switchBrand } = usePartner();

  useEffect(() => {
    if (session?.brandId) switchBrand(session.brandId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bind once per brandId from auth
  }, [session?.brandId]);

  return (
    <Shell dark={dark} onToggleDark={onToggleDark} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/brand/dashboard/overview" replace />} />
        <Route path="/brand" element={<Navigate to="/brand/dashboard/overview" replace />} />
        <Route path="/brand/dashboard" element={<Navigate to="/brand/dashboard/overview" replace />} />
        <Route path="/brand/dashboard/:section" element={<Section Page={Dashboard} />} />
        <Route path="/brand/store/:section" element={<Section Page={StorePage} />} />
        <Route path="/brand/products/item/:id" element={<ProductDetail />} />
        <Route path="/brand/products/:section" element={<Section Page={ProductsPage} />} />
        <Route path="/brand/orders/item/:id" element={<OrderDetail />} />
        <Route path="/brand/orders/:section" element={<Section Page={OrdersPage} />} />
        <Route path="/brand/customers/item/:id" element={<CustomerDetail />} />
        <Route path="/brand/customers/:section" element={<Section Page={CustomersPage} />} />
        <Route path="/brand/marketing/:section" element={<Section Page={MarketingPage} />} />
        <Route path="/brand/analytics/:section" element={<Section Page={AnalyticsPage} />} />
        <Route path="/brand/earnings/:section" element={<Section Page={EarningsPage} />} />
        <Route path="/brand/academy/:section" element={<Section Page={AcademyPage} />} />
        <Route path="/brand/support/:section" element={<Section Page={SupportPage} />} />
        <Route path="/brand/notifications/:section" element={<Section Page={NotificationsPage} />} />
        <Route path="/brand/settings/:section" element={<Section Page={SettingsPage} />} />
        <Route path="*" element={<Navigate to="/brand/dashboard/overview" replace />} />
      </Routes>
    </Shell>
  );
}

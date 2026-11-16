import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { LandingPage } from "./LandingPage";
import { BrandApp, BrandStoreProvider } from "./brand";
import { SuperAdminApp } from "./SuperAdminApp";
import { AccessProvider } from "./access";
import { homeForRole, isBrandRole, isBrandWorkspacePath, isPlatformRole } from "./auth";

export default function App({ session, dark, onLogin, onLogout, onToggleDark }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = (next) => {
    onLogin(next);
    navigate(homeForRole(next.role), { replace: true });
  };

  // Guests always land on the simple home page; /login opens the same page with popup.
  if (!session) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage onLogin={handleLogin} />} />
        <Route path="/login" element={<LandingPage onLogin={handleLogin} startWithLogin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (location.pathname === "/" || location.pathname === "" || location.pathname === "/login") {
    return <Navigate to={homeForRole(session.role)} replace />;
  }

  const handleLogout = () => {
    onLogout();
    navigate("/", { replace: true });
  };

  return (
    <AccessProvider principal={session}>
      {isBrandRole(session.role) ? (
        !isBrandWorkspacePath(location.pathname) ? (
          <Navigate to={homeForRole(session.role)} replace />
        ) : (
          <BrandStoreProvider>
            <BrandApp session={session} onLogout={handleLogout} dark={dark} onToggleDark={onToggleDark} />
          </BrandStoreProvider>
        )
      ) : isPlatformRole(session.role) ? (
        isBrandWorkspacePath(location.pathname) ? (
          <Navigate to={homeForRole(session.role)} replace />
        ) : (
          <SuperAdminApp onLogout={handleLogout} dark={dark} onToggleDark={onToggleDark} />
        )
      ) : (
        <Navigate to="/" replace />
      )}
    </AccessProvider>
  );
}

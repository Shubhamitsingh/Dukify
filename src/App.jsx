import { Navigate, useLocation } from "react-router-dom";
import { Login } from "./login";
import { LandingPage } from "./LandingPage";
import { BrandApp, BrandStoreProvider } from "./brand";
import { SuperAdminApp } from "./SuperAdminApp";
import { AccessProvider } from "./access";
import { homeForRole, isBrandRole, isBrandWorkspacePath, isPlatformRole } from "./auth";

export default function App({ session, dark, onLogin, onLogout, onToggleDark }) {
  const location = useLocation();

  if (!session) {
    if (location.pathname === "/login") {
      return <Login onSuccess={onLogin} />;
    }
    if (location.pathname === "/" || location.pathname === "") {
      return <LandingPage />;
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <AccessProvider principal={session}>
      {isBrandRole(session.role) ? (
        !isBrandWorkspacePath(location.pathname) && location.pathname !== "/" ? (
          <Navigate to={homeForRole(session.role)} replace />
        ) : (
          <BrandStoreProvider>
            <BrandApp session={session} onLogout={onLogout} dark={dark} onToggleDark={onToggleDark} />
          </BrandStoreProvider>
        )
      ) : isPlatformRole(session.role) ? (
        isBrandWorkspacePath(location.pathname) ? (
          <Navigate to={homeForRole(session.role)} replace />
        ) : (
          <SuperAdminApp onLogout={onLogout} dark={dark} onToggleDark={onToggleDark} />
        )
      ) : (
        <Navigate to="/login" replace />
      )}
    </AccessProvider>
  );
}

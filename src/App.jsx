import { Navigate, useLocation } from "react-router-dom";
import { Login } from "./login";
import { BrandApp, BrandStoreProvider } from "./brand";
import { SuperAdminApp } from "./SuperAdminApp";
import { homeForRole, isBrandRole, isBrandWorkspacePath, isSuperAdminRole } from "./auth";

export default function App({ session, dark, onLogin, onLogout, onToggleDark }) {
  const location = useLocation();

  if (!session) {
    return <Login onSuccess={onLogin} />;
  }

  if (isBrandRole(session.role)) {
    if (!isBrandWorkspacePath(location.pathname) && location.pathname !== "/") {
      return <Navigate to={homeForRole(session.role)} replace />;
    }
    return (
      <BrandStoreProvider>
        <BrandApp session={session} onLogout={onLogout} dark={dark} onToggleDark={onToggleDark} />
      </BrandStoreProvider>
    );
  }

  if (isSuperAdminRole(session.role)) {
    if (isBrandWorkspacePath(location.pathname)) {
      return <Navigate to={homeForRole(session.role)} replace />;
    }
    return <SuperAdminApp onLogout={onLogout} dark={dark} onToggleDark={onToggleDark} />;
  }

  return <Navigate to="/login" replace />;
}

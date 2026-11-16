import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Login } from "./login";
import { LandingPage } from "./LandingPage";
import { BrandApp, BrandStoreProvider } from "./brand";
import { SuperAdminApp } from "./SuperAdminApp";
import { AccessProvider } from "./access";
import { homeForRole, isBrandRole, isBrandWorkspacePath, isPlatformRole } from "./auth";

export default function App({ session, dark, onLogin, onLogout, onToggleDark }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Guests: landing first. Login only at /login. Everything else → landing.
  if (!session) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <Login
              onSuccess={(next) => {
                onLogin(next);
                navigate(homeForRole(next.role), { replace: true });
              }}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Signed-in users on marketing home stay on landing; CTA goes to workspace.
  if (location.pathname === "/" || location.pathname === "") {
    return <LandingPage />;
  }

  // Already signed in — skip login screen
  if (location.pathname === "/login") {
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

import { Navigate, useLocation } from "react-router-dom";
import { ShieldOff, Building2 } from "lucide-react";
import { useAccess } from "./AccessContext";
import { ROLES } from "./roles";
import { SCOPE_TYPES } from "./scopes";

export function AccessDenied({ reason = "You do not have permission to open this page." }) {
  const { roleLabel, principal } = useAccess();
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-xl bg-rose-50 text-rose-600">
        <ShieldOff className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-xl font-semibold text-gray-900">Access denied</h1>
      <p className="mt-2 text-sm text-gray-500">{reason}</p>
      <p className="mt-4 text-xs text-gray-400">
        Signed in as {principal?.email} · {roleLabel}
      </p>
      <a href="/dashboard" className="btn-secondary mt-6 inline-flex">
        Back to home
      </a>
    </div>
  );
}

export function NoAssignedBrands() {
  const { principal, roleLabel } = useAccess();
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-xl bg-amber-50 text-amber-700">
        <Building2 className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-xl font-semibold text-gray-900">No brands assigned</h1>
      <p className="mt-2 text-sm text-gray-500">
        Your account has no brand scope yet. Ask a Platform Owner to assign brands or permission sets
        before you can work with orders or catalogue data.
      </p>
      <p className="mt-4 text-xs text-gray-400">
        {principal?.email} · {roleLabel}
      </p>
    </div>
  );
}

const DATA_PATHS = ["/orders", "/brands", "/products", "/inventory", "/finance", "/reports", "/dashboard", "/customers", "/settlements"];

/** Route wrapper — checks path permission; for internal_staff also handles empty scope. */
export function RequireAccess({ children, permission, anyOf }) {
  const { can, canPath, principal, scope, canSeeAllBrandTotals } = useAccess();
  const location = useLocation();

  if (!principal) return <Navigate to="/login" replace />;

  const allowed = permission
    ? can(permission)
    : anyOf
      ? anyOf.some((p) => can(p))
      : canPath(location.pathname);

  if (!allowed) return <AccessDenied />;

  if (
    principal.role === ROLES.INTERNAL_STAFF &&
    scope.type === SCOPE_TYPES.SELECTED_BRANDS &&
    (!scope.brandIds || scope.brandIds.length === 0) &&
    !canSeeAllBrandTotals
  ) {
    if (DATA_PATHS.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`))) {
      return <NoAssignedBrands />;
    }
  }

  return children;
}

export function RequirePermission({ permission, children, fallback = null }) {
  const { can } = useAccess();
  if (!can(permission)) return fallback;
  return children;
}

import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  if (loading || !initialized) {
    return <div className="auth-shell">Carregando sua sessao...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

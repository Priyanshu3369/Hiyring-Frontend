// components/ProtectedRoute.jsx
// Wrapper component that checks authentication before rendering a page.
// Usage: wrap any <Route> element with <ProtectedRoute> in App.jsx.
//
// How it works:
//   1. Reads isAuthenticated from AuthContext
//   2. If not authenticated → redirects to /login (preserving intended destination)
//   3. If authenticated → renders the child component normally

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, but remember where the user was trying to go.
    // After login, you could redirect back to location.state.from.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the matched child route
  return <Outlet />;
}

export default ProtectedRoute;
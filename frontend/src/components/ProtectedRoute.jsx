import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const token =
    localStorage.getItem("token");

  const role =
    localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (
    allowedRoles &&
    !allowedRoles.some((allowedRole) => allowedRole.toLowerCase() === role?.toLowerCase())
  ) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
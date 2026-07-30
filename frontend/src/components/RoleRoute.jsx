import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress, Box } from "@mui/material";

export default function RoleRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (!user) return <Navigate to="/login/landlord" replace />;
  if (user.role !== role) {
    const redirect = user.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";
    return <Navigate to={redirect} replace />;
  }
  return children;
}

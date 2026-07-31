"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress, Box } from "@mui/material";

export default function RoleRoute({ role, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login/landlord");
      return;
    }
    if (user.role !== role) {
      router.replace(user.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard");
    }
  }, [loading, user, role, router]);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (!user || user.role !== role) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  return children;
}

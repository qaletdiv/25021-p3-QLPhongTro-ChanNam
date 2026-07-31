"use client";

import { ThemeProvider } from "@mui/material";
import { AuthProvider } from "@/src/contexts/AuthContext";
import theme from "@/src/theme";

export default function Providers({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "@/src/contexts/AuthContext";
import theme from "@/src/theme";

export default function Providers({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider } from "./contexts/AuthContext";
import RoleRoute from "./components/RoleRoute";
import MainLayout from "./layouts/MainLayout";
import TenantLayout from "./layouts/TenantLayout";
import LoginRegister from "./pages/LoginRegister";
import Dashboard from "./pages/Dashboard";
import RoomManagement from "./pages/RoomManagement";
import FurnitureManagement from "./pages/FurnitureManagement";
import TenantManagement from "./pages/TenantManagement";
import InvoiceManagement from "./pages/InvoiceManagement";
import NotificationManagement from "./pages/NotificationManagement";
import Settings from "./pages/Settings";
import ContractTemplate from "./pages/ContractTemplate";
import TenantDashboard from "./pages/TenantDashboard";
import TenantInvoices from "./pages/TenantInvoices";
import TenantIssues from "./pages/TenantIssues";
import TenantProfile from "./pages/TenantProfile";

const theme = createTheme({
  palette: {
    primary: { main: "#2563eb", light: "#3b82f6", dark: "#1d4ed8" },
    secondary: { main: "#059669", light: "#34d399", dark: "#047857" },
    success: { main: "#059669", light: "#d1fae5", dark: "#047857" },
    warning: { main: "#d97706", light: "#fef3c7", dark: "#b45309" },
    error: { main: "#e11d48", light: "#ffe4e6", dark: "#be123c" },
    info: { main: "#2563eb" },
    background: { default: "#f1f5f9", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#64748b" },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: '"Arial", sans-serif',
    h4: { fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.025em" },
    h5: { fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.025em" },
    h6: { fontWeight: 700, fontSize: "1rem" },
    subtitle1: { fontWeight: 700, fontSize: "0.875rem" },
    subtitle2: { fontWeight: 600, fontSize: "0.75rem", color: "#64748b" },
    body1: { fontSize: "0.875rem" },
    body2: { fontSize: "0.75rem" },
    button: { fontWeight: 700, fontSize: "0.75rem", textTransform: "none" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: "#f1f5f9" } },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        },
        rounded: { borderRadius: 16 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "8px 16px",
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "none",
        },
        contained: {
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          "&:hover": { boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" },
        },
        containedPrimary: {
          "&:hover": { backgroundColor: "#1d4ed8" },
        },
        containedSuccess: {
          backgroundColor: "#059669",
          "&:hover": { backgroundColor: "#047857" },
        },
        containedError: {
          backgroundColor: "#e11d48",
          "&:hover": { backgroundColor: "#be123c" },
        },
        outlined: {
          borderColor: "#e2e8f0",
          color: "#475569",
          "&:hover": { borderColor: "#cbd5e1", backgroundColor: "#f8fafc" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
          border: "none",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#0f172a",
          color: "#ffffff",
          padding: "16px 24px",
          fontSize: "1rem",
          fontWeight: 700,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "24px",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "16px 24px",
          borderTop: "1px solid #e2e8f0",
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: "separate",
          borderSpacing: 0,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-head": {
            "& .MuiTableCell-head": {
              backgroundColor: "#f8fafc",
              color: "#475569",
              fontWeight: 700,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: "1px solid #e2e8f0",
            },
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#f8fafc" },
          "&:last-child .MuiTableCell-body": { borderBottom: "none" },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "12px 16px",
          fontSize: "0.8125rem",
          borderBottom: "1px solid #e2e8f0",
        },
        body: { color: "#0f172a" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            fontSize: "0.8125rem",
            backgroundColor: "#ffffff",
            "& fieldset": { borderColor: "#cbd5e1" },
            "&:hover fieldset": { borderColor: "#94a3b8" },
            "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: 2 },
            "& input": { padding: "10px 12px" },
          },
          "& .MuiInputLabel-root": { fontSize: "0.8125rem", color: "#64748b" },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontSize: "0.8125rem",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 700,
          fontSize: "0.6875rem",
          height: "auto",
          padding: "2px 4px",
        },
        filled: { "& .MuiChip-label": { paddingLeft: 8, paddingRight: 8 } },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          "& .MuiAlert-root": {
            borderRadius: 16,
            fontWeight: 600,
            fontSize: "0.8125rem",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
        },
        standardError: {
          backgroundColor: "#ffe4e6",
          color: "#9f1239",
        },
        standardWarning: {
          backgroundColor: "#fef3c7",
          color: "#92400e",
        },
        standardInfo: {
          backgroundColor: "#dbeafe",
          color: "#1e40af",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: "#f1f5f9",
          borderRadius: 12,
          padding: 4,
          minHeight: "auto",
        },
        indicator: { display: "none" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "6px 12px",
          minHeight: "auto",
          fontWeight: 600,
          fontSize: "0.75rem",
          textTransform: "none",
          color: "#64748b",
          "&.Mui-selected": {
            backgroundColor: "#ffffff",
            color: "#0f172a",
            boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&:hover": { backgroundColor: "#f1f5f9" },
        },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Navigate to="/login/tenant" replace />} />
            <Route path="/login/:role" element={<LoginRegister />} />

            <Route element={<RoleRoute role="landlord"><MainLayout /></RoleRoute>}>
              <Route path="/landlord/dashboard" element={<Dashboard />} />
              <Route path="/landlord/rooms" element={<RoomManagement />} />
              <Route path="/landlord/furnitures" element={<FurnitureManagement />} />
              <Route path="/landlord/tenants" element={<TenantManagement />} />
              <Route path="/landlord/invoices" element={<InvoiceManagement />} />
              <Route path="/landlord/notifications" element={<NotificationManagement />} />
              <Route path="/landlord/settings" element={<Settings />} />
              <Route path="/landlord/contract-template" element={<ContractTemplate />} />
            </Route>

            <Route element={<RoleRoute role="tenant"><TenantLayout /></RoleRoute>}>
              <Route path="/tenant/dashboard" element={<TenantDashboard />} />
              <Route path="/tenant/invoices" element={<TenantInvoices />} />
              <Route path="/tenant/issues" element={<TenantIssues />} />
              <Route path="/tenant/profile" element={<TenantProfile />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

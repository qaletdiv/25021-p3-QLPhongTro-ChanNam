"use client";

import { Box, IconButton, Paper } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const HEADERS = ["STT", "Tên Vật Dụng / Thiết Bị", "Ghi Chú / Tình Trạng", "Số Lượng Mặc Định", ""];

export default function FurnitureTable({ items, onEdit, onDelete }) {
  return (
    <Paper sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {HEADERS.map((h) => (
                <th key={h} style={{ padding: "12px 16px", fontWeight: 700, color: "#475569", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "" ? "right" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "#94a3b8" }}>{idx + 1}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>
                  {item.name}
                </td>
                <td style={{ padding: "12px 16px", color: "#475569" }}>{item.note || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "4px 10px", backgroundColor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "0.75rem" }}>
                    {item.default_quantity}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                  <IconButton size="small" onClick={() => onEdit(item)} sx={{ color: "#64748b", "&:hover": { color: "#d97706", bgcolor: "#fffbeb" } }}>
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(item.id)} sx={{ color: "#64748b", "&:hover": { color: "#e11d48", bgcolor: "#ffe4e6" } }}>
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
}

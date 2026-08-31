"use client";

import { useState } from "react";
import {
  Box, Typography, Button, Paper, CircularProgress, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Tooltip, Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CodeIcon from "@mui/icons-material/Code";
import LinkIcon from "@mui/icons-material/Link";
import GridOnIcon from "@mui/icons-material/GridOn";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import AddRowBelowIcon from "@mui/icons-material/PlaylistAdd";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import TitleIcon from "@mui/icons-material/Title";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import contractTemplateApi from "../api/contractTemplateApi";

const variables = [
  "{{ten_nguoi_thue}}", "{{cccd}}", "{{so_dien_thoai}}", "{{ma_phong}}",
  "{{gia_thue}}", "{{tien_coc}}", "{{ngay_bat_dau}}", "{{ngay_ket_thuc}}",
  "{{ngay_thu_tien}}", "{{ma_van_tay}}", "{{nguoi_di_kem}}", "{{vat_dung}}",
  "{{ngay_hom_nay}}", "{{ten_chu_tro}}", "{{sdt_chu_tro}}",
];

const Toolbar = ({ title, active, disabled, onClick, children }) => (
  <Tooltip title={title} arrow placement="top">
    <span>
      <IconButton
        size="small"
        disabled={disabled}
        onClick={onClick}
        sx={{
          color: active ? "#2563eb" : "#475569",
          bgcolor: active ? "#dbeafe" : "transparent",
          borderRadius: "8px",
          "&:hover": { bgcolor: active ? "#dbeafe" : "#eef2f7" },
        }}
      >
        {children}
      </IconButton>
    </span>
  </Tooltip>
);

export default function ContractTemplate({ initialTemplate = "" }) {
  const [template, setTemplate] = useState(initialTemplate);

  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [banks, setBanks] = useState([]);
  const [settings, setSettings] = useState({});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false } }),
      TextAlign.configure({ types: ["heading", "paragraph", "tableCell"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: template || "",
    onUpdate: ({ editor }) => setTemplate(editor.getHTML()),
  });

  // Mẫu hợp đồng được fetch server-side qua props initialTemplate

  const setLink = () => {
    const previous = editor.getAttributes("link");
    const url = previous.href || "";
    const value = window.prompt("Nhập địa chỉ liên kết:", url);
    if (value === null) return;
    if (value === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const toSave = (editor ? editor.getHTML() : template).replace(/ {2,}/g, (m) => Array.from({ length: m.length }, () => "&nbsp;").join(""));
      await contractTemplateApi.saveTemplate({ template: toSave });
      setSnack({ open: true, message: "Đã lưu hợp đồng thành công", severity: "success" });
    } catch {
      setSnack({ open: true, message: "Lỗi lưu mẫu", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (v) => {
    if (!editor) return;
    editor.chain().focus().insertContent(v).run();
  };

  if (!editor || loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Mẫu hợp đồng</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>Quản lý nội dung mẫu hợp đồng thuê phòng</Typography>
      </Box>

      <Paper sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 2, mb: 3, borderBottom: "1px solid #e2e8f0" }}>
          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>
            Biến mẫu hợp đồng
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          {variables.map((v) => (
            <Chip
              key={v}
              label={v}
              size="small"
              clickable
              onClick={() => insertVariable(v)}
              variant="outlined"
              sx={{ borderRadius: "12px", borderColor: "#e2e8f0", "&:hover": { borderColor: "#2563eb", color: "#2563eb" } }}
            />
          ))}
        </Box>

        <Box sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}>
          <Box
            sx={{
              width: "210mm",
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              alignItems: "center",
              bgcolor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderBottom: "none",
              borderRadius: "12px 12px 0 0",
              p: 1,
            }}
          >
            <Toolbar title="Chữ đậm" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><FormatBoldIcon fontSize="small" /></Toolbar>
            <Toolbar title="Chữ nghiêng" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><FormatItalicIcon /></Toolbar>
            <Toolbar title="Gạch chân" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><FormatUnderlinedIcon /></Toolbar>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Toolbar title="Tiêu đề lớn" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><TitleIcon /></Toolbar>
            <Toolbar title="Tiêu đề vừa" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1 }}>H2</Typography></Toolbar>
            <Toolbar title="Tiêu đề nhỏ" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>H3</Typography></Toolbar>
            <Toolbar title="Đoạn văn" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}><Typography sx={{ fontSize: 14, lineHeight: 1 }}>P</Typography></Toolbar>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Toolbar title="Danh sách gạch đầu dòng" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><FormatListBulletedIcon /></Toolbar>
            <Toolbar title="Danh sách đánh số" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><FormatListNumberedIcon /></Toolbar>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Toolbar title="Trích dẫn" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><FormatQuoteIcon /></Toolbar>
            <Toolbar title="Khối mã" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><CodeIcon /></Toolbar>
            <Toolbar title="Căn trái" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><FormatAlignLeftIcon /></Toolbar>
            <Toolbar title="Căn giữa" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><FormatAlignCenterIcon /></Toolbar>
            <Toolbar title="Căn phải" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><FormatAlignRightIcon /></Toolbar>
            <Toolbar title="Căn đều" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}><FormatAlignJustifyIcon /></Toolbar>
            <Toolbar title="Liên kết" active={editor.isActive("link")} onClick={setLink}><LinkIcon /></Toolbar>
            <Toolbar title="Gỡ liên kết" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}><LinkOffIcon /></Toolbar>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Toolbar title="Chèn bảng" onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}><GridOnIcon /></Toolbar>
            <Toolbar title="Thêm dòng phía dưới" disabled={!editor.can().addRowAfter()} onClick={() => editor.chain().focus().addRowAfter().run()}><AddRowBelowIcon /></Toolbar>
            <Toolbar title="Thêm cột phía phải" disabled={!editor.can().addColumnAfter()} onClick={() => editor.chain().focus().addColumnAfter().run()}><FormatListNumberedIcon style={{ transform: "rotate(90deg)" }} /></Toolbar>
            <Toolbar title="Xóa bảng" disabled={!editor.can().deleteTable()} onClick={() => editor.chain().focus().deleteTable().run()}><DeleteOutlinedIcon /></Toolbar>
          </Box>

          <Box
            sx={{
              width: "210mm",
              minHeight: "calc(100vh - 480px)",
              maxHeight: "calc(100vh - 480px)",
              overflowY: "auto",
              bgcolor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "0 0 12px 12px",
              p: "15mm 20mm 10mm 20mm",
              fontSize: "0.875rem",
              fontFamily: "Arial, sans-serif",
              "& .ProseMirror": { outline: "none", minHeight: "calc(100vh - 520px)" },
              "& .ProseMirror p": { margin: "0 0 0.75em", lineHeight: 1.6 },
              "& .ProseMirror h1, & .ProseMirror h2, & .ProseMirror h3": { lineHeight: 1.4, margin: "0.5em 0" },
              "& .ProseMirror table": { borderCollapse: "collapse", width: "100%", tableLayout: "fixed", margin: "0.75em 0" },
              "& .ProseMirror th, & .ProseMirror td": { border: "1px solid #cbd5e1", padding: "6px 8px", verticalAlign: "top", textAlign: "left" },
              "& .ProseMirror th": { bgcolor: "#f1f5f9", fontWeight: 700 },
              "& .ProseMirror .selectedCell": { bgcolor: "#dbeafe", outline: "1px solid #93c5fd" },
            }}
          >
            <EditorContent editor={editor} />
          </Box>
        </Box>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ borderRadius: "12px", bgcolor: "#2563eb", textTransform: "none", fontWeight: 600 }}
          >
            Lưu mẫu hợp đồng
          </Button>
        </Box>
      </Paper>

      <Dialog open={snack.open} onClose={() => setSnack({ ...snack, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", pb: 0, bgcolor: "#ffffff", color: "#0f172a" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 1 }}>
            {snack.severity === "success"
              ? <CheckCircleIcon sx={{ fontSize: 52, color: "#059669" }} />
              : <ErrorOutlinedIcon sx={{ fontSize: 52, color: "#e11d48" }} />}
            <Typography sx={{ fontSize: "1.125rem", fontWeight: 700 }}>{snack.severity === "success" ? "Thành công" : "Lỗi"}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pt: "24px !important", bgcolor: "#ffffff" }}>
          <Typography sx={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.6 }}>{snack.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", bgcolor: "#ffffff" }}>
          <Button
            variant="contained"
            color={snack.severity === "success" ? "success" : "error"}
            onClick={() => setSnack({ ...snack, open: false })}
            sx={{ minWidth: 120, borderRadius: "10px", fontWeight: 700 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

"use client";

import { Component } from "react";
import { Box, Typography, Button } from "@mui/material";

export class LoginErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const { role = "tenant" } = this.props;
      return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 2, p: 2 }}>
          <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#ef4444" }}>Đăng nhập thất bại</Typography>
          <Typography sx={{ color: "#64748b", textAlign: "center", maxWidth: 400 }}>
            Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại hoặc liên hệ hỗ trợ.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()} sx={{ borderRadius: 2 }}>
            Tải lại trang
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

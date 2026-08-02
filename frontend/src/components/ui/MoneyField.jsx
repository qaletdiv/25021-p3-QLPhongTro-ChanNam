"use client";

import { TextField } from "@mui/material";

export default function MoneyField({ value, onChange, label, sx, size, fullWidth, required, disabled, placeholder }) {
  const display = value === "" || value == null ? "" : Number(value).toLocaleString("vi-VN");
  return (
    <TextField
      type="text"
      inputMode="numeric"
      label={label}
      size={size}
      fullWidth={fullWidth}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      value={display}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
        onChange(digits);
      }}
      sx={sx}
    />
  );
}

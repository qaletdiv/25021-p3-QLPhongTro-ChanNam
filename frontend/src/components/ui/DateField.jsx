"use client";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export default function DateField({ value, onChange, label, sx, size, fullWidth, required, disabled }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={(d) => onChange(d ? d.format("YYYY-MM-DD") : "")}
        format="DD/MM/YYYY"
        slotProps={{
          textField: { size, fullWidth, required, disabled, sx, placeholder: "dd/mm/yyyy" },
        }}
      />
    </LocalizationProvider>
  );
}

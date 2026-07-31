"use client";

import RoleRoute from "@/src/components/RoleRoute";
import TenantLayout from "@/src/layouts/TenantLayout";

export default function TenantLayoutWrapper({ children }) {
  return (
    <RoleRoute role="tenant">
      <TenantLayout>{children}</TenantLayout>
    </RoleRoute>
  );
}

"use client";

import RoleRoute from "@/src/components/RoleRoute";
import MainLayout from "@/src/layouts/MainLayout";

export default function LandlordLayout({ children }) {
  return (
    <RoleRoute role="landlord">
      <MainLayout>{children}</MainLayout>
    </RoleRoute>
  );
}

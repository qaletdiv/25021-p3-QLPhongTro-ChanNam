"use client";

import { useState, useCallback } from "react";
import { Box, CircularProgress } from "@mui/material";
import MessageDialog from "../components/MessageDialog";
import TenantTable from "../components/tenant/TenantTable";
import ContractModal from "../components/tenant/ContractModal";
import TenantEditModal from "../components/tenant/TenantEditModal";
import CheckoutConfirmModal from "../components/tenant/CheckoutConfirmModal";
import TenantManagementHeader from "../components/tenant/TenantManagementHeader";
import TenantManagementFilter from "../components/tenant/TenantManagementFilter";
import contractTemplateApi from "../api/contractTemplateApi";
import useTenantList from "../hooks/useTenantList";
import useContractEditor from "../hooks/useContractEditor";

export default function TenantManagement() {
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const notify = useCallback((message, severity = "success") => setSnack({ open: true, message, severity }), []);

  const list = useTenantList({ notify });
  const editor = useContractEditor({ notify, fetchTenants: list.fetchTenants });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <TenantManagementHeader onCreateContract={editor.openCreateContract} />

      {/* Filter Panel */}
      <TenantManagementFilter
        statusFilter={list.statusFilter} search={list.search} dateFrom={list.dateFrom} dateTo={list.dateTo}
        onChange={(key, value) => {
          if (key === "statusFilter") list.setStatusFilter(value);
          else if (key === "search") list.setSearch(value);
          else if (key === "dateFrom") list.setDateFrom(value);
          else if (key === "dateTo") list.setDateTo(value);
          else if (key === "clearDates") list.clearDates();
        }}
      />

      {list.loading ? <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box> : (
        <TenantTable
          tenants={list.filteredTenants}
          onEdit={editor.openEdit}
          onCheckout={editor.openCheckoutConfirm}
          onPrint={(id) => window.open(contractTemplateApi.getPdfUrl(id), "_blank")}
        />
      )}

      <ContractModal
        open={editor.openContract}
        editContractId={editor.editContractId}
        tenants={list.tenants}
        emptyRooms={editor.emptyRooms}
        contractForm={editor.contractForm} setContractForm={editor.setContractForm}
        companionFingerprints={editor.companionFingerprints} setCompanionFingerprints={editor.setCompanionFingerprints}
        furnitureList={editor.furnitureList} selectedFurnitures={editor.selectedFurnitures} setSelectedFurnitures={editor.setSelectedFurnitures}
        paymentDayManuallyChanged={editor.paymentDayManuallyChanged}
        contractLoading={editor.contractLoading}
        onClose={() => editor.setOpenContract(false)}
        onSave={editor.handleSaveContract}
      />

      <TenantEditModal
        editTenantId={editor.editTenantId} editContractId={editor.editContractId}
        tenants={list.tenants}
        tenantForm={editor.tenantForm} setTenantForm={editor.setTenantForm}
        emptyRooms={editor.emptyRooms} contractForm={editor.contractForm} setContractForm={editor.setContractForm}
        companionFingerprints={editor.companionFingerprints} setCompanionFingerprints={editor.setCompanionFingerprints}
        furnitureList={editor.furnitureList} selectedFurnitures={editor.selectedFurnitures} setSelectedFurnitures={editor.setSelectedFurnitures}
        paymentDayManuallyChanged={editor.paymentDayManuallyChanged}
        contractLoading={editor.contractLoading}
        openContract={editor.openContract}
        onClose={() => editor.setEditTenantId(null)}
        onSave={editor.handleSaveAll}
      />

      <CheckoutConfirmModal
        checkoutConfirm={editor.checkoutConfirm}
        onClose={() => editor.setCheckoutConfirm(null)}
        onConfirm={editor.handleCheckoutConfirm}
      />

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}

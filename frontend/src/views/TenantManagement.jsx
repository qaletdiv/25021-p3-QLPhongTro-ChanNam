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
import useContractFormState from "../hooks/useContractFormState";
import useTenantEditor from "../hooks/useTenantEditor";
import useContractEditor from "../hooks/useContractEditor";
import useCheckout from "../hooks/useCheckout";

export default function TenantManagement() {
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const notify = useCallback((message, severity = "success") => setSnack({ open: true, message, severity }), []);

  const list = useTenantList({ notify });
  const formState = useContractFormState();
  const tenantEditor = useTenantEditor({ notify, fetchTenants: list.fetchTenants, formState });
  const contractEditor = useContractEditor({ notify, fetchTenants: list.fetchTenants, formState });
  const checkout = useCheckout({ notify, fetchTenants: list.fetchTenants });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <TenantManagementHeader onCreateContract={contractEditor.openCreateContract} />

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
          onEdit={tenantEditor.openEdit}
          onCheckout={checkout.openCheckoutConfirm}
          onPrint={(id) => window.open(contractTemplateApi.getPdfUrl(id), "_blank")}
        />
      )}

      <ContractModal
        open={formState.openContract}
        editContractId={formState.editContractId}
        tenants={list.tenants}
        emptyRooms={formState.emptyRooms}
        contractForm={formState.contractForm} setContractForm={formState.setContractForm}
        companionFingerprints={formState.companionFingerprints} setCompanionFingerprints={formState.setCompanionFingerprints}
        furnitureList={formState.furnitureList} selectedFurnitures={formState.selectedFurnitures} setSelectedFurnitures={formState.setSelectedFurnitures}
        paymentDayManuallyChanged={formState.paymentDayManuallyChanged}
        contractLoading={formState.contractLoading}
        onClose={() => formState.setOpenContract(false)}
        onSave={contractEditor.handleSaveContract}
      />

      <TenantEditModal
        editTenantId={tenantEditor.editTenantId} editContractId={formState.editContractId}
        tenantForm={tenantEditor.tenantForm} setTenantForm={tenantEditor.setTenantForm}
        emptyRooms={formState.emptyRooms} contractForm={formState.contractForm} setContractForm={formState.setContractForm}
        companionFingerprints={formState.companionFingerprints} setCompanionFingerprints={formState.setCompanionFingerprints}
        furnitureList={formState.furnitureList} selectedFurnitures={formState.selectedFurnitures} setSelectedFurnitures={formState.setSelectedFurnitures}
        paymentDayManuallyChanged={formState.paymentDayManuallyChanged}
        contractLoading={formState.contractLoading}
        openContract={formState.openContract}
        onClose={() => tenantEditor.setEditTenantId(null)}
        onSave={tenantEditor.handleSaveAll}
      />

      <CheckoutConfirmModal
        checkoutConfirm={checkout.checkoutConfirm}
        onClose={() => checkout.setCheckoutConfirm(null)}
        onConfirm={checkout.handleCheckoutConfirm}
      />

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}

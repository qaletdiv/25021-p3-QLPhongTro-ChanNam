export const defaultContractForm = {
  tenantId: "", tenantName: "", tenantPhone: "", tenantEmail: "",
  roomId: "", deposit: "", price: "", startDate: "", endDate: "",
  paymentDay: 5, fingerprintCode: "", furnitures: [],
};

export function buildExistingFurns(furnitures, contract) {
  const existing = {};
  furnitures.forEach((f) => {
    const ef = contract.contractFurnitures?.find(cf => cf.furnitureId === f.id);
    existing[f.id] = { checked: !!ef, quantity: ef ? ef.quantity : f.default_quantity };
  });
  return existing;
}

export function buildDefaultFurns(furnitures) {
  const defaults = {};
  furnitures.forEach((f) => { defaults[f.id] = { checked: false, quantity: f.default_quantity }; });
  return defaults;
}

export function buildCompanions(companions) {
  return (companions || [])
    .filter((c) => c.status !== "ended")
    .map(c => ({ id: c.id, name: c.name, phone: c.phone || "", cccd: c.cccd || "", relationship: c.relationship || "", fingerprintCode: c.fingerprintCode || "" }));
}

export function buildContractForm(contract, tenantId) {
  return {
    tenantId, roomId: contract.roomId,
    deposit: contract.deposit,
    price: contract.price,
    startDate: contract.startDate?.split("T")[0] || contract.startDate,
    endDate: contract.endDate?.split("T")[0] || contract.endDate,
    paymentDay: contract.paymentDay,
    fingerprintCode: contract.fingerprintCode || "", furnitures: [],
  };
}

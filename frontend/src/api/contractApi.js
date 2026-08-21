import { createContract, getContractById, updateContract, checkoutContract } from "../actions/contractActions";

const contractApi = {
  create: createContract,
  getById: getContractById,
  update: updateContract,
  checkout: checkoutContract,
};

export default contractApi;

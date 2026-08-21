import { getTenants, createTenant, updateTenant } from "../actions/tenantActions";

const tenantApi = {
  getAll: getTenants,
  create: createTenant,
  update: updateTenant,
};

export default tenantApi;

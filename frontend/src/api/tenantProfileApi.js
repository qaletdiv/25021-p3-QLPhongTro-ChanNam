import { getTenantProfile, updateTenantProfile, changeTenantPassword } from "../actions/tenantProfileActions";

const tenantProfileApi = {
  getProfile: getTenantProfile,
  updateProfile: updateTenantProfile,
  changePassword: changeTenantPassword,
};

export default tenantProfileApi;

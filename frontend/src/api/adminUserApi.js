import { getUsers, revokeSession, disableAccount, enableAccount, changeUserPassword } from "../actions/adminUserActions";

const adminUserApi = {
  getUsers,
  revokeSession,
  disableAccount,
  enableAccount,
  changePassword: changeUserPassword,
};

export default adminUserApi;

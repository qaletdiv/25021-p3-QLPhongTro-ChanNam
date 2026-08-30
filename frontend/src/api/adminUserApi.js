import { getUsers, revokeSession, disableAccount, enableAccount, changeUserPassword } from "../actions/adminUserActions";

const adminUserApi = {
  getUsers,
  revokeSession,
  disableAccount,
  enableAccount,
  changePassword: changeUserPassword,
  deleteAccount,
};

export default adminUserApi;

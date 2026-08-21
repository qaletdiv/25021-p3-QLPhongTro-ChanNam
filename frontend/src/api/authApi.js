import { register, login, logout, getMe } from "../actions/authActions";

const authApi = {
  register,
  login,
  logout,
  getMe,
};

export default authApi;

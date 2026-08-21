import { getSettings, saveSettings, checkTelegram, getBanks } from "../actions/settingActions";

const settingApi = {
  getAll: getSettings,
  save: saveSettings,
  checkTelegram,
  getBanks,
};

export default settingApi;

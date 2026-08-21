import { getVapidKey, subscribePush } from "../actions/pushActions";

const pushApi = {
  getVapid: getVapidKey,
  subscribe: subscribePush,
};

export default pushApi;

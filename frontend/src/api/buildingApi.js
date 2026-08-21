import { getBuildings, createBuilding, updateBuilding, deleteBuilding } from "../actions/buildingActions";

const buildingApi = {
  getAll: getBuildings,
  create: createBuilding,
  update: updateBuilding,
  delete: deleteBuilding,
};

export default buildingApi;

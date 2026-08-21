import { getFurnitures, createFurniture, updateFurniture, deleteFurniture } from "../actions/furnitureActions";

const furnitureApi = {
  getAll: getFurnitures,
  create: createFurniture,
  update: updateFurniture,
  delete: deleteFurniture,
};

export default furnitureApi;

import { getRooms, getRoomById, createRoom, updateRoom, deleteRoom } from "../actions/roomActions";

const roomApi = {
  getAll: getRooms,
  getById: getRoomById,
  create: createRoom,
  update: updateRoom,
  delete: deleteRoom,
};

export default roomApi;

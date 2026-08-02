import { useState, useRef } from "react";
import { defaultContractForm } from "../utils/contractFormBuilders";

export default function useContractFormState() {
  const paymentDayManuallyChanged = useRef(false);

  const [contractLoading, setContractLoading] = useState(false);
  const [openContract, setOpenContract] = useState(false);
  const [editContractId, setEditContractId] = useState(null);
  const [contractForm, setContractForm] = useState(defaultContractForm);
  const [companionFingerprints, setCompanionFingerprints] = useState([]);
  const [emptyRooms, setEmptyRooms] = useState([]);
  const [furnitureList, setFurnitureList] = useState([]);
  const [selectedFurnitures, setSelectedFurnitures] = useState({});

  return {
    paymentDayManuallyChanged,
    contractLoading, setContractLoading,
    openContract, setOpenContract,
    editContractId, setEditContractId,
    contractForm, setContractForm,
    companionFingerprints, setCompanionFingerprints,
    emptyRooms, setEmptyRooms,
    furnitureList, setFurnitureList,
    selectedFurnitures, setSelectedFurnitures,
  };
}

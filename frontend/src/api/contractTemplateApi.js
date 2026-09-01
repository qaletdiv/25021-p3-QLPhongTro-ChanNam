import { getTemplate, saveTemplate } from "../actions/contractTemplateActions";

export function getPdfUrl(id) {
  return `/api/contracts/${id}/pdf`;
}

const contractTemplateApi = {
  getTemplate,
  saveTemplate,
  getPdfUrl,
};

export default contractTemplateApi;

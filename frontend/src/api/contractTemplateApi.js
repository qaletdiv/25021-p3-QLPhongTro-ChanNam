import { getTemplate, saveTemplate } from "../actions/contractTemplateActions";

export function getPdfUrl(id) {
  return `/print/contract/${id}/pdf`;
}

const contractTemplateApi = {
  getTemplate,
  saveTemplate,
  getPdfUrl,
};

export default contractTemplateApi;
import ContractTemplate from "@/src/views/ContractTemplate";
import { getTemplate } from "@/src/actions/contractTemplateActions";
import { redirect } from "next/navigation";

export default async function ContractTemplatePage() {
  try {
    const res = await getTemplate();
    return <ContractTemplate initialTemplate={res.data.template || ""} />;
  } catch {
    redirect("/login/landlord");
  }
}

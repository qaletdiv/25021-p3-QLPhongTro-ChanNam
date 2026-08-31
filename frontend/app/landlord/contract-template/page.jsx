export const dynamic = 'force-dynamic'
import ContractTemplateClient from "./ContractTemplateClient";
import { getTemplate } from "@/src/actions/contractTemplateActions";
import { redirect } from "next/navigation";

export default async function ContractTemplatePage() {
  try {
    const res = await getTemplate();
    return <ContractTemplateClient initialTemplate={res.data.template || ""} />;
  } catch {
    redirect("/login/landlord");
  }
}


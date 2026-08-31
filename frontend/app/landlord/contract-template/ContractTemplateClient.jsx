"use client";

import dynamic from "next/dynamic";

const ContractTemplate = dynamic(() => import("@/src/views/ContractTemplate"), {
  ssr: false,
  loading: () => null,
});

export default function ContractTemplateClient({ initialTemplate }) {
  return <ContractTemplate initialTemplate={initialTemplate} />;
}

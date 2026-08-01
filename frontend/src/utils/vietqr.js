import { banks, getBankByCode, getBankByName } from "@viet-qr/core";

export function resolveBankInfo(bankName) {
  if (!bankName) return null;
  const name = String(bankName).trim();
  if (!name) return null;
  const byCode = getBankByCode(name);
  if (byCode) return byCode;
  const byName = getBankByName(name);
  if (byName) return byName;
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const byFuzzy = banks.find(
    (b) =>
      b.code.toLowerCase() === normalized ||
      b.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized ||
      b.fullName.toLowerCase().replace(/[^a-z0-9]/g, "").includes(normalized) ||
      normalized.includes(b.code.toLowerCase()) ||
      normalized.includes(b.name.toLowerCase().replace(/[^a-z0-9]/g, ""))
  );
  return byFuzzy || null;
}

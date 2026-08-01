export function resolveNotificationTemplate(template, vars = {}) {
  return String(template).replace(/\{\{\s*([A-Z_]+)\s*\}\}/g, (match, key) =>
    vars[key] !== undefined && vars[key] !== "" ? String(vars[key]) : match
  );
}

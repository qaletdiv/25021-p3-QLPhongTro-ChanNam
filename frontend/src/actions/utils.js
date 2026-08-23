export function buildParams(params) {
  if (!params || Object.keys(params).length === 0) return '';
  return '?' + new URLSearchParams(params).toString();
}

export function buildParamsDirect(obj) {
  return new URLSearchParams(obj).toString();
}
export function toParams(p: Record<string, string | number | undefined | null>): Record<string, string> {
  const params: Record<string, string> = {};
  Object.entries(p).forEach(([k, v]) => {
    if (v != null && v !== '') {
      params[k] = String(v);
    }
  });
  return params;
}

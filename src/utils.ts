export function normalizeNodeId(id: string): string {
  if (id.includes("-") && !id.includes(":")) {
    const normalized = id.replace(/-/g, ":");
    if (/^I?\d+:\d+(;\d+:\d+)*$/.test(normalized)) return normalized;
  }
  return id;
}

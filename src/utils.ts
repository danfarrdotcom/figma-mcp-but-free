/**
 * Normalize a Figma node ID to the canonical format.
 * Handles both "1234:5678" and "I1234:5678;1234:5679" formats.
 */
export function normalizeNodeId(id: string): string {
  return id.replace(/^I/, '').split(';')[0];
}

/**
 * Validate that a node ID looks like a valid Figma ID.
 */
export function validNodeId(id: string): boolean {
  return /^\d+:\d+$/.test(id);
}

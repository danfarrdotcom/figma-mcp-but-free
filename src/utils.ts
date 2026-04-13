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

/**
 * Extract individual IDs from a comma-separated list.
 */
export function parseNodeIds(input: string | string[]): string[] {
  if (Array.isArray(input)) return input;
  return input.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Batch node IDs into chunks of a given size.
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

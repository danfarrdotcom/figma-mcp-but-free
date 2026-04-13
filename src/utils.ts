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

/**
 * Convert Figma RGBA color to CSS hex string.
 */
export function rgbaToHex(r: number, g: number, b: number, a?: number): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return a !== undefined && a < 1 ? `${hex}${toHex(a)}` : hex;
}

/**
 * Convert CSS hex color to Figma RGBA.
 */
export function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const a = clean.length === 8 ? parseInt(clean.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

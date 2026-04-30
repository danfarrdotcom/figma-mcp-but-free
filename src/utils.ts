/**
 * Normalize node IDs from hyphen format (LLM artifact) to colon format.
 * "4029-12345" → "4029:12345"
 */
export function normalizeNodeId(id: string): string {
	if (id.includes("-") && !id.includes(":")) {
		const normalized = id.replace(/-/g, ":");
		if (/^I?\d+:\d+(;\d+:\d+)*$/.test(normalized)) return normalized;
	}
	return id;
}

export function validNodeId(id: string): boolean {
	return /^I?\d+:\d+(;\d+:\d+)*$/.test(id);
}

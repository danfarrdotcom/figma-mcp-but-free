import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer) {
	server.prompt(
		"read_design_strategy",
		"Strategy for reading and understanding Figma designs",
		() => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: "Analyze this Figma design structure...",
					},
				},
			],
		}),
	);

	server.prompt(
		"design_strategy",
		"General strategy for working with Figma designs via MCP",
		() => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: "Help me work with this Figma design...",
					},
				},
			],
		}),
	);

	server.prompt(
		"text_replacement_strategy",
		"Strategy for finding and replacing text in Figma nodes",
		() => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: "Find and replace text across Figma nodes...",
					},
				},
			],
		}),
	);
}

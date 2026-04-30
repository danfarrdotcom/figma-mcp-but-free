import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer) {
	server.prompt(
		"read_design_strategy",
		"Strategy for reading and understanding Figma designs",
		(params) => [
			{
				role: "user",
				content: {
					type: "text",
					text: "Analyze this Figma design structure...",
				},
			},
		],
	);

	server.prompt(
		"design_strategy",
		"General strategy for working with Figma designs via MCP",
		(params) => [
			{
				role: "user",
				content: {
					type: "text",
					text: "Help me work with this Figma design...",
				},
			},
		],
	);

	server.prompt(
		"text_replacement_strategy",
		"Strategy for finding and replacing text in Figma nodes",
		(params) => [
			{
				role: "user",
				content: {
					type: "text",
					text: "Find and replace text across Figma nodes...",
				},
			},
		],
	);
}

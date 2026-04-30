import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Bridge } from "../bridge.js";

const metaToolDefs = [
	{
		name: "get_connection_status",
		description: "Check the WebSocket connection status to the Figma plugin",
		inputSchema: {},
	},
	{
		name: "batch",
		description: "Execute multiple tool calls in a single request",
		inputSchema: {
			calls: z.array(
				z.object({ tool: z.string(), params: z.record(z.unknown()) }),
			),
		},
	},
];

export function registerMetaTools(server: McpServer, bridge: Bridge) {
	for (const tool of metaToolDefs) {
		server.tool(tool.name, tool.description, tool.inputSchema, async (args) => {
			const result = await bridge.send(
				tool.name,
				args as Record<string, unknown>,
			);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
			};
		});
	}
}

export const metaTools = metaToolDefs;

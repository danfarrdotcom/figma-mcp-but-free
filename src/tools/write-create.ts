import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Bridge } from "../bridge.js";

const createToolDefs = [
	{
		name: "create_frame",
		description: "Create a new frame with optional auto layout",
		inputSchema: {
			name: z.string().optional(),
			x: z.number().optional(),
			y: z.number().optional(),
			width: z.number().optional(),
			height: z.number().optional(),
			parentId: z.string().optional(),
			layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"]).optional(),
			itemSpacing: z.number().optional(),
			fills: z.array(z.any()).optional(),
		},
	},
	{
		name: "create_rectangle",
		description: "Create a rectangle node",
		inputSchema: {
			name: z.string().optional(),
			x: z.number().optional(),
			y: z.number().optional(),
			width: z.number(),
			height: z.number(),
			parentId: z.string().optional(),
			cornerRadius: z.number().optional(),
			fills: z.array(z.any()).optional(),
		},
	},
	{
		name: "create_ellipse",
		description: "Create an ellipse node",
		inputSchema: {
			name: z.string().optional(),
			x: z.number().optional(),
			y: z.number().optional(),
			width: z.number(),
			height: z.number(),
			parentId: z.string().optional(),
			fills: z.array(z.any()).optional(),
		},
	},
	{
		name: "create_text",
		description: "Create a text node",
		inputSchema: {
			name: z.string().optional(),
			x: z.number().optional(),
			y: z.number().optional(),
			characters: z.string(),
			fontSize: z.number().optional(),
			fontName: z.object({ family: z.string(), style: z.string() }).optional(),
			parentId: z.string().optional(),
		},
	},
	{
		name: "create_component_instance",
		description: "Create an instance of a component",
		inputSchema: {
			componentId: z.string(),
			x: z.number().optional(),
			y: z.number().optional(),
			parentId: z.string().optional(),
		},
	},
	{
		name: "create_section",
		description: "Create a section node",
		inputSchema: {
			name: z.string().optional(),
			x: z.number().optional(),
			y: z.number().optional(),
			width: z.number(),
			height: z.number(),
			parentId: z.string().optional(),
		},
	},
];

export function registerWriteCreateTools(server: McpServer, bridge: Bridge) {
	for (const tool of createToolDefs) {
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

export const writeCreateTools = createToolDefs;

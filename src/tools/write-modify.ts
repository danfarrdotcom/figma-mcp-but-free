import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Bridge } from "../bridge.js";

const arbitraryObjectSchema = z.record(z.string(), z.unknown());

const modifyToolDefs = [
	{
		name: "set_text",
		description: "Set text content and typography properties",
		inputSchema: {
			nodeId: z.string(),
			characters: z.string().optional(),
			fontSize: z.number().optional(),
			fontName: z.object({ family: z.string(), style: z.string() }).optional(),
			textAlignHorizontal: z
				.enum(["LEFT", "CENTER", "RIGHT", "JUSTIFIED"])
				.optional(),
			textAlignVertical: z.enum(["TOP", "CENTER", "BOTTOM"]).optional(),
			letterSpacing: z.any().optional(),
			lineHeight: z.any().optional(),
		},
	},
	{
		name: "set_fills",
		description: "Set fill paints on a node",
		inputSchema: { nodeId: z.string(), fills: z.array(arbitraryObjectSchema) },
	},
	{
		name: "set_strokes",
		description: "Set stroke paints on a node",
		inputSchema: {
			nodeId: z.string(),
			strokes: z.array(arbitraryObjectSchema),
			strokeWeight: z.number().optional(),
			strokeAlign: z.enum(["INSIDE", "OUTSIDE", "CENTER"]).optional(),
		},
	},
	{
		name: "set_opacity",
		description: "Set node opacity (0-1)",
		inputSchema: { nodeId: z.string(), opacity: z.number().min(0).max(1) },
	},
	{
		name: "set_visibility",
		description: "Set node visibility",
		inputSchema: { nodeId: z.string(), visible: z.boolean() },
	},
	{
		name: "set_dimensions",
		description: "Set node position and size",
		inputSchema: {
			nodeId: z.string(),
			x: z.number().optional(),
			y: z.number().optional(),
			width: z.number().optional(),
			height: z.number().optional(),
		},
	},
	{
		name: "set_rotation",
		description: "Set node rotation in degrees",
		inputSchema: { nodeId: z.string(), rotation: z.number() },
	},
	{
		name: "set_auto_layout",
		description: "Set auto layout properties on a frame",
		inputSchema: {
			nodeId: z.string(),
			layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"]),
			itemSpacing: z.number().optional(),
			paddingTop: z.number().optional(),
			paddingBottom: z.number().optional(),
			paddingLeft: z.number().optional(),
			paddingRight: z.number().optional(),
		},
	},
	{
		name: "set_corner_radius",
		description: "Set corner radius on a shape",
		inputSchema: { nodeId: z.string(), cornerRadius: z.number() },
	},
	{
		name: "set_effects",
		description: "Set effects (shadows, blurs) on a node",
		inputSchema: { nodeId: z.string(), effects: z.array(arbitraryObjectSchema) },
	},
];

export function registerWriteModifyTools(server: McpServer, bridge: Bridge) {
	for (const tool of modifyToolDefs) {
		server.tool(tool.name, tool.description, tool.inputSchema, async (args) => {
			const result = await bridge.send(
				tool.name,
				undefined,
				args as Record<string, unknown>,
			);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
			};
		});
	}
}

export const writeModifyTools = modifyToolDefs;

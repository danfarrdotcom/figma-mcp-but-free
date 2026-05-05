import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Bridge } from "../bridge.js";

const arbitraryObjectSchema = z.object({}).passthrough();

const writeOtherToolDefs = [
	{
		name: "create_paint_style",
		description: "Create a new paint style",
		inputSchema: { name: z.string(), paints: z.array(arbitraryObjectSchema) },
	},
	{
		name: "create_text_style",
		description: "Create a new text style",
		inputSchema: {
			name: z.string(),
			fontSize: z.number().optional(),
			fontName: z.object({ family: z.string(), style: z.string() }).optional(),
		},
	},
	{
		name: "create_effect_style",
		description: "Create a new effect style",
		inputSchema: { name: z.string(), effects: z.array(arbitraryObjectSchema) },
	},
	{
		name: "create_grid_style",
		description: "Create a new grid style",
		inputSchema: {
			name: z.string(),
			layoutGrids: z.array(arbitraryObjectSchema),
		},
	},
	{
		name: "apply_style",
		description: "Apply a style to a node",
		inputSchema: { nodeId: z.string(), styleId: z.string() },
	},
	{
		name: "create_variable",
		description: "Create a new variable in a collection",
		inputSchema: {
			name: z.string(),
			collectionId: z.string(),
			resolvedType: z.enum(["COLOR", "FLOAT", "STRING", "BOOLEAN"]),
			defaultValue: z.any(),
			variableId: z.string().optional(),
		},
	},
	{
		name: "set_variable_value",
		description: "Set a variable value in a mode",
		inputSchema: { variableId: z.string(), modeId: z.string(), value: z.any() },
	},
	{
		name: "add_reaction",
		description: "Add a prototype reaction to a node",
		inputSchema: { nodeId: z.string(), trigger: z.any(), action: z.any() },
	},
	{
		name: "create_page",
		description: "Create a new page in the document",
		inputSchema: { name: z.string() },
	},
	{
		name: "group_nodes",
		description: "Group selected nodes into a frame",
		inputSchema: { nodeIds: z.array(z.string()), name: z.string().optional() },
	},
	{
		name: "ungroup_node",
		description: "Ungroup a frame into its children",
		inputSchema: { nodeId: z.string() },
	},
	{
		name: "swap_component",
		description: "Swap a component instance with another",
		inputSchema: { nodeId: z.string(), newComponentId: z.string() },
	},
	{
		name: "detach_instance",
		description: "Detach a component instance",
		inputSchema: { nodeId: z.string() },
	},
];

export function registerWriteOtherTools(server: McpServer, bridge: Bridge) {
	for (const tool of writeOtherToolDefs) {
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

export const writeOtherTools = writeOtherToolDefs;

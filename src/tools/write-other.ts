import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Bridge } from "../bridge.js";
import { normalizeNodeId } from "../utils.js";

async function call(
  bridge: Bridge,
  tool: string,
  nodeIds?: string[],
  params?: Record<string, unknown>
) {
  const ids = nodeIds?.map(normalizeNodeId);
  const resp = await bridge.send(tool, ids, params);
  if (resp.error) return { content: [{ type: "text" as const, text: `Error: ${resp.error}` }], isError: true };
  return { content: [{ type: "text" as const, text: JSON.stringify(resp.data) }] };
}

export function registerWriteStyleTools(server: McpServer, bridge: Bridge) {
  server.tool("create_paint_style", "Create a named paint style with a solid color", { name: z.string(), color: z.string().describe("Hex color"), description: z.string().optional() }, async (params) => call(bridge, "create_paint_style", undefined, params));

  server.tool("create_text_style", "Create a named text style", { name: z.string(), fontFamily: z.string().optional(), fontSize: z.number().optional(), fontWeight: z.number().optional(), lineHeight: z.number().optional(), lineHeightUnit: z.enum(["PIXELS", "PERCENT"]).optional(), letterSpacing: z.number().optional(), letterSpacingUnit: z.enum(["PIXELS", "PERCENT"]).optional(), textDecoration: z.enum(["NONE", "UNDERLINE", "STRIKETHROUGH"]).optional() }, async (params) => call(bridge, "create_text_style", undefined, params));

  server.tool("create_effect_style", "Create a named effect style", { name: z.string(), type: z.enum(["DROP_SHADOW", "INNER_SHADOW", "LAYER_BLUR", "BACKGROUND_BLUR"]).optional(), color: z.string().optional(), offset: z.object({ x: z.number(), y: z.number() }).optional(), radius: z.number().optional(), spread: z.number().optional() }, async (params) => call(bridge, "create_effect_style", undefined, params));

  server.tool("create_grid_style", "Create a named layout grid style", { name: z.string(), pattern: z.enum(["GRID", "COLUMNS", "ROWS"]).optional(), alignment: z.enum(["STRETCH", "CENTER", "MIN", "MAX"]).optional(), count: z.number().optional(), gutterSize: z.number().optional(), offset: z.number().optional(), sectionSize: z.number().optional() }, async (params) => call(bridge, "create_grid_style", undefined, params));

  server.tool("update_paint_style", "Rename or recolor an existing paint style", { styleId: z.string(), name: z.string().optional(), color: z.string().optional(), description: z.string().optional() }, async (params) => call(bridge, "update_paint_style", undefined, params));

  server.tool("apply_style_to_node", "Apply a local style to a node", { nodeId: z.string(), styleId: z.string(), target: z.enum(["fill", "stroke"]).optional() }, async ({ nodeId, ...rest }) => call(bridge, "apply_style_to_node", [nodeId], rest));

  server.tool("delete_style", "Delete any style by ID", { styleId: z.string() }, async (params) => call(bridge, "delete_style", undefined, params));
}

export function registerWriteVariableTools(server: McpServer, bridge: Bridge) {
  server.tool("create_variable_collection", "Create a new variable collection", { name: z.string(), initialModeName: z.string().optional() }, async (params) => call(bridge, "create_variable_collection", undefined, params));

  server.tool("add_variable_mode", "Add a mode to a collection (e.g. Light/Dark)", { collectionId: z.string(), modeName: z.string() }, async (params) => call(bridge, "add_variable_mode", undefined, params));

  server.tool("create_variable", "Create a variable in a collection", { name: z.string(), collectionId: z.string(), type: z.enum(["COLOR", "FLOAT", "STRING", "BOOLEAN"]) }, async (params) => call(bridge, "create_variable", undefined, params));

  server.tool("set_variable_value", "Set a variable's value for a specific mode", { variableId: z.string(), modeId: z.string(), value: z.unknown() }, async (params) => call(bridge, "set_variable_value", undefined, params as Record<string, unknown>));

  server.tool("bind_variable_to_node", "Bind a variable to a node property", { nodeId: z.string(), variableId: z.string(), field: z.string().describe("Property to bind (fillColor, strokeColor, visible, opacity, etc.)") }, async ({ nodeId, ...rest }) => call(bridge, "bind_variable_to_node", [nodeId], rest));

  server.tool("delete_variable", "Delete a variable or collection", { variableId: z.string().optional(), collectionId: z.string().optional() }, async (params) => call(bridge, "delete_variable", undefined, params));
}

export function registerWritePrototypeTools(server: McpServer, bridge: Bridge) {
  server.tool("set_reactions", "Set prototype reactions on a node", { nodeId: z.string(), reactions: z.array(z.record(z.unknown())).describe("Array of reaction objects"), mode: z.enum(["replace", "append"]).optional() }, async ({ nodeId, ...rest }) => call(bridge, "set_reactions", [nodeId], rest));

  server.tool("remove_reactions", "Remove reactions from a node", { nodeId: z.string(), indices: z.array(z.number()).optional().describe("Indices to remove (all if omitted)") }, async ({ nodeId, ...rest }) => call(bridge, "remove_reactions", [nodeId], rest));
}

export function registerWritePageTools(server: McpServer, bridge: Bridge) {
  server.tool("add_page", "Add a new page", { name: z.string().optional(), index: z.number().optional() }, async (params) => call(bridge, "add_page", undefined, params));

  server.tool("delete_page", "Delete a page by ID or name", { pageId: z.string().optional(), pageName: z.string().optional() }, async (params) => call(bridge, "delete_page", undefined, params));

  server.tool("rename_page", "Rename a page", { pageId: z.string().optional(), pageName: z.string().optional(), newName: z.string() }, async (params) => call(bridge, "rename_page", undefined, params));

  server.tool("navigate_to_page", "Switch the active Figma page", { pageId: z.string().optional(), pageName: z.string().optional() }, async (params) => call(bridge, "navigate_to_page", undefined, params));
}

export function registerWriteComponentTools(server: McpServer, bridge: Bridge) {
  server.tool("group_nodes", "Group two or more nodes into a GROUP", { nodeIds: z.array(z.string()).min(2) }, async ({ nodeIds }) => call(bridge, "group_nodes", nodeIds));

  server.tool("ungroup_nodes", "Ungroup GROUP nodes", { nodeIds: z.array(z.string()) }, async ({ nodeIds }) => call(bridge, "ungroup_nodes", nodeIds));

  server.tool("swap_component", "Swap the main component of an INSTANCE node", { nodeId: z.string(), componentId: z.string() }, async ({ nodeId, componentId }) => call(bridge, "swap_component", [nodeId], { componentId }));

  server.tool("detach_instance", "Detach component instances to plain frames", { nodeIds: z.array(z.string()) }, async ({ nodeIds }) => call(bridge, "detach_instance", nodeIds));
}

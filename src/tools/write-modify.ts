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

export function registerWriteModifyTools(server: McpServer, bridge: Bridge) {
  server.tool("set_text", "Update text content of an existing TEXT node", { nodeId: z.string(), text: z.string() }, async ({ nodeId, text }) => call(bridge, "set_text", [nodeId], { text }));

  server.tool("set_fills", "Set solid fill color (hex) on a node", { nodeId: z.string(), color: z.string().describe("Hex color e.g. #FF5733"), mode: z.enum(["replace", "append"]).optional() }, async ({ nodeId, color, mode }) => call(bridge, "set_fills", [nodeId], { color, mode }));

  server.tool("set_strokes", "Set solid stroke color and weight on a node", { nodeId: z.string(), color: z.string(), weight: z.number().optional(), mode: z.enum(["replace", "append"]).optional() }, async ({ nodeId, ...rest }) => call(bridge, "set_strokes", [nodeId], rest));

  server.tool("set_opacity", "Set opacity of one or more nodes (0–1)", { nodeIds: z.array(z.string()), opacity: z.number().min(0).max(1) }, async ({ nodeIds, opacity }) => call(bridge, "set_opacity", nodeIds, { opacity }));

  server.tool("set_corner_radius", "Set corner radius — uniform or per-corner", { nodeIds: z.array(z.string()), cornerRadius: z.number().optional(), topLeftRadius: z.number().optional(), topRightRadius: z.number().optional(), bottomLeftRadius: z.number().optional(), bottomRightRadius: z.number().optional() }, async ({ nodeIds, ...rest }) => call(bridge, "set_corner_radius", nodeIds, rest));

  server.tool("set_auto_layout", "Set or update auto-layout properties on a frame", { nodeId: z.string(), layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"]).optional(), primaryAxisAlignItems: z.enum(["MIN", "CENTER", "MAX", "SPACE_BETWEEN"]).optional(), counterAxisAlignItems: z.enum(["MIN", "CENTER", "MAX", "BASELINE"]).optional(), itemSpacing: z.number().optional(), paddingTop: z.number().optional(), paddingBottom: z.number().optional(), paddingLeft: z.number().optional(), paddingRight: z.number().optional(), primaryAxisSizingMode: z.enum(["FIXED", "AUTO"]).optional(), counterAxisSizingMode: z.enum(["FIXED", "AUTO"]).optional(), layoutWrap: z.enum(["NO_WRAP", "WRAP"]).optional() }, async ({ nodeId, ...rest }) => call(bridge, "set_auto_layout", [nodeId], rest));

  server.tool("set_visible", "Show or hide one or more nodes", { nodeIds: z.array(z.string()), visible: z.boolean() }, async ({ nodeIds, visible }) => call(bridge, "set_visible", nodeIds, { visible }));

  server.tool("lock_nodes", "Lock one or more nodes", { nodeIds: z.array(z.string()) }, async ({ nodeIds }) => call(bridge, "lock_nodes", nodeIds));

  server.tool("unlock_nodes", "Unlock one or more nodes", { nodeIds: z.array(z.string()) }, async ({ nodeIds }) => call(bridge, "unlock_nodes", nodeIds));

  server.tool("rotate_nodes", "Set absolute rotation in degrees", { nodeIds: z.array(z.string()), rotation: z.number() }, async ({ nodeIds, rotation }) => call(bridge, "rotate_nodes", nodeIds, { rotation }));

  server.tool("reorder_nodes", "Change z-order of nodes", { nodeIds: z.array(z.string()), order: z.enum(["bringToFront", "sendToBack", "bringForward", "sendBackward"]) }, async ({ nodeIds, order }) => call(bridge, "reorder_nodes", nodeIds, { order }));

  server.tool("set_blend_mode", "Set blend mode on one or more nodes", { nodeIds: z.array(z.string()), blendMode: z.string().describe("MULTIPLY, SCREEN, OVERLAY, etc.") }, async ({ nodeIds, blendMode }) => call(bridge, "set_blend_mode", nodeIds, { blendMode }));

  server.tool("set_constraints", "Set responsive constraints on nodes", { nodeIds: z.array(z.string()), horizontal: z.enum(["MIN", "MAX", "CENTER", "STRETCH", "SCALE"]).optional(), vertical: z.enum(["MIN", "MAX", "CENTER", "STRETCH", "SCALE"]).optional() }, async ({ nodeIds, ...rest }) => call(bridge, "set_constraints", nodeIds, rest));

  server.tool("move_nodes", "Move nodes to an absolute x/y position", { nodeIds: z.array(z.string()), x: z.number().optional(), y: z.number().optional() }, async ({ nodeIds, ...rest }) => call(bridge, "move_nodes", nodeIds, rest));

  server.tool("resize_nodes", "Resize nodes by width and/or height", { nodeIds: z.array(z.string()), width: z.number().optional(), height: z.number().optional() }, async ({ nodeIds, ...rest }) => call(bridge, "resize_nodes", nodeIds, rest));

  server.tool("rename_node", "Rename a node", { nodeId: z.string(), name: z.string() }, async ({ nodeId, name }) => call(bridge, "rename_node", [nodeId], { name }));

  server.tool("clone_node", "Clone a node, optionally repositioning or reparenting", { nodeId: z.string(), x: z.number().optional(), y: z.number().optional(), parentId: z.string().optional() }, async ({ nodeId, ...rest }) => call(bridge, "clone_node", [nodeId], rest));

  server.tool("reparent_nodes", "Move nodes to a different parent", { nodeIds: z.array(z.string()), parentId: z.string() }, async ({ nodeIds, parentId }) => call(bridge, "reparent_nodes", nodeIds, { parentId }));

  server.tool("batch_rename_nodes", "Bulk rename nodes via find/replace or prefix/suffix", { nodeIds: z.array(z.string()), find: z.string().optional(), replace: z.string().optional(), prefix: z.string().optional(), suffix: z.string().optional(), regex: z.boolean().optional() }, async ({ nodeIds, ...rest }) => call(bridge, "batch_rename_nodes", nodeIds, rest));

  server.tool("find_replace_text", "Find and replace text across TEXT nodes", { find: z.string(), replace: z.string(), nodeId: z.string().optional().describe("Subtree root"), regex: z.boolean().optional(), caseSensitive: z.boolean().optional() }, async ({ nodeId, ...rest }) => call(bridge, "find_replace_text", nodeId ? [nodeId] : undefined, { ...rest, nodeId }));

  server.tool("delete_nodes", "Delete one or more nodes permanently", { nodeIds: z.array(z.string()) }, async ({ nodeIds }) => call(bridge, "delete_nodes", nodeIds));

  server.tool("set_effects", "Apply drop shadow / blur effects on a node", { nodeId: z.string(), effects: z.array(z.object({ type: z.enum(["DROP_SHADOW", "INNER_SHADOW", "LAYER_BLUR", "BACKGROUND_BLUR"]), color: z.string().optional(), offset: z.object({ x: z.number(), y: z.number() }).optional(), radius: z.number().optional(), spread: z.number().optional(), visible: z.boolean().optional() })) }, async ({ nodeId, effects }) => call(bridge, "set_effects", [nodeId], { effects }));
}

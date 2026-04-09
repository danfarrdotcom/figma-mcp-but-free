import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Bridge } from "../bridge.js";
import { normalizeNodeId } from "../utils.js";

/** Helper: send a command to the bridge and return the result as MCP text content. */
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

export function registerReadTools(server: McpServer, bridge: Bridge) {
  server.tool("get_document", "Get the full current page tree", {}, async () => call(bridge, "get_document"));

  server.tool("get_metadata", "Get file name, pages, current page", {}, async () => call(bridge, "get_metadata"));

  server.tool("get_pages", "Get all pages (IDs + names)", {}, async () => call(bridge, "get_pages"));

  server.tool("get_selection", "Get currently selected nodes", {}, async () => call(bridge, "get_selection"));

  server.tool("get_node", "Get a single node by ID", { nodeId: z.string().describe("Node ID (e.g. 4029:12345)") }, async ({ nodeId }) => call(bridge, "get_node", [nodeId]));

  server.tool("get_nodes_info", "Get multiple nodes by ID", { nodeIds: z.array(z.string()).describe("Array of node IDs") }, async ({ nodeIds }) => call(bridge, "get_nodes_info", nodeIds));

  server.tool(
    "get_design_context",
    "Depth-limited tree with detail level (minimal/compact/full)",
    {
      nodeId: z.string().optional().describe("Root node ID"),
      depth: z.number().optional().describe("Max depth"),
      detail: z.enum(["minimal", "compact", "full"]).optional().describe("Detail level"),
    },
    async (params) => {
      const nodeIds = params.nodeId ? [params.nodeId] : undefined;
      const p: Record<string, unknown> = {};
      if (params.depth !== undefined) p.depth = params.depth;
      if (params.detail) p.detail = params.detail;
      return call(bridge, "get_design_context", nodeIds, p);
    }
  );

  server.tool(
    "search_nodes",
    "Find nodes by name substring and/or type within a subtree",
    {
      query: z.string().describe("Search query"),
      nodeId: z.string().optional().describe("Subtree root node ID"),
      type: z.string().optional().describe("Node type filter"),
      limit: z.number().optional().describe("Max results"),
    },
    async (params) => {
      const p: Record<string, unknown> = { query: params.query };
      if (params.nodeId) p.nodeId = params.nodeId;
      if (params.type) p.type = params.type;
      if (params.limit) p.limit = params.limit;
      return call(bridge, "search_nodes", undefined, p);
    }
  );

  server.tool(
    "scan_text_nodes",
    "Get all text nodes in a subtree",
    { nodeId: z.string().describe("Root node ID") },
    async ({ nodeId }) => call(bridge, "scan_text_nodes", undefined, { nodeId })
  );

  server.tool(
    "scan_nodes_by_types",
    "Get nodes matching given type list",
    {
      nodeId: z.string().describe("Root node ID"),
      types: z.array(z.string()).describe("Node types to match"),
    },
    async ({ nodeId, types }) => call(bridge, "scan_nodes_by_types", undefined, { nodeId, types })
  );

  server.tool("get_viewport", "Get current viewport center, zoom, and visible bounds", {}, async () => call(bridge, "get_viewport"));

  // Styles & Variables
  server.tool("get_styles", "Get paint, text, effect, and grid styles", {}, async () => call(bridge, "get_styles"));

  server.tool("get_variable_defs", "Get variable collections and values", {}, async () => call(bridge, "get_variable_defs"));

  server.tool("get_local_components", "Get all components + component sets", {}, async () => call(bridge, "get_local_components"));

  server.tool("get_annotations", "Get dev-mode annotations", {}, async () => call(bridge, "get_annotations"));

  server.tool("get_fonts", "Get all fonts used on the current page", {}, async () => call(bridge, "get_fonts"));

  server.tool(
    "get_reactions",
    "Get prototype reactions on a node",
    { nodeId: z.string().describe("Node ID") },
    async ({ nodeId }) => call(bridge, "get_reactions", [nodeId])
  );

  // Export
  server.tool(
    "get_screenshot",
    "Base64 image export of any node",
    {
      nodeId: z.string().describe("Node ID to export"),
      format: z.enum(["PNG", "SVG", "JPG", "PDF"]).optional().describe("Export format"),
      scale: z.number().optional().describe("Export scale"),
    },
    async ({ nodeId, format, scale }) => {
      const p: Record<string, unknown> = {};
      if (format) p.format = format;
      if (scale) p.scale = scale;
      return call(bridge, "get_screenshot", [nodeId], p);
    }
  );

  server.tool(
    "export_tokens",
    "Export design tokens (variables + paint styles) as JSON or CSS",
    { format: z.enum(["json", "css"]).optional().describe("Output format") },
    async ({ format }) => call(bridge, "export_tokens", undefined, format ? { format } : undefined)
  );
}

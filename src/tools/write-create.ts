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

export function registerWriteCreateTools(server: McpServer, bridge: Bridge) {
  server.tool(
    "create_frame",
    "Create a frame with optional auto-layout, fill, and parent",
    {
      name: z.string().optional().describe("Frame name"),
      width: z.number().optional().describe("Width in pixels"),
      height: z.number().optional().describe("Height in pixels"),
      x: z.number().optional().describe("X position"),
      y: z.number().optional().describe("Y position"),
      parentId: z.string().optional().describe("Parent node ID"),
      fillColor: z.string().optional().describe("Fill color hex (e.g. #FF5733)"),
      layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"]).optional(),
      primaryAxisAlignItems: z.enum(["MIN", "CENTER", "MAX", "SPACE_BETWEEN"]).optional(),
      counterAxisAlignItems: z.enum(["MIN", "CENTER", "MAX", "BASELINE"]).optional(),
      itemSpacing: z.number().optional(),
      paddingTop: z.number().optional(),
      paddingBottom: z.number().optional(),
      paddingLeft: z.number().optional(),
      paddingRight: z.number().optional(),
    },
    async (params) => call(bridge, "create_frame", undefined, params)
  );

  server.tool(
    "create_rectangle",
    "Create a rectangle with optional fill and corner radius",
    {
      width: z.number().optional().describe("Width"),
      height: z.number().optional().describe("Height"),
      x: z.number().optional(),
      y: z.number().optional(),
      parentId: z.string().optional(),
      fillColor: z.string().optional().describe("Fill color hex"),
      cornerRadius: z.number().optional(),
      name: z.string().optional(),
    },
    async (params) => call(bridge, "create_rectangle", undefined, params)
  );

  server.tool(
    "create_ellipse",
    "Create an ellipse or circle",
    {
      width: z.number().optional(),
      height: z.number().optional(),
      x: z.number().optional(),
      y: z.number().optional(),
      parentId: z.string().optional(),
      fillColor: z.string().optional(),
      name: z.string().optional(),
    },
    async (params) => call(bridge, "create_ellipse", undefined, params)
  );

  server.tool(
    "create_text",
    "Create a text node (font loaded automatically)",
    {
      text: z.string().describe("Text content"),
      x: z.number().optional(),
      y: z.number().optional(),
      parentId: z.string().optional(),
      fontSize: z.number().optional(),
      fontFamily: z.string().optional(),
      fontWeight: z.number().optional(),
      fillColor: z.string().optional(),
      name: z.string().optional(),
    },
    async (params) => call(bridge, "create_text", undefined, params)
  );

  server.tool(
    "import_image",
    "Decode base64 image and place it as a rectangle fill",
    {
      imageData: z.string().describe("Base64-encoded image data"),
      width: z.number().optional(),
      height: z.number().optional(),
      x: z.number().optional(),
      y: z.number().optional(),
      parentId: z.string().optional(),
      scaleMode: z.enum(["FILL", "FIT", "CROP", "TILE"]).optional(),
      name: z.string().optional(),
    },
    async (params) => call(bridge, "import_image", undefined, params)
  );

  server.tool(
    "create_component",
    "Convert an existing FRAME node into a reusable component",
    { nodeId: z.string().describe("Frame node ID to convert") },
    async ({ nodeId }) => call(bridge, "create_component", [nodeId])
  );

  server.tool(
    "create_section",
    "Create a Figma Section node to organise frames on a page",
    {
      name: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      x: z.number().optional(),
      y: z.number().optional(),
    },
    async (params) => call(bridge, "create_section", undefined, params)
  );
}

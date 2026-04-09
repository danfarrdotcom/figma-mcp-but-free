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
  if (resp.error) return { error: resp.error, data: undefined };
  return { error: undefined, data: resp.data };
}

export function registerMetaTools(server: McpServer, bridge: Bridge) {
  server.tool(
    "get_connection_status",
    "Check if the Figma plugin is connected. Use this before other operations to give the user actionable guidance.",
    {},
    async () => {
      const connected = bridge.connected;
      const text = connected
        ? JSON.stringify({ connected: true, message: "Plugin is connected and ready." })
        : JSON.stringify({ connected: false, message: "Plugin is not connected. Ask the user to open Figma Desktop and run the MCP Bridge plugin." });
      return { content: [{ type: "text" as const, text }] };
    }
  );

  server.tool(
    "batch",
    "Execute multiple operations in sequence in a single round-trip. Reduces latency for multi-step creation flows.",
    {
      operations: z.array(z.object({
        tool: z.string().describe("Tool name to execute"),
        nodeIds: z.array(z.string()).optional(),
        params: z.record(z.unknown()).optional(),
      })),
    },
    async ({ operations }) => {
      const results: Array<{ index: number; tool: string; success: boolean; data?: unknown; error?: string }> = [];

      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        try {
          const { error, data } = await call(bridge, op.tool, op.nodeIds, op.params);
          if (error) {
            results.push({ index: i, tool: op.tool, success: false, error });
          } else {
            results.push({ index: i, tool: op.tool, success: true, data });
          }
        } catch (err: any) {
          results.push({ index: i, tool: op.tool, success: false, error: err.message });
        }
      }

      const succeeded = results.filter(r => r.success).length;
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ total: results.length, succeeded, failed: results.length - succeeded, results })
        }]
      };
    }
  );
}

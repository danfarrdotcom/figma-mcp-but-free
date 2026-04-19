import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { Bridge } from '../bridge.js';

const readToolDefs = [
  { name: 'get_document', description: 'Get the full Figma document tree', inputSchema: {} },
  { name: 'get_metadata', description: 'Get file name, pages, and current page info', inputSchema: {} },
  { name: 'get_pages', description: 'List all pages in the Figma file', inputSchema: {} },
  { name: 'get_selection', description: 'Get currently selected nodes in the canvas', inputSchema: {} },
  { name: 'get_node', description: 'Get a single node by ID with full detail', inputSchema: { nodeId: z.string() } },
  { name: 'get_nodes_info', description: 'Get multiple nodes by their IDs', inputSchema: { nodeIds: z.array(z.string()) } },
];

export function registerReadTools(server: McpServer, bridge: Bridge) {
  for (const tool of readToolDefs) {
    server.tool(tool.name, tool.description, tool.inputSchema, async (args) => {
      const result = await bridge.send(tool.name, args as Record<string, unknown>);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    });
  }
}

export const readTools = readToolDefs;

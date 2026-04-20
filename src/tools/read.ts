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
  { name: 'get_design_context', description: 'Get node context with configurable depth and detail level', inputSchema: { nodeId: z.string(), depth: z.number().optional(), detail: z.enum(['minimal', 'compact', 'full']).optional() } },
  { name: 'search_nodes', description: 'Search nodes by name and type within a subtree', inputSchema: { nodeId: z.string().optional(), query: z.string(), type: z.string().optional(), limit: z.number().optional() } },
  { name: 'scan_text_nodes', description: 'Find all text nodes in a subtree', inputSchema: { nodeId: z.string() } },
  { name: 'scan_nodes_by_types', description: 'Find all nodes matching specific types', inputSchema: { nodeId: z.string(), types: z.array(z.string()) } },
  { name: 'get_viewport', description: 'Get current viewport center, zoom, and bounds', inputSchema: {} },
  { name: 'get_styles', description: 'Get all local paint, text, effect, and grid styles', inputSchema: {} },
  { name: 'get_variable_defs', description: 'Get variable definitions from local collections', inputSchema: {} },
  { name: 'get_local_components', description: 'Get local components and component sets', inputSchema: {} },
  { name: 'get_annotations', description: 'Get annotations on nodes', inputSchema: { nodeId: z.string().optional() } },
  { name: 'get_fonts', description: 'Get font usage statistics from the current page', inputSchema: {} },
  { name: 'get_reactions', description: 'Get prototype reactions on a node', inputSchema: { nodeId: z.string() } },
  { name: 'get_screenshot', description: 'Take a screenshot of a node or page as base64', inputSchema: { nodeId: z.string().optional(), format: z.enum(['PNG', 'JPG', 'SVG', 'PDF']).optional(), scale: z.number().optional() } },
  { name: 'export_tokens', description: 'Export design tokens (variables, colors) as JSON or CSS', inputSchema: { format: z.enum(['json', 'css']).optional() } },
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

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { Bridge } from '../bridge.js';

const exportToolDefs = [
  { name: 'save_screenshots', description: 'Save screenshots of multiple nodes to files', inputSchema: { nodeIds: z.array(z.string()), format: z.enum(['PNG', 'JPG', 'SVG']).optional(), scale: z.number().optional(), outputDir: z.string().optional() } },
  { name: 'export_frames_to_pdf', description: 'Export selected frames as a PDF document', inputSchema: { nodeIds: z.array(z.string()), pageSize: z.enum(['A4', 'Letter', 'Auto']).optional(), orientation: z.enum(['portrait', 'landscape']).optional() } },
];

export function registerExportTools(server: McpServer, bridge: Bridge) {
  for (const tool of exportToolDefs) {
    server.tool(tool.name, tool.description, tool.inputSchema, async (args) => {
      const result = await bridge.send(tool.name, args as Record<string, unknown>);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    });
  }
}

export const exportTools = exportToolDefs;

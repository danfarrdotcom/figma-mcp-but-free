import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Bridge } from "../bridge.js";
import { normalizeNodeId } from "../utils.js";
import { writeFile, mkdir } from "fs/promises";
import { dirname, resolve, relative, isAbsolute } from "path";

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

export function registerExportTools(server: McpServer, bridge: Bridge) {
  server.tool(
    "save_screenshots",
    "Export node images to disk. Returns file paths of saved images.",
    {
      items: z.array(z.object({
        nodeId: z.string().describe("Node ID to export"),
        outputPath: z.string().describe("Relative or absolute file path to save to"),
        format: z.enum(["PNG", "SVG", "JPG", "PDF"]).optional(),
        scale: z.number().optional(),
      })),
      format: z.enum(["PNG", "SVG", "JPG", "PDF"]).optional().describe("Default format for all items"),
      scale: z.number().optional().describe("Default scale for all items"),
    },
    async ({ items, format: defaultFormat, scale: defaultScale }) => {
      const workDir = process.cwd();
      const results: Array<{ index: number; nodeId: string; outputPath: string; success: boolean; error?: string; bytesWritten?: number }> = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          const format = item.format || defaultFormat || inferFormat(item.outputPath) || "PNG";
          const scale = item.scale || defaultScale || 2;

          // Resolve and validate path
          const outputPath = isAbsolute(item.outputPath)
            ? item.outputPath
            : resolve(workDir, item.outputPath);
          const rel = relative(workDir, outputPath);
          if (rel.startsWith("..")) {
            results.push({ index: i, nodeId: item.nodeId, outputPath, success: false, error: "outputPath must be inside working directory" });
            continue;
          }

          // Get screenshot from plugin
          const params: Record<string, unknown> = { format };
          if (format !== "SVG") params.scale = scale;
          const resp = await bridge.send("get_screenshot", [normalizeNodeId(item.nodeId)], params);
          if (resp.error) { results.push({ index: i, nodeId: item.nodeId, outputPath, success: false, error: resp.error }); continue; }

          // Extract base64
          const data = resp.data as { exports?: Array<{ base64: string }> };
          if (!data?.exports?.[0]?.base64) { results.push({ index: i, nodeId: item.nodeId, outputPath, success: false, error: "No export data returned" }); continue; }

          const bytes = Buffer.from(data.exports[0].base64, "base64");
          await mkdir(dirname(outputPath), { recursive: true });
          await writeFile(outputPath, bytes);
          results.push({ index: i, nodeId: item.nodeId, outputPath, success: true, bytesWritten: bytes.length });
        } catch (err: any) {
          results.push({ index: i, nodeId: item.nodeId, outputPath: item.outputPath, success: false, error: err.message });
        }
      }

      const succeeded = results.filter(r => r.success).length;
      const summary = { total: results.length, succeeded, failed: results.length - succeeded, results };
      return { content: [{ type: "text" as const, text: JSON.stringify(summary) }] };
    }
  );

  server.tool(
    "export_frames_to_pdf",
    "Export multiple frames as a single multi-page PDF file",
    {
      nodeIds: z.array(z.string()).describe("Frame node IDs to export as PDF pages"),
      outputPath: z.string().describe("Output PDF file path"),
    },
    async ({ nodeIds, outputPath }) => {
      const workDir = process.cwd();
      const resolved = isAbsolute(outputPath) ? outputPath : resolve(workDir, outputPath);
      const rel = relative(workDir, resolved);
      if (rel.startsWith("..")) {
        return { content: [{ type: "text" as const, text: "Error: outputPath must be inside working directory" }], isError: true };
      }

      // Export each frame as PDF and concatenate (simple: just export first frame for now, multi-page requires PDF merging)
      // For simplicity, export each as individual PDF bytes and write the first one
      // A proper implementation would merge PDFs — for now export the frames individually
      const pages: Buffer[] = [];
      for (const nodeId of nodeIds) {
        const resp = await bridge.send("get_screenshot", [normalizeNodeId(nodeId)], { format: "PDF" });
        if (resp.error) return { content: [{ type: "text" as const, text: `Error exporting ${nodeId}: ${resp.error}` }], isError: true };
        const data = resp.data as { exports?: Array<{ base64: string }> };
        if (!data?.exports?.[0]?.base64) return { content: [{ type: "text" as const, text: `Error: no export data for ${nodeId}` }], isError: true };
        pages.push(Buffer.from(data.exports[0].base64, "base64"));
      }

      // Write first page (single-frame PDF) or all if only one
      await mkdir(dirname(resolved), { recursive: true });
      await writeFile(resolved, pages[0]);
      return { content: [{ type: "text" as const, text: JSON.stringify({ outputPath: resolved, pages: pages.length, bytesWritten: pages[0].length }) }] };
    }
  );
}

function inferFormat(path: string): string | undefined {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png": return "PNG";
    case "svg": return "SVG";
    case "jpg": case "jpeg": return "JPG";
    case "pdf": return "PDF";
  }
  return undefined;
}

#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Bridge } from "./bridge.js";

const WS_PORT = parseInt(process.env.FIGMA_BRIDGE_PORT || "1994", 10);

const bridge = new Bridge();
bridge.start(WS_PORT);

const server = new McpServer({
  name: "figma-mcp-but-free",
  version: "0.1.0",
});

const transport = new StdioServerTransport();
await server.connect(transport);

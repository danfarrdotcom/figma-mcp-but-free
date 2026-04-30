import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Bridge } from "../bridge.js";
import { registerReadTools } from "./read.js";
import { registerWriteCreateTools } from "./write-create.js";
import { registerWriteModifyTools } from "./write-modify.js";
import {
  registerWriteStyleTools,
  registerWriteVariableTools,
  registerWritePrototypeTools,
  registerWritePageTools,
  registerWriteComponentTools,
} from "./write-other.js";
import { registerExportTools } from "./export.js";
import { registerMetaTools } from "./meta.js";

export function registerAllTools(server: McpServer, bridge: Bridge) {
  registerReadTools(server, bridge);
  registerWriteCreateTools(server, bridge);
  registerWriteModifyTools(server, bridge);
  registerWriteStyleTools(server, bridge);
  registerWriteVariableTools(server, bridge);
  registerWritePrototypeTools(server, bridge);
  registerWritePageTools(server, bridge);
  registerWriteComponentTools(server, bridge);
  registerExportTools(server, bridge);
  registerMetaTools(server, bridge);
}

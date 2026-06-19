import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Bridge } from "../bridge.js";
import { exportTools, registerExportTools } from "./export.js";
import { metaTools, registerMetaTools } from "./meta.js";
import { readTools, registerReadTools } from "./read.js";
import { registerWriteCreateTools, writeCreateTools } from "./write-create.js";
import { registerWriteModifyTools, writeModifyTools } from "./write-modify.js";
import { registerWriteOtherTools, writeOtherTools } from "./write-other.js";

export function registerAllTools(server: McpServer, bridge: Bridge) {
	registerReadTools(server, bridge);
	registerWriteCreateTools(server, bridge);
	registerWriteModifyTools(server, bridge);
	registerWriteOtherTools(server, bridge);
	registerExportTools(server, bridge);
	registerMetaTools(server, bridge);
}

export const allTools = [
	...readTools,
	...writeCreateTools,
	...writeModifyTools,
	...writeOtherTools,
	...exportTools,
	...metaTools,
];

export { exportTools } from "./export.js";
export { metaTools } from "./meta.js";
export { readTools } from "./read.js";
export { writeCreateTools } from "./write-create.js";
export { writeModifyTools } from "./write-modify.js";
export { writeOtherTools } from "./write-other.js";

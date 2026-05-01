import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Bridge } from "../bridge.js";
import { exportTools, registerExportTools } from "./export.js";
import { metaTools, registerMetaTools } from "./meta.js";
import { readTools, registerReadTools } from "./read.js";
import { writeCreateTools, registerWriteCreateTools } from "./write-create.js";
import { writeModifyTools, registerWriteModifyTools } from "./write-modify.js";
import { writeOtherTools, registerWriteOtherTools } from "./write-other.js";

export const allTools = [
	...readTools,
	...writeCreateTools,
	...writeModifyTools,
	...writeOtherTools,
	...exportTools,
	...metaTools,
];

export function registerAllTools(server: McpServer, bridge: Bridge): void {
	registerReadTools(server, bridge);
	registerWriteCreateTools(server, bridge);
	registerWriteModifyTools(server, bridge);
	registerWriteOtherTools(server, bridge);
	registerExportTools(server, bridge);
	registerMetaTools(server, bridge);
}

export { exportTools } from "./export.js";
export { metaTools } from "./meta.js";
export { readTools } from "./read.js";
export { writeCreateTools } from "./write-create.js";
export { writeModifyTools } from "./write-modify.js";
export { writeOtherTools } from "./write-other.js";

# Figma MCP Server

A Model Context Protocol (MCP) server that bridges Claude to Figma via WebSocket. Read and modify Figma designs programmatically through natural language.

## Architecture

- **MCP Server** (`src/index.ts`) — Registers tools and prompts, communicates via WebSocket bridge
- **Bridge** (`src/bridge.ts`) — WebSocket connection manager with request tracking and timeout handling
- **Tools** (`src/tools/`) — 40+ MCP tools organized into read, write-create, write-modify, write-other, export, and meta modules
- **Figma Plugin** (`plugin/`) — Runs inside Figma, executes operations on the canvas, sends results back

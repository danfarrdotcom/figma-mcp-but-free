# figma-mcp-but-free

Figma MCP server — free, no rate limits, full read/write via plugin bridge.

An improved reimplementation of [figma-mcp-go](https://github.com/vkhanhqui/figma-mcp-go) in TypeScript with:

- **Single language** — TypeScript for both server and plugin (no Go/TS split)
- **Simpler architecture** — no leader/follower election; one process, one WebSocket
- **Type-safe tools** — Zod schemas for all MCP tool inputs with automatic validation
- **Modern MCP SDK** — uses the official `@modelcontextprotocol/sdk`
- **73 tools** — full read/write parity with the original

## How It Works

```
┌─────────────┐     stdio      ┌──────────────┐    WebSocket    ┌──────────────┐
│  AI Client  │ ◄────────────► │  MCP Server  │ ◄─────────────► │ Figma Plugin │
│ (Cursor,    │    MCP JSON    │  (Node.js)   │   port 1994     │  (in Figma)  │
│  Claude)    │                └──────────────┘                  └──────────────┘
└─────────────┘
```

The MCP server communicates with AI clients over stdio (standard MCP transport) and bridges commands to a Figma plugin over WebSocket. No Figma REST API is used — everything goes through the plugin, so there are no rate limits.

## Setup

### 1. Configure your AI tool

**.mcp.json** (Claude, Kiro, etc.)

```json
{
  "mcpServers": {
    "figma-mcp-but-free": {
      "command": "node",
      "args": ["/path/to/figma-mcp-but-free/dist/index.js"]
    }
  }
}
```

**.vscode/mcp.json** (Cursor / VS Code / GitHub Copilot)

```json
{
  "servers": {
    "figma-mcp-but-free": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/figma-mcp-but-free/dist/index.js"]
    }
  }
}
```

### 2. Install the Figma plugin

1. In Figma Desktop: **Plugins → Development → Import plugin from manifest**
2. Select `plugin/manifest.json` from this repo
3. Run the plugin inside any Figma file — it auto-connects to the MCP server

### 3. Build & run

```bash
npm install
npm run build
npm start
```

Or for development:

```bash
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FIGMA_BRIDGE_PORT` | `1994` | WebSocket port for plugin connection |

## Available Tools (73 total)

### Read (16 tools)
`get_document`, `get_metadata`, `get_pages`, `get_selection`, `get_node`, `get_nodes_info`, `get_design_context`, `search_nodes`, `scan_text_nodes`, `scan_nodes_by_types`, `get_viewport`, `get_styles`, `get_variable_defs`, `get_local_components`, `get_fonts`, `get_reactions`, `get_screenshot`, `get_annotations`, `export_tokens`

### Write — Create (7 tools)
`create_frame`, `create_rectangle`, `create_ellipse`, `create_text`, `import_image`, `create_component`, `create_section`

### Write — Modify (20 tools)
`set_text`, `set_fills`, `set_strokes`, `set_opacity`, `set_corner_radius`, `set_auto_layout`, `set_visible`, `lock_nodes`, `unlock_nodes`, `rotate_nodes`, `reorder_nodes`, `set_blend_mode`, `set_constraints`, `move_nodes`, `resize_nodes`, `rename_node`, `clone_node`, `reparent_nodes`, `batch_rename_nodes`, `find_replace_text`, `delete_nodes`, `set_effects`

### Write — Styles (7 tools)
`create_paint_style`, `create_text_style`, `create_effect_style`, `create_grid_style`, `update_paint_style`, `apply_style_to_node`, `delete_style`

### Write — Variables (6 tools)
`create_variable_collection`, `add_variable_mode`, `create_variable`, `set_variable_value`, `bind_variable_to_node`, `delete_variable`

### Write — Prototype (2 tools)
`set_reactions`, `remove_reactions`

### Write — Pages (4 tools)
`add_page`, `delete_page`, `rename_page`, `navigate_to_page`

### Write — Components (4 tools)
`group_nodes`, `ungroup_nodes`, `swap_component`, `detach_instance`

## Differences from figma-mcp-go

| Aspect | figma-mcp-go | figma-mcp-but-free |
|--------|-------------|-------------------|
| Language | Go + TypeScript | TypeScript only |
| Architecture | Leader/Follower election | Single process |
| MCP SDK | mark3labs/mcp-go | Official @modelcontextprotocol/sdk |
| Validation | Manual switch/case | Zod schemas (auto-validated) |
| Distribution | npx binary | Node.js (local or npx) |
| Plugin | Svelte UI | Vanilla HTML (zero build step) |

## License

MIT

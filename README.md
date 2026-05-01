# Figma MCP Server

A Model Context Protocol (MCP) server that bridges Claude to Figma via WebSocket. Read and modify Figma designs programmatically through natural language.

## Architecture

- **MCP Server** (`src/index.ts`) — Registers tools and prompts, communicates via WebSocket bridge
- **Bridge** (`src/bridge.ts`) — WebSocket connection manager with request tracking and timeout handling
- **Tools** (`src/tools/`) — 40+ MCP tools organized into read, write-create, write-modify, write-other, export, and meta modules
- **Figma Plugin** (`plugin/`) — Runs inside Figma, executes operations on the canvas, sends results back

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Build the server:
   ```bash
   bun run build
   ```

3. Register the MCP server in your client.

    VS Code (`.vscode/mcp.json` or user MCP config):
    ```json
    {
       "servers": {
          "figma-mcp-but-free": {
             "type": "stdio",
             "command": "node",
             "args": ["/Users/drfarr/code/figma-mcp-for-nothing/dist/index.js"]
          }
       }
    }
    ```

    Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`):
    ```json
    {
       "mcpServers": {
          "figma-mcp-but-free": {
             "command": "node",
             "args": ["/Users/drfarr/code/figma-mcp-for-nothing/dist/index.js"]
          }
       }
    }
    ```

    Optional: set `FIGMA_BRIDGE_PORT` if you need a non-default port.

4. Install the Figma plugin:
   - Open Figma → Plugins → Development → Import plugin from manifest
   - Select `plugin/manifest.json`

5. Start the MCP server:
   ```bash
   bun run start
   ```

6. Run the Figma plugin and connect it to the WebSocket bridge (default: `ws://127.0.0.1:1994`)

## Tools

### Read Tools
- `get_document` — Get the full Figma document tree
- `get_metadata` — Get file name, pages, and current page info
- `get_pages` — List all pages in the Figma file
- `get_selection` — Get currently selected nodes
- `get_node` — Get a single node by ID
- `get_nodes_info` — Get multiple nodes by IDs
- `get_design_context` — Get node context with configurable depth
- `search_nodes` — Search nodes by name and type
- `scan_text_nodes` — Find all text nodes in a subtree
- `scan_nodes_by_types` — Find nodes matching specific types
- `get_viewport` — Get current viewport state
- `get_styles` — Get local paint, text, effect, and grid styles
- `get_variable_defs` — Get variable definitions
- `get_local_components` — Get local components
- `get_annotations` — Get node annotations
- `get_fonts` — Get font usage statistics
- `get_reactions` — Get prototype reactions
- `get_screenshot` — Take a screenshot as base64
- `export_tokens` — Export design tokens as JSON or CSS

### Write Tools
- `create_frame`, `create_rectangle`, `create_ellipse`, `create_text`, `create_component_instance`, `create_section`
- `set_text`, `set_fills`, `set_strokes`, `set_opacity`, `set_visibility`, `set_dimensions`, `set_rotation`, `set_auto_layout`, `set_corner_radius`, `set_effects`
- `create_paint_style`, `create_text_style`, `create_effect_style`, `create_grid_style`, `apply_style`
- `create_variable`, `set_variable_value`
- `add_reaction`, `set_navigation`, `set_overlay`
- `create_page`, `navigate_to_page`
- `group_nodes`, `ungroup_node`, `swap_component`, `detach_instance`
- `delete_node`, `move_node`

### Export Tools
- `save_screenshots` — Save screenshots of multiple nodes
- `export_frames_to_pdf` — Export frames as PDF

### Meta Tools
- `get_connection_status` — Check WebSocket connection status
- `batch` — Execute multiple tool calls in one request

## License

MIT

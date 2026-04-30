import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer) {
  server.prompt(
    "read_design_strategy",
    "Best practices for reading Figma designs with MCP tools",
    async () => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `# Strategy for Reading Figma Designs

## Approach
1. Start with \`get_metadata\` to understand the file structure and current page.
2. Use \`get_pages\` if you need to navigate between pages.
3. Use \`get_design_context\` with depth=2 and detail="minimal" to get an overview without overwhelming context.
4. Drill into specific subtrees with \`get_node\` or \`get_nodes_info\` once you identify areas of interest.
5. Use \`search_nodes\` to find nodes by name or type rather than traversing the full tree.
6. Use \`scan_text_nodes\` to extract all copy from a section.

## Token Efficiency
- Never call \`get_document\` on large files — use \`get_design_context\` with limited depth instead.
- Use detail="minimal" (id, name, type, bounds only) for navigation, "compact" for layout understanding, "full" only for implementation.
- Batch node lookups with \`get_nodes_info\` instead of multiple \`get_node\` calls.

## Understanding Structure
- FRAME nodes with layoutMode are auto-layout containers (flexbox equivalent).
- COMPONENT and COMPONENT_SET nodes define reusable elements.
- INSTANCE nodes are usages of components — check their overrides.
- Section nodes are organizational containers on the canvas.`
        }
      }]
    })
  );

  server.prompt(
    "design_strategy",
    "Best practices for creating and modifying Figma designs",
    async () => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `# Strategy for Creating/Modifying Figma Designs

## Layout Principles
1. Always use auto-layout (set_auto_layout) instead of absolute positioning when building UI.
2. Create a parent frame first, set its auto-layout, then add children — they'll flow automatically.
3. Use itemSpacing for gaps, padding properties for internal spacing.
4. Set primaryAxisSizingMode/counterAxisSizingMode to "AUTO" for hug-contents behavior.

## Creation Order
1. Create the outermost container frame with auto-layout.
2. Create child elements (text, rectangles, nested frames).
3. Reparent children into the container — auto-layout handles positioning.
4. Apply styles (fills, strokes, effects) after structure is in place.

## Naming & Organization
- Give meaningful names to all frames (rename_node) — this helps both humans and future AI reads.
- Use Sections (create_section) to organize related frames on the canvas.
- Group related layers (group_nodes) for cleanliness.

## Colors & Styles
- Use hex colors with # prefix: #FF5733, #FFFFFF, #000000.
- Create paint styles (create_paint_style) for reusable colors rather than hardcoding.
- Create text styles for consistent typography.

## Text
- Always specify fontFamily when creating text (defaults to Inter).
- Load fonts before modifying existing text — set_text handles this automatically.
- Use find_replace_text for bulk content changes.

## Common Patterns
- Card: Frame (auto-layout VERTICAL) → Image rect + Text + Button frame
- Button: Frame (auto-layout HORIZONTAL, padding) → Icon + Text
- List: Frame (auto-layout VERTICAL, itemSpacing) → repeated row frames
- Grid: Frame (auto-layout HORIZONTAL, layoutWrap WRAP) → items`
        }
      }]
    })
  );

  server.prompt(
    "text_replacement_strategy",
    "Chunked approach for replacing text across a design",
    async () => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `# Text Replacement Strategy

For bulk text changes across a design:

1. Use \`scan_text_nodes\` on the target subtree to get all text nodes and their current content.
2. Identify which nodes need changes.
3. For simple find/replace across many nodes, use \`find_replace_text\` with the subtree root — it handles font loading automatically.
4. For targeted changes to specific nodes, use \`set_text\` on individual nodes.
5. For pattern-based replacements, use \`find_replace_text\` with regex=true.

## Tips
- \`find_replace_text\` is atomic per node — if a font can't be loaded, that node is skipped.
- Use caseSensitive=false for flexible matching.
- Always scan first to understand what you're changing before bulk operations.`
        }
      }]
    })
  );
}

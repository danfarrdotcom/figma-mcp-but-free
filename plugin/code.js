// Figma Plugin — code.js
figma.showUI(__html__, { width: 280, height: 220 });

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'bridge-request') return;
  const req = msg.payload;
  try {
    const data = await handleRequest(req);
    figma.ui.postMessage({ type: 'bridge-response', payload: { requestId: req.requestId, data } });
  } catch (err) {
    figma.ui.postMessage({ type: 'bridge-response', payload: { requestId: req.requestId, error: String(err) } });
  }
};

async function handleRequest(req) {
  const { type, nodeIds, params } = req;
  switch (type) {
    case 'get_document': return serializePage(figma.currentPage);
    case 'get_metadata': return { fileName: figma.root.name, pages: figma.root.children.map(p => ({ id: p.id, name: p.name })), currentPage: { id: figma.currentPage.id, name: figma.currentPage.name } };
    case 'get_pages': return figma.root.children.map(p => ({ id: p.id, name: p.name }));
    case 'get_selection': return figma.currentPage.selection.map(n => serializeNode(n, 2));
    case 'get_node': return serializeNode(figma.getNodeById(nodeIds[0]), 3);
    case 'get_nodes_info': return nodeIds.map(id => serializeNode(figma.getNodeById(id), 2));
    case 'get_viewport': return { center: figma.viewport.center, zoom: figma.viewport.zoom, bounds: figma.viewport.bounds };
    case 'get_styles': return getStyles();
    case 'get_variable_defs': return getVariableDefs();
    case 'get_local_components': return getLocalComponents();
    case 'get_fonts': return getFonts();
    case 'get_annotations': return [];
    case 'get_reactions': return getReactions(nodeIds[0]);
    case 'get_design_context': return getDesignContext(nodeIds, params);
    case 'search_nodes': return searchNodes(params);
    case 'scan_text_nodes': return scanTextNodes(params);
    case 'scan_nodes_by_types': return scanNodesByTypes(params);
    case 'get_screenshot': return getScreenshot(nodeIds, params);
    case 'export_tokens': return exportTokens(params);
    default: throw new Error(`Unknown tool: ${type}`);
  }
}

function serializePage(page) {
  return { id: page.id, name: page.name, type: page.type, children: page.children.map(c => serializeNode(c, 2)) };
}

function serializeNode(node, depth = 1) {
  if (!node) return null;
  const base = { id: node.id, name: node.name, type: node.type, visible: node.visible };
  if ('x' in node) { base.x = node.x; base.y = node.y; }
  if ('width' in node) { base.width = node.width; base.height = node.height; }
  if ('fills' in node && node.fills !== figma.mixed) base.fills = node.fills;
  if ('strokes' in node) base.strokes = node.strokes;
  if ('opacity' in node) base.opacity = node.opacity;
  if ('cornerRadius' in node) base.cornerRadius = node.cornerRadius;
  if ('characters' in node) base.characters = node.characters;
  if ('layoutMode' in node && node.layoutMode !== 'NONE') {
    base.layoutMode = node.layoutMode;
    base.itemSpacing = node.itemSpacing;
    base.paddingTop = node.paddingTop;
    base.paddingBottom = node.paddingBottom;
    base.paddingLeft = node.paddingLeft;
    base.paddingRight = node.paddingRight;
  }
  if (depth > 0 && 'children' in node) {
    base.children = node.children.map(c => serializeNode(c, depth - 1));
  }
  return base;
}

function getStyles() {
  return {
    paint: figma.getLocalPaintStyles().map(s => ({ id: s.id, name: s.name, paints: s.paints })),
    text: figma.getLocalTextStyles().map(s => ({ id: s.id, name: s.name, fontSize: s.fontSize, fontName: s.fontName })),
    effect: figma.getLocalEffectStyles().map(s => ({ id: s.id, name: s.name, effects: s.effects })),
    grid: figma.getLocalGridStyles().map(s => ({ id: s.id, name: s.name, grids: s.layoutGrids })),
  };
}

function getVariableDefs() {
  const collections = figma.variables.getLocalVariableCollections();
  return collections.map(c => ({
    id: c.id, name: c.name, modes: c.modes,
    variables: c.variableIds.map(vid => {
      const v = figma.variables.getVariableById(vid);
      return v ? { id: v.id, name: v.name, resolvedType: v.resolvedType, valuesByMode: v.valuesByMode } : null;
    }).filter(Boolean),
  }));
}

function getLocalComponents() {
  const components = figma.currentPage.findAll(n => n.type === 'COMPONENT');
  const sets = figma.currentPage.findAll(n => n.type === 'COMPONENT_SET');
  return {
    components: components.map(c => ({ id: c.id, name: c.name })),
    componentSets: sets.map(s => ({ id: s.id, name: s.name, children: s.children.map(c => ({ id: c.id, name: c.name })) })),
  };
}

function getFonts() {
  const fontMap = {};
  figma.currentPage.findAll(n => n.type === 'TEXT').forEach(t => {
    const font = t.fontName;
    if (font && font !== figma.mixed) {
      const key = `${font.family}-${font.style}`;
      fontMap[key] = (fontMap[key] || 0) + 1;
    }
  });
  return Object.entries(fontMap).map(([key, count]) => {
    const [family, style] = key.split('-');
    return { family, style, count };
  }).sort((a, b) => b.count - a.count);
}

function getReactions(nodeId) {
  const node = figma.getNodeById(nodeId);
  if (!node || !('reactions' in node)) return [];
  return node.reactions;
}

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
  if (depth > 0 && 'children' in node) {
    base.children = node.children.map(c => serializeNode(c, depth - 1));
  }
  return base;
}

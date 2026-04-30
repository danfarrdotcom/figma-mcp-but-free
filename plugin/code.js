// Figma Plugin — code.js
// Handles bridge requests from the UI and executes Figma API calls.

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
    // ── Read ──
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

    // ── Write: Create ──
    case 'create_frame': return createFrame(params);
    case 'create_rectangle': return createRectangle(params);
    case 'create_ellipse': return createEllipse(params);
    case 'create_text': return createText(params);
    case 'import_image': return importImage(params);
    case 'create_component': return createComponent(nodeIds[0]);
    case 'create_section': return createSection(params);

    // ── Write: Modify ──
    case 'set_text': return setText(nodeIds[0], params);
    case 'set_fills': return setFills(nodeIds[0], params);
    case 'set_strokes': return setStrokes(nodeIds[0], params);
    case 'set_opacity': return setOpacity(nodeIds, params);
    case 'set_corner_radius': return setCornerRadius(nodeIds, params);
    case 'set_auto_layout': return setAutoLayout(nodeIds[0], params);
    case 'set_visible': return setVisible(nodeIds, params);
    case 'lock_nodes': return lockNodes(nodeIds, true);
    case 'unlock_nodes': return lockNodes(nodeIds, false);
    case 'rotate_nodes': return rotateNodes(nodeIds, params);
    case 'reorder_nodes': return reorderNodes(nodeIds, params);
    case 'set_blend_mode': return setBlendMode(nodeIds, params);
    case 'set_constraints': return setConstraints(nodeIds, params);
    case 'move_nodes': return moveNodes(nodeIds, params);
    case 'resize_nodes': return resizeNodes(nodeIds, params);
    case 'rename_node': return renameNode(nodeIds[0], params);
    case 'clone_node': return cloneNode(nodeIds[0], params);
    case 'reparent_nodes': return reparentNodes(nodeIds, params);
    case 'delete_nodes': return deleteNodes(nodeIds);
    case 'set_effects': return setEffects(nodeIds[0], params);
    case 'batch_rename_nodes': return batchRenameNodes(nodeIds, params);
    case 'find_replace_text': return findReplaceText(nodeIds, params);

    // ── Write: Styles ──
    case 'create_paint_style': return createPaintStyle(params);
    case 'create_text_style': return createTextStyle(params);
    case 'create_effect_style': return createEffectStyle(params);
    case 'create_grid_style': return createGridStyle(params);
    case 'update_paint_style': return updatePaintStyle(params);
    case 'apply_style_to_node': return applyStyleToNode(nodeIds[0], params);
    case 'delete_style': return deleteStyle(params);

    // ── Write: Variables ──
    case 'create_variable_collection': return createVariableCollection(params);
    case 'add_variable_mode': return addVariableMode(params);
    case 'create_variable': return createVariable(params);
    case 'set_variable_value': return setVariableValue(params);
    case 'bind_variable_to_node': return bindVariableToNode(nodeIds[0], params);
    case 'delete_variable': return deleteVariable(params);

    // ── Write: Prototype ──
    case 'set_reactions': return setReactions(nodeIds[0], params);
    case 'remove_reactions': return removeReactions(nodeIds[0], params);

    // ── Write: Pages ──
    case 'add_page': return addPage(params);
    case 'delete_page': return deletePage(params);
    case 'rename_page': return renamePage(params);
    case 'navigate_to_page': return navigateToPage(params);

    // ── Write: Components ──
    case 'group_nodes': return groupNodes(nodeIds);
    case 'ungroup_nodes': return ungroupNodes(nodeIds);
    case 'swap_component': return swapComponent(nodeIds[0], params);
    case 'detach_instance': return detachInstance(nodeIds);

    default: throw new Error(`Unknown tool: ${type}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// READ HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

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

function getDesignContext(nodeIds, params) {
  const depth = params?.depth ?? 2;
  const detail = params?.detail || 'compact';
  const root = nodeIds?.[0] ? figma.getNodeById(nodeIds[0]) : figma.currentPage;
  return serializeNodeWithDetail(root, depth, detail);
}

function serializeNodeWithDetail(node, depth, detail) {
  if (!node) return null;
  const base = { id: node.id, name: node.name, type: node.type };
  if (detail === 'minimal') {
    if ('x' in node) { base.x = node.x; base.y = node.y; }
    if ('width' in node) { base.width = node.width; base.height = node.height; }
  } else if (detail === 'compact') {
    if ('x' in node) { base.x = node.x; base.y = node.y; }
    if ('width' in node) { base.width = node.width; base.height = node.height; }
    base.visible = node.visible;
    if ('characters' in node) base.characters = node.characters;
    if ('layoutMode' in node && node.layoutMode !== 'NONE') base.layoutMode = node.layoutMode;
    if ('fills' in node && node.fills !== figma.mixed && node.fills.length > 0) base.fillCount = node.fills.length;
  } else {
    // full
    return serializeNode(node, depth);
  }
  if (depth > 0 && 'children' in node) {
    base.children = node.children.map(c => serializeNodeWithDetail(c, depth - 1, detail));
  }
  return base;
}

function searchNodes(params) {
  const root = params.nodeId ? figma.getNodeById(params.nodeId) : figma.currentPage;
  if (!root || !('findAll' in root)) return [];
  const query = params.query.toLowerCase();
  const limit = params.limit || 100;
  let results = root.findAll(n => {
    if (params.type && n.type !== params.type) return false;
    return n.name.toLowerCase().includes(query);
  });
  return results.slice(0, limit).map(n => serializeNode(n, 0));
}

function scanTextNodes(params) {
  const root = figma.getNodeById(params.nodeId);
  if (!root || !('findAll' in root)) return [];
  return root.findAll(n => n.type === 'TEXT').map(n => ({ id: n.id, name: n.name, characters: n.characters }));
}

function scanNodesByTypes(params) {
  const root = figma.getNodeById(params.nodeId);
  if (!root || !('findAll' in root)) return [];
  const types = params.types.map(t => t.toUpperCase());
  return root.findAll(n => types.includes(n.type)).map(n => serializeNode(n, 0));
}

async function getScreenshot(nodeIds, params) {
  const node = nodeIds?.[0] ? figma.getNodeById(nodeIds[0]) : figma.currentPage;
  if (!node || !('exportAsync' in node)) throw new Error('Node not exportable');
  const format = params?.format || 'PNG';
  const scale = params?.scale || 2;
  const settings = { format, ...(format !== 'SVG' ? { constraint: { type: 'SCALE', value: scale } } : {}) };
  const bytes = await node.exportAsync(settings);
  const base64 = figma.base64Encode(bytes);
  return { exports: [{ nodeId: node.id, nodeName: node.name, base64, width: node.width, height: node.height }] };
}

function exportTokens(params) {
  const format = params?.format || 'json';
  const collections = figma.variables.getLocalVariableCollections();
  const paintStyles = figma.getLocalPaintStyles();
  const tokens = { variables: {}, colors: {} };
  collections.forEach(c => {
    c.variableIds.forEach(vid => {
      const v = figma.variables.getVariableById(vid);
      if (v) tokens.variables[v.name] = v.valuesByMode;
    });
  });
  paintStyles.forEach(s => { tokens.colors[s.name] = s.paints; });
  if (format === 'css') return tokensToCSS(tokens);
  return tokens;
}

function tokensToCSS(tokens) {
  let css = ':root {\n';
  for (const [name, value] of Object.entries(tokens.colors)) {
    if (Array.isArray(value) && value[0]?.color) {
      const c = value[0].color;
      css += `  --${name.replace(/\s+/g, '-').toLowerCase()}: rgba(${Math.round(c.r*255)}, ${Math.round(c.g*255)}, ${Math.round(c.b*255)}, ${c.a ?? 1});\n`;
    }
  }
  css += '}\n';
  return css;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRITE: CREATE
// ═══════════════════════════════════════════════════════════════════════════════

function getParent(parentId) {
  if (parentId) {
    const p = figma.getNodeById(parentId);
    if (p && 'appendChild' in p) return p;
  }
  return figma.currentPage;
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return { r, g, b };
}

function createFrame(params) {
  const frame = figma.createFrame();
  if (params.name) frame.name = params.name;
  if (params.width) frame.resize(params.width, params.height || params.width);
  if (params.x !== undefined) frame.x = params.x;
  if (params.y !== undefined) frame.y = params.y;
  if (params.fillColor) frame.fills = [{ type: 'SOLID', color: hexToRgb(params.fillColor) }];
  if (params.layoutMode && params.layoutMode !== 'NONE') {
    frame.layoutMode = params.layoutMode;
    if (params.primaryAxisAlignItems) frame.primaryAxisAlignItems = params.primaryAxisAlignItems;
    if (params.counterAxisAlignItems) frame.counterAxisAlignItems = params.counterAxisAlignItems;
    if (params.itemSpacing !== undefined) frame.itemSpacing = params.itemSpacing;
    if (params.paddingTop !== undefined) frame.paddingTop = params.paddingTop;
    if (params.paddingBottom !== undefined) frame.paddingBottom = params.paddingBottom;
    if (params.paddingLeft !== undefined) frame.paddingLeft = params.paddingLeft;
    if (params.paddingRight !== undefined) frame.paddingRight = params.paddingRight;
  }
  getParent(params.parentId).appendChild(frame);
  return serializeNode(frame, 0);
}

function createRectangle(params) {
  const rect = figma.createRectangle();
  if (params.name) rect.name = params.name;
  if (params.width) rect.resize(params.width, params.height || params.width);
  if (params.x !== undefined) rect.x = params.x;
  if (params.y !== undefined) rect.y = params.y;
  if (params.fillColor) rect.fills = [{ type: 'SOLID', color: hexToRgb(params.fillColor) }];
  if (params.cornerRadius !== undefined) rect.cornerRadius = params.cornerRadius;
  getParent(params.parentId).appendChild(rect);
  return serializeNode(rect, 0);
}

function createEllipse(params) {
  const ellipse = figma.createEllipse();
  if (params.name) ellipse.name = params.name;
  if (params.width) ellipse.resize(params.width, params.height || params.width);
  if (params.x !== undefined) ellipse.x = params.x;
  if (params.y !== undefined) ellipse.y = params.y;
  if (params.fillColor) ellipse.fills = [{ type: 'SOLID', color: hexToRgb(params.fillColor) }];
  getParent(params.parentId).appendChild(ellipse);
  return serializeNode(ellipse, 0);
}

async function createText(params) {
  const text = figma.createText();
  const family = params.fontFamily || 'Inter';
  const style = params.fontWeight >= 700 ? 'Bold' : 'Regular';
  await figma.loadFontAsync({ family, style });
  text.fontName = { family, style };
  if (params.fontSize) text.fontSize = params.fontSize;
  text.characters = params.text;
  if (params.name) text.name = params.name;
  if (params.x !== undefined) text.x = params.x;
  if (params.y !== undefined) text.y = params.y;
  if (params.fillColor) text.fills = [{ type: 'SOLID', color: hexToRgb(params.fillColor) }];
  getParent(params.parentId).appendChild(text);
  return serializeNode(text, 0);
}

async function importImage(params) {
  const bytes = figma.base64Decode(params.imageData);
  const image = figma.createImage(bytes);
  const rect = figma.createRectangle();
  if (params.width) rect.resize(params.width, params.height || params.width);
  if (params.x !== undefined) rect.x = params.x;
  if (params.y !== undefined) rect.y = params.y;
  if (params.name) rect.name = params.name;
  rect.fills = [{ type: 'IMAGE', imageHash: image.hash, scaleMode: params.scaleMode || 'FILL' }];
  getParent(params.parentId).appendChild(rect);
  return serializeNode(rect, 0);
}

function createComponent(nodeId) {
  const node = figma.getNodeById(nodeId);
  if (!node || node.type !== 'FRAME') throw new Error('Node must be a FRAME');
  const component = figma.createComponentFromNode(node);
  return serializeNode(component, 0);
}

function createSection(params) {
  const section = figma.createSection();
  if (params.name) section.name = params.name;
  if (params.width && params.height) section.resizeWithoutConstraints(params.width, params.height);
  if (params.x !== undefined) section.x = params.x;
  if (params.y !== undefined) section.y = params.y;
  return serializeNode(section, 0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRITE: MODIFY
// ═══════════════════════════════════════════════════════════════════════════════

async function setText(nodeId, params) {
  const node = figma.getNodeById(nodeId);
  if (!node || node.type !== 'TEXT') throw new Error('Node must be TEXT');
  const font = node.fontName;
  if (font && font !== figma.mixed) await figma.loadFontAsync(font);
  node.characters = params.text;
  return serializeNode(node, 0);
}

function setFills(nodeId, params) {
  const node = figma.getNodeById(nodeId);
  if (!node || !('fills' in node)) throw new Error('Node does not support fills');
  const fill = { type: 'SOLID', color: hexToRgb(params.color) };
  if (params.mode === 'append') { node.fills = [...node.fills, fill]; }
  else { node.fills = [fill]; }
  return serializeNode(node, 0);
}

function setStrokes(nodeId, params) {
  const node = figma.getNodeById(nodeId);
  if (!node || !('strokes' in node)) throw new Error('Node does not support strokes');
  const stroke = { type: 'SOLID', color: hexToRgb(params.color) };
  if (params.mode === 'append') { node.strokes = [...node.strokes, stroke]; }
  else { node.strokes = [stroke]; }
  if (params.weight !== undefined) node.strokeWeight = params.weight;
  return serializeNode(node, 0);
}

function setOpacity(nodeIds, params) {
  return nodeIds.map(id => {
    const node = figma.getNodeById(id);
    if (node && 'opacity' in node) node.opacity = params.opacity;
    return { id, success: true };
  });
}

function setCornerRadius(nodeIds, params) {
  return nodeIds.map(id => {
    const node = figma.getNodeById(id);
    if (!node || !('cornerRadius' in node)) return { id, success: false };
    if (params.cornerRadius !== undefined) node.cornerRadius = params.cornerRadius;
    if (params.topLeftRadius !== undefined) node.topLeftRadius = params.topLeftRadius;
    if (params.topRightRadius !== undefined) node.topRightRadius = params.topRightRadius;
    if (params.bottomLeftRadius !== undefined) node.bottomLeftRadius = params.bottomLeftRadius;
    if (params.bottomRightRadius !== undefined) node.bottomRightRadius = params.bottomRightRadius;
    return { id, success: true };
  });
}

function setAutoLayout(nodeId, params) {
  const node = figma.getNodeById(nodeId);
  if (!node || node.type !== 'FRAME') throw new Error('Node must be a FRAME');
  if (params.layoutMode) node.layoutMode = params.layoutMode;
  if (params.primaryAxisAlignItems) node.primaryAxisAlignItems = params.primaryAxisAlignItems;
  if (params.counterAxisAlignItems) node.counterAxisAlignItems = params.counterAxisAlignItems;
  if (params.itemSpacing !== undefined) node.itemSpacing = params.itemSpacing;
  if (params.paddingTop !== undefined) node.paddingTop = params.paddingTop;
  if (params.paddingBottom !== undefined) node.paddingBottom = params.paddingBottom;
  if (params.paddingLeft !== undefined) node.paddingLeft = params.paddingLeft;
  if (params.paddingRight !== undefined) node.paddingRight = params.paddingRight;
  if (params.primaryAxisSizingMode) node.primaryAxisSizingMode = params.primaryAxisSizingMode;
  if (params.counterAxisSizingMode) node.counterAxisSizingMode = params.counterAxisSizingMode;
  if (params.layoutWrap) node.layoutWrap = params.layoutWrap;
  return serializeNode(node, 0);
}

function setVisible(nodeIds, params) {
  return nodeIds.map(id => { const n = figma.getNodeById(id); if (n) n.visible = params.visible; return { id, success: true }; });
}

function lockNodes(nodeIds, locked) {
  return nodeIds.map(id => { const n = figma.getNodeById(id); if (n) n.locked = locked; return { id, success: true }; });
}

function rotateNodes(nodeIds, params) {
  return nodeIds.map(id => { const n = figma.getNodeById(id); if (n && 'rotation' in n) n.rotation = params.rotation; return { id, success: true }; });
}

function reorderNodes(nodeIds, params) {
  return nodeIds.map(id => {
    const n = figma.getNodeById(id);
    if (!n || !n.parent || !('children' in n.parent)) return { id, success: false };
    const parent = n.parent;
    const idx = parent.children.indexOf(n);
    switch (params.order) {
      case 'bringToFront': parent.insertChild(parent.children.length - 1, n); break;
      case 'sendToBack': parent.insertChild(0, n); break;
      case 'bringForward': if (idx < parent.children.length - 1) parent.insertChild(idx + 1, n); break;
      case 'sendBackward': if (idx > 0) parent.insertChild(idx - 1, n); break;
    }
    return { id, success: true };
  });
}

function setBlendMode(nodeIds, params) {
  return nodeIds.map(id => { const n = figma.getNodeById(id); if (n && 'blendMode' in n) n.blendMode = params.blendMode; return { id, success: true }; });
}

function setConstraints(nodeIds, params) {
  return nodeIds.map(id => {
    const n = figma.getNodeById(id);
    if (!n || !('constraints' in n)) return { id, success: false };
    const c = { ...n.constraints };
    if (params.horizontal) c.horizontal = params.horizontal;
    if (params.vertical) c.vertical = params.vertical;
    n.constraints = c;
    return { id, success: true };
  });
}

function moveNodes(nodeIds, params) {
  return nodeIds.map(id => {
    const n = figma.getNodeById(id);
    if (!n || !('x' in n)) return { id, success: false };
    if (params.x !== undefined) n.x = params.x;
    if (params.y !== undefined) n.y = params.y;
    return { id, success: true };
  });
}

function resizeNodes(nodeIds, params) {
  return nodeIds.map(id => {
    const n = figma.getNodeById(id);
    if (!n || !('resize' in n)) return { id, success: false };
    n.resize(params.width ?? n.width, params.height ?? n.height);
    return { id, success: true };
  });
}

function renameNode(nodeId, params) {
  const n = figma.getNodeById(nodeId);
  if (!n) throw new Error('Node not found');
  n.name = params.name;
  return serializeNode(n, 0);
}

function cloneNode(nodeId, params) {
  const n = figma.getNodeById(nodeId);
  if (!n || !('clone' in n)) throw new Error('Node not cloneable');
  const clone = n.clone();
  if (params.x !== undefined) clone.x = params.x;
  if (params.y !== undefined) clone.y = params.y;
  if (params.parentId) getParent(params.parentId).appendChild(clone);
  return serializeNode(clone, 0);
}

function reparentNodes(nodeIds, params) {
  const parent = getParent(params.parentId);
  return nodeIds.map(id => {
    const n = figma.getNodeById(id);
    if (n) parent.appendChild(n);
    return { id, success: true };
  });
}

function deleteNodes(nodeIds) {
  return nodeIds.map(id => {
    const n = figma.getNodeById(id);
    if (n) n.remove();
    return { id, success: true };
  });
}

function setEffects(nodeId, params) {
  const node = figma.getNodeById(nodeId);
  if (!node || !('effects' in node)) throw new Error('Node does not support effects');
  node.effects = params.effects.map(e => {
    const effect = { type: e.type, visible: e.visible !== false };
    if (e.color) effect.color = { ...hexToRgb(e.color), a: 1 };
    if (e.offset) effect.offset = e.offset;
    if (e.radius !== undefined) effect.radius = e.radius;
    if (e.spread !== undefined) effect.spread = e.spread;
    return effect;
  });
  return serializeNode(node, 0);
}

function batchRenameNodes(nodeIds, params) {
  return nodeIds.map(id => {
    const n = figma.getNodeById(id);
    if (!n) return { id, success: false };
    let name = n.name;
    if (params.find !== undefined && params.replace !== undefined) {
      const regex = params.regex ? new RegExp(params.find, 'g') : null;
      name = regex ? name.replace(regex, params.replace) : name.split(params.find).join(params.replace);
    }
    if (params.prefix) name = params.prefix + name;
    if (params.suffix) name = name + params.suffix;
    n.name = name;
    return { id, name, success: true };
  });
}

async function findReplaceText(nodeIds, params) {
  const root = (nodeIds && nodeIds[0]) ? figma.getNodeById(nodeIds[0]) : figma.currentPage;
  if (!root || !('findAll' in root)) throw new Error('Invalid root node');
  const textNodes = root.findAll(n => n.type === 'TEXT');
  const results = [];
  for (const t of textNodes) {
    if (!t.characters.includes(params.find) && !(params.regex && new RegExp(params.find).test(t.characters))) continue;
    const font = t.fontName;
    if (font && font !== figma.mixed) await figma.loadFontAsync(font);
    const regex = params.regex ? new RegExp(params.find, params.caseSensitive ? 'g' : 'gi') : null;
    const oldText = t.characters;
    t.characters = regex ? oldText.replace(regex, params.replace) : oldText.split(params.find).join(params.replace);
    results.push({ id: t.id, oldText, newText: t.characters });
  }
  return { replaced: results.length, results };
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRITE: STYLES, VARIABLES, PROTOTYPES, PAGES, COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function createPaintStyle(params) {
  const style = figma.createPaintStyle();
  style.name = params.name;
  style.paints = [{ type: 'SOLID', color: hexToRgb(params.color) }];
  if (params.description) style.description = params.description;
  return { id: style.id, name: style.name };
}

async function createTextStyle(params) {
  const style = figma.createTextStyle();
  style.name = params.name;
  if (params.fontFamily) {
    const fStyle = params.fontWeight >= 700 ? 'Bold' : 'Regular';
    await figma.loadFontAsync({ family: params.fontFamily, style: fStyle });
    style.fontName = { family: params.fontFamily, style: fStyle };
  }
  if (params.fontSize) style.fontSize = params.fontSize;
  return { id: style.id, name: style.name };
}

function createEffectStyle(params) {
  const style = figma.createEffectStyle();
  style.name = params.name;
  if (params.type) {
    const effect = { type: params.type, visible: true, radius: params.radius || 4 };
    if (params.color) effect.color = { ...hexToRgb(params.color), a: 1 };
    if (params.offset) effect.offset = params.offset;
    if (params.spread !== undefined) effect.spread = params.spread;
    style.effects = [effect];
  }
  return { id: style.id, name: style.name };
}

function createGridStyle(params) {
  const style = figma.createGridStyle();
  style.name = params.name;
  const grid = { pattern: params.pattern || 'GRID', alignment: params.alignment || 'STRETCH' };
  if (params.count !== undefined) grid.count = params.count;
  if (params.gutterSize !== undefined) grid.gutterSize = params.gutterSize;
  if (params.offset !== undefined) grid.offset = params.offset;
  if (params.sectionSize !== undefined) grid.sectionSize = params.sectionSize;
  style.layoutGrids = [grid];
  return { id: style.id, name: style.name };
}

function updatePaintStyle(params) {
  const style = figma.getStyleById(params.styleId);
  if (!style || style.type !== 'PAINT') throw new Error('Paint style not found');
  if (params.name) style.name = params.name;
  if (params.color) style.paints = [{ type: 'SOLID', color: hexToRgb(params.color) }];
  if (params.description) style.description = params.description;
  return { id: style.id, name: style.name };
}

function applyStyleToNode(nodeId, params) {
  const node = figma.getNodeById(nodeId);
  if (!node) throw new Error('Node not found');
  const target = params.target || 'fill';
  if (target === 'fill' && 'fillStyleId' in node) node.fillStyleId = params.styleId;
  else if (target === 'stroke' && 'strokeStyleId' in node) node.strokeStyleId = params.styleId;
  return serializeNode(node, 0);
}

function deleteStyle(params) {
  const style = figma.getStyleById(params.styleId);
  if (!style) throw new Error('Style not found');
  style.remove();
  return { success: true };
}

function createVariableCollection(params) {
  const collection = figma.variables.createVariableCollection(params.name);
  if (params.initialModeName) collection.renameMode(collection.modes[0].modeId, params.initialModeName);
  return { id: collection.id, name: collection.name, modes: collection.modes };
}

function addVariableMode(params) {
  const collection = figma.variables.getVariableCollectionById(params.collectionId);
  if (!collection) throw new Error('Collection not found');
  collection.addMode(params.modeName);
  return { id: collection.id, modes: collection.modes };
}

function createVariable(params) {
  const v = figma.variables.createVariable(params.name, params.collectionId, params.type);
  return { id: v.id, name: v.name, resolvedType: v.resolvedType };
}

function setVariableValue(params) {
  const v = figma.variables.getVariableById(params.variableId);
  if (!v) throw new Error('Variable not found');
  v.setValueForMode(params.modeId, params.value);
  return { id: v.id, name: v.name };
}

function bindVariableToNode(nodeId, params) {
  const node = figma.getNodeById(nodeId);
  if (!node) throw new Error('Node not found');
  const v = figma.variables.getVariableById(params.variableId);
  if (!v) throw new Error('Variable not found');
  node.setBoundVariable(params.field, v);
  return serializeNode(node, 0);
}

function deleteVariable(params) {
  if (params.variableId) {
    const v = figma.variables.getVariableById(params.variableId);
    if (v) v.remove();
  }
  if (params.collectionId) {
    const c = figma.variables.getVariableCollectionById(params.collectionId);
    if (c) c.remove();
  }
  return { success: true };
}

function setReactions(nodeId, params) {
  const node = figma.getNodeById(nodeId);
  if (!node || !('reactions' in node)) throw new Error('Node does not support reactions');
  if (params.mode === 'append') { node.reactions = [...node.reactions, ...params.reactions]; }
  else { node.reactions = params.reactions; }
  return { id: node.id, reactions: node.reactions };
}

function removeReactions(nodeId, params) {
  const node = figma.getNodeById(nodeId);
  if (!node || !('reactions' in node)) throw new Error('Node does not support reactions');
  if (params.indices) {
    const indices = new Set(params.indices);
    node.reactions = node.reactions.filter((_, i) => !indices.has(i));
  } else {
    node.reactions = [];
  }
  return { id: node.id, reactions: node.reactions };
}

function addPage(params) {
  const page = figma.createPage();
  if (params.name) page.name = params.name;
  return { id: page.id, name: page.name };
}

function deletePage(params) {
  const page = findPage(params);
  if (figma.root.children.length <= 1) throw new Error('Cannot delete the only page');
  page.remove();
  return { success: true };
}

function renamePage(params) {
  const page = findPage(params);
  page.name = params.newName;
  return { id: page.id, name: page.name };
}

function navigateToPage(params) {
  const page = findPage(params);
  figma.currentPage = page;
  return { id: page.id, name: page.name };
}

function findPage(params) {
  if (params.pageId) {
    const p = figma.getNodeById(params.pageId);
    if (p && p.type === 'PAGE') return p;
  }
  if (params.pageName) {
    const p = figma.root.children.find(c => c.name === params.pageName);
    if (p) return p;
  }
  throw new Error('Page not found');
}

function groupNodes(nodeIds) {
  const nodes = nodeIds.map(id => figma.getNodeById(id)).filter(Boolean);
  if (nodes.length < 2) throw new Error('Need at least 2 nodes');
  const group = figma.group(nodes, nodes[0].parent);
  return serializeNode(group, 1);
}

function ungroupNodes(nodeIds) {
  const results = [];
  for (const id of nodeIds) {
    const n = figma.getNodeById(id);
    if (!n || n.type !== 'GROUP') continue;
    const parent = n.parent;
    const children = [...n.children];
    for (const child of children) parent.appendChild(child);
    n.remove();
    results.push(...children.map(c => ({ id: c.id, name: c.name })));
  }
  return results;
}

function swapComponent(nodeId, params) {
  const node = figma.getNodeById(nodeId);
  if (!node || node.type !== 'INSTANCE') throw new Error('Node must be an INSTANCE');
  const component = figma.getNodeById(params.componentId);
  if (!component || component.type !== 'COMPONENT') throw new Error('Target must be a COMPONENT');
  node.swapComponent(component);
  return serializeNode(node, 0);
}

function detachInstance(nodeIds) {
  return nodeIds.map(id => {
    const n = figma.getNodeById(id);
    if (!n || n.type !== 'INSTANCE') return { id, success: false };
    const frame = n.detachInstance();
    return { id: frame.id, name: frame.name, success: true };
  });
}

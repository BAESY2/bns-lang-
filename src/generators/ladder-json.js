/**
 * BNS Lang v2.0 — Ladder diagram as JSON (for visualization)
 */

const { collectSymbols } = require('../ir');

function varName(sym) {
  return `${sym.type}${sym.index}`;
}

function conditionToJson(node) {
  if (!node) return null;
  if (node.type && node.index !== undefined) {
    return { type: node.negated ? 'NC' : 'NO', address: varName(node) };
  }
  if (node.op === 'AND') {
    return { type: 'AND', branches: node.children.map(conditionToJson) };
  }
  if (node.op === 'OR') {
    return { type: 'OR', branches: node.children.map(conditionToJson) };
  }
  return null;
}

function generate(ast) {
  const rungs = ast.rungs.map(rung => ({
    conditions: conditionToJson(rung.conditions),
    coils: rung.coils.map(c => ({
      kind: c.kind,
      address: varName(c.symbol),
      preset: c.preset || null,
    })),
    comments: rung.comments,
  }));

  const symbols = collectSymbols(ast);
  return JSON.stringify({
    version: '2.0',
    symbols: symbols.map(s => ({ name: varName(s), type: s.type, index: s.index })),
    rungs,
  }, null, 2);
}

module.exports = { generate };

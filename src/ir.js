/**
 * BNS Lang v2.0 — Intermediate representation
 * Collects all symbols (X,Y,M,T,C) from AST for VAR declaration
 */

function collectSymbols(ast) {
  const symbols = new Map(); // key: "X1", value: { type, index }

  function key(prefix, index) {
    return `${prefix}${index}`;
  }

  function add(sym) {
    const k = key(sym.type, sym.index);
    if (!symbols.has(k)) symbols.set(k, { type: sym.type, index: sym.index });
  }

  function walkCondition(node) {
    if (!node) return;
    if (node.type && node.index !== undefined) {
      add(node);
      return;
    }
    if (node.op && node.children) {
      node.children.forEach(walkCondition);
    }
  }

  function walkRung(rung) {
    walkCondition(rung.conditions);
    rung.coils.forEach(c => {
      add(c.symbol);
      if (c.preset && (c.symbol.type === 'T' || c.symbol.type === 'C')) {
        add(c.symbol);
      }
    });
  }

  ast.rungs.forEach(walkRung);

  const list = [];
  symbols.forEach((v, k) => list.push({ ...v, key: k }));
  return list.sort((a, b) => {
    const order = { X: 0, Y: 1, M: 2, T: 3, C: 4 };
    const oa = order[a.type] || 5;
    const ob = order[b.type] || 5;
    if (oa !== ob) return oa - ob;
    return a.index - b.index;
  });
}

module.exports = { collectSymbols };

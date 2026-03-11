/**
 * BNS Lang v2.0 — ASCII art ladder diagram
 */

function varName(sym) {
  return `${sym.type}${sym.index}`;
}

function contactStr(node, nc = false) {
  if (!node) return '';
  if (node.type && node.index !== undefined) {
    const name = varName(node);
    return node.negated ? `┤/${name} ├` : `┤ ${name} ├`;
  }
  if (node.op === 'AND') {
    return node.children.map(c => contactStr(c)).join('──');
  }
  if (node.op === 'OR') {
    const branches = node.children.map(c => contactStr(c));
    return '┬' + branches.join('┬') + '┬';
  }
  return '';
}

function generate(ast) {
  const lines = [];
  ast.rungs.forEach((rung, i) => {
    const condStr = contactStr(rung.conditions);
    const left = condStr ? '──' + condStr + '──' : '──';
    rung.coils.forEach(coil => {
      const name = varName(coil.symbol);
      const coilStr = coil.kind === 'SET' ? `(S ${name})` : coil.kind === 'RESET' ? `(R ${name})` : `( ${name} )`;
      lines.push(left + coilStr);
    });
    if (rung.coils.length === 0 && rung.conditions) {
      lines.push(left);
    }
  });
  return lines.join('\n');
}

module.exports = { generate };

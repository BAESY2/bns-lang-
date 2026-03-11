/**
 * BNS Lang v2.0 — Parser
 * Tokens → AST (rungs with conditions and coils)
 */

const { TokenType } = require('./tokenizer');

function addressToSymbol(num, context) {
  const n = Math.abs(num);
  const negated = num < 0;
  if (context === 'coil') {
    if (n <= 99) return { type: 'Y', index: n, negated: false };
    if (n <= 199) return { type: 'Y', index: n - 100, negated: false }; // 100-199 → Y0-Y99
    if (n <= 299) return { type: 'M', index: n, negated: false };
    if (n <= 399) return { type: 'T', index: n, negated: false };
    if (n <= 499) return { type: 'C', index: n, negated: false };
    return { type: 'M', index: n, negated: false };
  }
  if (n <= 99) return { type: 'X', index: n, negated };
  if (n <= 199) return { type: 'Y', index: n - 100, negated }; // 100-199 → Y0-Y99
  if (n <= 299) return { type: 'M', index: n, negated };
  if (n <= 399) return { type: 'T', index: n, negated };
  if (n <= 499) return { type: 'C', index: n, negated };
  return { type: 'M', index: n, negated };
}

function parse(tokens) {
  const rungs = [];
  let i = 0;

  function peek() {
    return tokens[i] || { type: TokenType.EOF };
  }

  function advance() {
    return tokens[i++] || { type: TokenType.EOF };
  }

  function isConditionToken(t) {
    return t.type === TokenType.NUMBER || t.type === TokenType.LPAREN || (t.type === TokenType.NOT && t.value === '-');
  }

  function parseContact() {
    let negated = false;
    if (peek().type === TokenType.NOT) {
      advance();
      negated = true;
    }
    if (peek().type === TokenType.NUMBER) {
      const tok = advance();
      const sym = addressToSymbol(tok.value, 'contact');
      if (negated) sym.negated = true;
      return sym;
    }
    return null;
  }

  function parseAndExpr() {
    const left = parseContact();
    if (!left) return null;
    const group = [left];
    while (true) {
      const p = peek();
      if (p.type === TokenType.AND || (p.type === TokenType.NUMBER && group.length >= 1)) {
        if (p.type === TokenType.AND) advance();
        const next = parseContact();
        if (next) group.push(next);
        else break;
      } else break;
    }
    return group.length === 1 ? group[0] : { op: 'AND', children: group };
  }

  function parseOrExpr() {
    const first = parseAndExpr();
    if (!first) return null;
    const group = [first];
    while (peek().type === TokenType.OR) {
      advance();
      const next = parseAndExpr();
      if (next) group.push(next);
    }
    return group.length === 1 ? group[0] : { op: 'OR', children: group };
  }

  function parseConditionExpr() {
    return parseOrExpr();
  }

  while (i < tokens.length) {
    const t = peek();
    if (t.type === TokenType.EOF) break;
    if (t.type === TokenType.NEWLINE || t.type === TokenType.COMMENT || t.type === TokenType.SEPARATOR) {
      advance();
      continue;
    }

    const rung = { conditions: null, coils: [], comments: [] };

    while (peek().type === TokenType.COMMENT) {
      rung.comments.push(advance().value);
    }

    const cond = parseConditionExpr();
    if (cond) rung.conditions = cond;

    while (peek().type === TokenType.COIL || peek().type === TokenType.SET || peek().type === TokenType.RESET) {
      const coilTok = advance();
      const numTok = peek();
      if (numTok.type !== TokenType.NUMBER) break;
      const num = advance().value;
      const sym = addressToSymbol(num, 'coil');
      const kind = coilTok.type === TokenType.SET ? 'SET' : coilTok.type === TokenType.RESET ? 'RESET' : 'COIL';
      const coil = { kind, symbol: sym };
      const next = peek();
      if ((sym.type === 'T' || sym.type === 'C') && next.type === TokenType.NUMBER && next.value > 0 && next.value < 100000000) {
        advance();
        coil.preset = next.value;
        coil.presetType = sym.type === 'T' ? 'ms' : 'count';
      }
      rung.coils.push(coil);
    }

    while (peek().type === TokenType.NEWLINE) advance();

    if (rung.conditions || rung.coils.length > 0) {
      rungs.push(rung);
    }
  }

  return { rungs };
}

module.exports = { parse, addressToSymbol };

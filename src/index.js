/**
 * BNS Lang v2.0 — Library entry point
 * Write PLC ladder logic with just a numpad.
 */

const { tokenize, TokenType } = require('./tokenizer');
const { parse } = require('./parser');
const { collectSymbols } = require('./ir');
const st = require('./generators/st');
const xgt = require('./generators/xgt');
const inovance = require('./generators/inovance');
const ladderJson = require('./generators/ladder-json');
const ascii = require('./generators/ascii');

function compile(source, options = {}) {
  const tokens = tokenize(source);
  const ast = parse(tokens);
  const target = (options.target || 'st').toLowerCase();
  if (target === 'xgt') return xgt.generate(ast, options);
  if (target === 'inovance') return inovance.generate(ast, options);
  if (target === 'ladder-json' || target === 'json') return ladderJson.generate(ast);
  if (target === 'ascii' || target === 'ladder') return ascii.generate(ast);
  return st.generate(ast, options);
}

function check(source) {
  const tokens = tokenize(source);
  parse(tokens);
  return { ok: true };
}

function getAST(source) {
  const tokens = tokenize(source);
  return parse(tokens);
}

function getTokens(source) {
  return tokenize(source);
}

function explain(source) {
  const ast = getAST(source);
  const st = require('./generators/st');
  const lines = [];
  ast.rungs.forEach((rung, i) => {
    rung.coils.forEach(coil => {
      const outName = st.varName(coil.symbol);
      const cond = st.exprToST(rung.conditions);
      const mode = coil.kind === 'SET' ? 'LATCH' : coil.kind === 'RESET' ? 'UNLATCH' : 'ACTIVATE';
      let desc = `When ${cond} → ${mode} ${outName}`;
      if (coil.preset) desc += ` (preset: ${coil.preset}${coil.presetType === 'ms' ? 'ms' : ''})`;
      lines.push('• ' + desc);
    });
  });
  return lines.length ? `BNS Code Explanation:\n\n${lines.join('\n')}` : 'No executable rungs found.';
}

module.exports = {
  compile,
  check,
  explain,
  getAST,
  getTokens,
  tokenize,
  TokenType,
  parse,
  collectSymbols,
  generators: { st, xgt, inovance, ladderJson, ascii },
};

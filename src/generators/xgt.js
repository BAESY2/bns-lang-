/**
 * BNS Lang v2.0 — LS Electric XGT target (same as ST with XGT address mapping)
 */

const st = require('./st');

function generate(ast, options = {}) {
  return st.generate(ast, { ...options, noAddress: false });
}

module.exports = { generate };

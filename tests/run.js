const bns = require('../src/index.js');
const fs = require('fs');
const path = require('path');

let failed = 0;
function ok(name, cond) {
  if (!cond) {
    console.error('FAIL:', name);
    failed++;
  } else {
    console.log('OK:', name);
  }
}

// 1. Tokenize
const tokens = bns.getTokens('1 2 = 50');
ok('tokenize numbers', tokens.some(t => t.type === 'NUMBER' && t.value === 1));

// 2. Parse and compile
const ast = bns.getAST('1 2 = 50');
ok('parse rung', ast.rungs.length === 1 && ast.rungs[0].coils[0].symbol.type === 'Y');

const st = bns.compile('1 2 = 50');
ok('compile ST', st.includes('Y50') && st.includes('X1') && st.includes('AND'));

// 3. Self-holding
const st2 = bns.compile('1 -2 | 110 = 10');
ok('self-hold ST', st2.includes('Y10') && st2.includes('NOT X2') && st2.includes('OR Y10'));

// 4. Check
bns.check('1 2 = 50');
ok('check valid', true);

// 5. Examples compile
const examplesDir = path.join(__dirname, '../examples');
if (fs.existsSync(examplesDir)) {
  const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.bns'));
  for (const f of files) {
    const src = fs.readFileSync(path.join(examplesDir, f), 'utf8');
    try {
      bns.compile(src);
      ok('example ' + f, true);
    } catch (e) {
      ok('example ' + f, false);
    }
  }
}

process.exit(failed > 0 ? 1 : 0);

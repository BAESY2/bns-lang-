#!/usr/bin/env node
/**
 * BNS Lang v2.0 — CLI
 */

const fs = require('fs');
const path = require('path');
const bns = require('./index.js');

const args = process.argv.slice(2);
const cmd = args[0] || 'compile';

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) return resolve(null);
    let data = '';
    process.stdin.on('data', (ch) => { data += ch; });
    process.stdin.on('end', () => resolve(data));
  });
}

function parseArgs(arr) {
  const o = { target: 'st', output: null, stdout: false, json: false };
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === '-o' || arr[i] === '--output') o.output = arr[++i];
    else if (arr[i] === '--stdout') o.stdout = true;
    else if (arr[i] === '--target') o.target = arr[++i] || 'st';
    else if (arr[i] === '--json') o.json = true;
    else if (!arr[i].startsWith('-')) o.input = arr[i];
  }
  return o;
}

async function runCompile() {
  const a = parseArgs(args.slice(1));
  let source = null;
  if (a.input) {
    try {
      source = fs.readFileSync(a.input, 'utf8');
    } catch (e) {
      console.error('Error reading file:', a.input, e.message);
      process.exit(1);
    }
  } else {
    source = await readStdin();
    if (source === null || source === '') {
      console.error('Usage: bns compile [input.bns] [-o output.st] [--stdout] [--target xgt|st|inovance|ladder-json|ascii]');
      process.exit(1);
    }
  }

  try {
    const out = bns.compile(source, { target: a.target });
    if (a.stdout || !a.output) {
      process.stdout.write(out);
    } else {
      fs.writeFileSync(a.output, out, 'utf8');
      console.error('Wrote', a.output);
    }
  } catch (e) {
    console.error('Compile error:', e.message);
    process.exit(1);
  }
}

function runCheck() {
  const input = args[1];
  if (!input) {
    console.error('Usage: bns check <input.bns>');
    process.exit(1);
  }
  let source;
  try {
    source = fs.readFileSync(input, 'utf8');
  } catch (e) {
    console.error('Error reading file:', input, e.message);
    process.exit(1);
  }
  try {
    bns.check(source);
    console.log('OK');
  } catch (e) {
    console.error('Check failed:', e.message);
    process.exit(1);
  }
}

function runAST() {
  const a = parseArgs(args.slice(1));
  const input = a.input || args[1];
  if (!input) {
    console.error('Usage: bns ast <input.bns> [--json]');
    process.exit(1);
  }
  let source;
  try {
    source = fs.readFileSync(input, 'utf8');
  } catch (e) {
    console.error('Error reading file:', input, e.message);
    process.exit(1);
  }
  const ast = bns.getAST(source);
  if (a.json) {
    console.log(JSON.stringify(ast, null, 2));
  } else {
    console.log(ast);
  }
}

function runLadder() {
  const input = args[1];
  if (!input) {
    console.error('Usage: bns ladder <input.bns>');
    process.exit(1);
  }
  let source;
  try {
    source = fs.readFileSync(input, 'utf8');
  } catch (e) {
    console.error('Error reading file:', input, e.message);
    process.exit(1);
  }
  const out = bns.compile(source, { target: 'ascii' });
  console.log(out);
}

async function runRepl() {
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.setPrompt('bns> ');
  console.log('BNS Lang REPL. Type a rung and press Enter. Empty line to exit.');
  rl.prompt();
  for await (const line of rl) {
    if (!line.trim()) break;
    try {
      const out = bns.compile(line, { target: 'ascii' });
      console.log(out);
    } catch (e) {
      console.error(e.message);
    }
    rl.prompt();
  }
  rl.close();
}

(async () => {
  if (cmd === 'compile') await runCompile();
  else if (cmd === 'check') runCheck();
  else if (cmd === 'ast') runAST();
  else if (cmd === 'ladder') runLadder();
  else if (cmd === 'repl') await runRepl();
  else {
    console.error('Commands: compile, check, ast, ladder, repl');
    process.exit(1);
  }
})();

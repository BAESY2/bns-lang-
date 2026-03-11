#!/usr/bin/env node
/**
 * BNS Lang MCP Server
 *
 * Cursor / Claude Code에서 사용:
 *   - bns_compile: BNS → IEC 61131-3 ST
 *   - bns_check: 문법 검증
 *   - bns_ladder: ASCII 래더 다이어그램
 *   - bns_explain: BNS 코드 자연어 설명
 *
 * Cursor: .cursor/mcp.json 에서 command/args 로 이 파일 지정
 */

const { stdin, stdout } = require('process');
const bns = require('./index.js');

let buffer = '';

stdin.setEncoding('utf8');
stdin.on('data', (chunk) => {
  buffer += chunk;
  processBuffer();
});

function processBuffer() {
  while (true) {
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) return;

    const header = buffer.slice(0, headerEnd);
    const contentLengthMatch = header.match(/Content-Length:\s*(\d+)/i);
    if (!contentLengthMatch) {
      buffer = buffer.slice(headerEnd + 4);
      continue;
    }

    const contentLength = parseInt(contentLengthMatch[1], 10);
    const bodyStart = headerEnd + 4;
    if (buffer.length < bodyStart + contentLength) return;

    const body = buffer.slice(bodyStart, bodyStart + contentLength);
    buffer = buffer.slice(bodyStart + contentLength);

    try {
      const msg = JSON.parse(body);
      handleMessage(msg);
    } catch (e) {
      sendError(null, -32700, 'Parse error');
    }
  }
}

function sendResponse(id, result) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, result });
  stdout.write(`Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`);
}

function sendError(id, code, message) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } });
  stdout.write(`Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`);
}

const TOOLS = [
  {
    name: 'bns_compile',
    description: 'Compile BNS Lang to IEC 61131-3 Structured Text.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'BNS Lang source code' },
        target: { type: 'string', enum: ['iec', 'xgt', 'inovance'], default: 'iec', description: 'Target PLC' },
      },
      required: ['code'],
    },
  },
  {
    name: 'bns_check',
    description: 'Validate BNS Lang syntax. Returns OK or errors.',
    inputSchema: {
      type: 'object',
      properties: { code: { type: 'string', description: 'BNS Lang source' } },
      required: ['code'],
    },
  },
  {
    name: 'bns_ladder',
    description: 'Generate ASCII art ladder diagram from BNS Lang.',
    inputSchema: {
      type: 'object',
      properties: { code: { type: 'string', description: 'BNS Lang source' } },
      required: ['code'],
    },
  },
  {
    name: 'bns_explain',
    description: 'Explain BNS Lang code in plain language.',
    inputSchema: {
      type: 'object',
      properties: { code: { type: 'string', description: 'BNS Lang source' } },
      required: ['code'],
    },
  },
];

function handleMessage(msg) {
  const { id, method, params } = msg;

  switch (method) {
    case 'initialize':
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'bns-lang', version: '2.0.0' },
      });
      break;

    case 'notifications/initialized':
      break;

    case 'tools/list':
      sendResponse(id, { tools: TOOLS });
      break;

    case 'tools/call':
      handleToolCall(id, params.name, params.arguments || {});
      break;

    default:
      sendError(id, -32601, `Method not found: ${method}`);
  }
}

function handleToolCall(id, toolName, args) {
  try {
    let result;
    const code = args.code || '';
    const target = (args.target || 'iec').toLowerCase();
    const targetMap = { iec: 'st', xgt: 'xgt', inovance: 'inovance' };
    const bnsTarget = targetMap[target] || 'st';

    switch (toolName) {
      case 'bns_compile':
        result = bns.compile(code, { target: bnsTarget });
        break;
      case 'bns_check':
        bns.check(code);
        result = '✅ OK — No syntax errors found.';
        break;
      case 'bns_ladder':
        result = bns.compile(code, { target: 'ascii' });
        break;
      case 'bns_explain':
        result = bns.explain(code);
        break;
      default:
        return sendError(id, -32602, `Unknown tool: ${toolName}`);
    }
    sendResponse(id, { content: [{ type: 'text', text: result }] });
  } catch (err) {
    sendResponse(id, {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    });
  }
}

if (process.stderr) process.stderr.write('BNS Lang MCP Server v2.0 started\n');

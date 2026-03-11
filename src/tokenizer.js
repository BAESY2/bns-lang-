/**
 * BNS Lang v2.0 — Tokenizer
 * Lexer: source → tokens (numpad DSL)
 */

const TokenType = {
  NUMBER: 'NUMBER',
  AND: 'AND',       // space or +
  OR: 'OR',         // |
  NOT: 'NOT',       // - prefix
  COIL: 'COIL',     // =
  SET: 'SET',       // =!
  RESET: 'RESET',   // =/
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  TIMER_PRESET: 'TIMER_PRESET',  // number after timer
  COUNTER_PRESET: 'COUNTER_PRESET',
  COMMENT: 'COMMENT',
  SEPARATOR: 'SEPARATOR',  // ---
  NEWLINE: 'NEWLINE',
  EOF: 'EOF',
};

function tokenize(source) {
  const tokens = [];
  const lines = source.split(/\r?\n/);

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    let line = lines[lineNum];
    const col0 = 0;

    // Strip comment (rest of line after #)
    const hashIdx = line.indexOf('#');
    if (hashIdx >= 0) {
      const comment = line.slice(hashIdx).trim();
      if (comment.length > 0) {
        tokens.push({ type: TokenType.COMMENT, value: comment.slice(1).trim(), line: lineNum + 1, col: hashIdx });
      }
      line = line.slice(0, hashIdx);
    }

    line = line.trim();
    if (line.length === 0) {
      tokens.push({ type: TokenType.NEWLINE, value: '\n', line: lineNum + 1 });
      continue;
    }

    // Rung separator
    if (line === '---' || /^---+$/.test(line)) {
      tokens.push({ type: TokenType.SEPARATOR, value: line, line: lineNum + 1, col: 0 });
      tokens.push({ type: TokenType.NEWLINE, value: '\n', line: lineNum + 1 });
      continue;
    }

    let pos = 0;
    let col = 0;
    const trimStart = lines[lineNum].length - line.length;
    if (hashIdx < 0) col = trimStart;

    while (pos < line.length) {
      const ch = line[pos];
      const rest = line.slice(pos);

      if (ch === ' ' || ch === '\t') {
        pos++;
        col++;
        continue;
      }

      // =
      if (ch === '=') {
        if (line[pos + 1] === '!') {
          tokens.push({ type: TokenType.SET, value: '=!', line: lineNum + 1, col: pos + trimStart });
          pos += 2;
          col += 2;
          continue;
        }
        if (line[pos + 1] === '/') {
          tokens.push({ type: TokenType.RESET, value: '=/', line: lineNum + 1, col: pos + trimStart });
          pos += 2;
          col += 2;
          continue;
        }
        tokens.push({ type: TokenType.COIL, value: '=', line: lineNum + 1, col: pos + trimStart });
        pos++;
        col++;
        continue;
      }

      // +
      if (ch === '+') {
        tokens.push({ type: TokenType.AND, value: '+', line: lineNum + 1, col: pos + trimStart });
        pos++;
        col++;
        continue;
      }

      // |
      if (ch === '|') {
        tokens.push({ type: TokenType.OR, value: '|', line: lineNum + 1, col: pos + trimStart });
        pos++;
        col++;
        continue;
      }

      // - (NOT prefix or negative number for NC contact)
      if (ch === '-') {
        const numMatch = rest.match(/^-\s*(\d+)/);
        if (numMatch) {
          tokens.push({ type: TokenType.NUMBER, value: -parseInt(numMatch[1], 10), raw: numMatch[0].replace(/\s/g, ''), line: lineNum + 1, col: pos + trimStart });
          pos += numMatch[0].length;
          col += numMatch[0].length;
          continue;
        }
        tokens.push({ type: TokenType.NOT, value: '-', line: lineNum + 1, col: pos + trimStart });
        pos++;
        col++;
        continue;
      }

      // ( )
      if (ch === '(') {
        tokens.push({ type: TokenType.LPAREN, value: '(', line: lineNum + 1, col: pos + trimStart });
        pos++;
        col++;
        continue;
      }
      if (ch === ')') {
        tokens.push({ type: TokenType.RPAREN, value: ')', line: lineNum + 1, col: pos + trimStart });
        pos++;
        col++;
        continue;
      }

      // Number
      const numMatch = rest.match(/^(\d+)/);
      if (numMatch) {
        const n = parseInt(numMatch[1], 10);
        tokens.push({ type: TokenType.NUMBER, value: n, raw: numMatch[0], line: lineNum + 1, col: pos + trimStart });
        pos += numMatch[0].length;
        col += numMatch[0].length;
        continue;
      }

      pos++;
      col++;
    }

    tokens.push({ type: TokenType.NEWLINE, value: '\n', line: lineNum + 1 });
  }

  tokens.push({ type: TokenType.EOF, value: '', line: 0, col: 0 });
  return tokens;
}

module.exports = { tokenize, TokenType };

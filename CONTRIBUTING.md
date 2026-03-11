# Contributing to BNS Lang

Contributions are welcome!

## Development

```bash
git clone https://github.com/your-org/bns-lang.git
cd bns-lang
npm install
```

## Running

```bash
node src/cli.js compile examples/01-basics.bns --stdout
```

## Good First Issues

- Add syntax highlighting for more editors
- Write examples for common PLC patterns
- Add a new target PLC code generator
- Improve error messages

## Pull Requests

1. Fork the repo and create a branch.
2. Make your changes; keep the numpad-first grammar in mind.
3. Ensure `bns check` and `bns compile` work on your examples.
4. Submit a PR with a clear description.

## Code Style

- JavaScript (Node 14+).
- No build step required for core; keep the CLI simple.

Thank you for contributing!

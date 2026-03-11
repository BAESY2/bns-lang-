# Target PLC Reference

## LS Electric XGT Series

```bash
bns compile input.bns --target xgt -o output.st
```

- Supported models: XGK, XGI, XGR, XGB
- Output: IEC 61131-3 Structured Text
- Address mapping follows XG5000 conventions
- Tested against PLAIDE IDE compilation

## IEC 61131-3 Generic

```bash
bns compile input.bns --target iec -o output.st
```

- Standard compliant Structured Text output
- Works with any IEC 61131-3 compatible PLC
- Default target if none specified

## Inovance H5U/H3U (Beta)

```bash
bns compile input.bns --target inovance -o output.prj
```

- Output: XML-based .prj format for AutoShop
- Requires AutoShop v4.10.1.1+ for LiteST support
- Note: v4.4.6 and earlier do NOT support ST — use v4.10.1.1

## Ladder JSON (Visualization)

```bash
bns compile input.bns --target json -o output.json
```

- Outputs a JSON structure representing the ladder diagram
- Useful for building visual editors, web-based viewers, or debugging tools
- Each rung is an object with contacts, branches, and coils

## Adding a New Target

See [CONTRIBUTING.md](../CONTRIBUTING.md) for instructions on adding a new code generator.

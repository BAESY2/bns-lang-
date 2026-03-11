# BNS Lang Syntax Reference

## Grammar (BNF)

```bnf
program     ::= (rung NEWLINE)*
rung        ::= expression '=' output
expression  ::= term (('|') term)*
term        ::= factor ((' ' | '+') factor)*
factor      ::= '-'? atom
atom        ::= NUMBER | '(' expression ')' | timer | counter
timer       ::= 'T' NUMBER NUMBER
counter     ::= 'C' NUMBER NUMBER
output      ::= '='  ['!' | '/'] NUMBER
              | '=' 'T' NUMBER NUMBER
              | '=' 'C' NUMBER NUMBER
NUMBER      ::= [0-9]+
```

The entire grammar is **15 lines of BNF**. This is intentional — BNS Lang is designed to be memorized in minutes and parsed by any tool, including LLMs.

## Operator Precedence

1. `()` — Grouping (highest)
2. `-` — NOT (prefix)
3. ` ` or `+` — AND (series)
4. `|` — OR (parallel, lowest)

## Address Mapping

Default mapping (LS Electric XGT convention):

```
Input:    0-99    → %IX0.0  to %IX0.99   (X contacts)
Output:   100-199 → %QX1.0  to %QX1.99   (Y coils)
Internal: 200-299 → %MX2.0  to %MX2.99   (M relays)
Timer:    300-399 → T300    to T399
Counter:  400-499 → C400    to C499
```

Override with `--address-map` or a `.bnsconfig` file.

## Comments

```
# This is a comment
1 2 = 100  # Inline comment
```

## Rung Separators

Optional — for visual clarity in long programs:

```
1 2 = 100
---
3 4 = 101
---
5 = 102
```

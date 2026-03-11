# Using BNS Lang with LLMs

BNS Lang was designed to be the **easiest PLC language for AI to generate**.

## Why LLMs + BNS Lang?

Traditional PLC languages (Ladder Diagram, Function Block Diagram) are visual — they exist as GUI layouts, not text. This makes them nearly impossible for LLMs to generate directly.

Structured Text (ST) is text-based but verbose, with complex variable declarations and type systems that LLMs frequently get wrong.

**BNS Lang is pure logic, zero boilerplate.** An LLM only needs to know:
- Numbers = addresses
- Space = AND
- `|` = OR
- `-` = NOT
- `=` = output

That's the entire language. The compiler handles variable declarations, type mapping, and target-specific formatting.

## Prompt Template

```
You are generating BNS Lang code for a PLC program.

BNS Lang syntax:
- Numbers are I/O addresses (0-99 = inputs, 100-199 = outputs as contact, 0-99 = coil Y0-Y99)
- Space or + = AND (series contacts)
- | = OR (parallel branch)
- - prefix = NOT (normally closed)
- = NUMBER = output coil (0-99 → Y0-Y99)
- =! NUMBER = SET (latch)
- =/ NUMBER = RESET (unlatch)
- Use 100+ for Y as contact: 110 = Y10 contact (self-hold)
- # = comment

Example - self-holding motor circuit (Y10):
1 -2 | 110 = 10

Now generate BNS Lang for:
{user_description}
```

## Example: AI-Generated PLC Program

**Prompt:** "Create a bottle filling station. Sensor X1 detects bottle. Valve Y100 opens. Sensor X2 detects full. Valve closes. Conveyor Y101 moves bottle out."

**LLM Output:**
```
# Bottle filling station
# X1 = bottle present sensor, X2 = bottle full sensor
# Y100 = fill valve, Y101 = conveyor motor
# 200 = M200 filling in progress

1 -2 -200 =! 200
200 -2 = 100
2 =/ 200
2 = 101
```

**Compile:** `bns compile filling.bns --target xgt -o filling.st`

## Integration Example (Python)

```python
import subprocess

def bns_to_st(bns_code: str, target: str = "iec") -> str:
    result = subprocess.run(
        ["bns", "compile", "--stdout", "--target", target],
        input=bns_code, capture_output=True, text=True
    )
    return result.stdout
```

## Why This Matters

The industrial automation market is $200B+. PLC programming is a bottleneck. BNS Lang is simple enough for AI to reliably produce and for engineers to review.

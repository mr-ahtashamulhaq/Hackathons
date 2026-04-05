# Problem 6: Low Hill

## Overview
This problem involves a large quantum circuit (~60 qubits) where direct simulation becomes impractical.

## Approach
Instead of brute-force simulation, we used **approximate transpilation** to simplify the circuit before simulation.

Steps:
1. Load the `.qasm` circuit
2. Apply Qiskit level-3 transpilation with different approximation levels
3. Identify when the circuit depth collapses significantly
4. Simulate the simplified circuit using MPS
5. Select the highest-probability bitstring

## Key Insight
The circuit is designed with redundant or canceling operations. Aggressive optimization reduces it to a much simpler equivalent circuit, making simulation feasible.

## Why this works
After simplification, the circuit becomes shallow and produces a near-deterministic output (high probability peak), allowing reliable extraction of the correct bitstring.

## How to run

```bash
python solve_p6.py
```
## Output
Prints the peak bitstring along with intermediate logs showing depth reduction and candidate probabilities.
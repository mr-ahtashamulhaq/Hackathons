# Problem 3: Tiny Ripple

## Overview
This problem involves a larger quantum circuit (~30 qubits). The goal remains to identify the peak bitstring with the highest probability.

## Approach
At this scale, full statevector simulation becomes expensive, so we used:

**Matrix Product State (MPS) simulation + sampling**

Steps:
1. Load the `.qasm` circuit
2. Add measurements to all qubits
3. Simulate using Qiskit's MPS backend
4. Run multiple shots to collect measurement counts
5. Select the most frequent bitstring

## Why this works
Although the circuit is larger, it still has a clear dominant outcome. MPS allows efficient simulation of such circuits without exponential memory usage.

## How to run

```bash
python solve_p3.py
```

## Output
Prints the bitstring with the highest observed frequency from the simulation.
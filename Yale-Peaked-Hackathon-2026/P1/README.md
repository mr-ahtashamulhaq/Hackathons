# Problem 1: Little Dimple

## Overview
This problem involves a small quantum circuit (4 qubits) where the goal is to identify the peak bitstring — the state with the highest probability amplitude.

## Approach
Since the circuit is very small, we used **exact statevector simulation**:

1. Load the `.qasm` file using Qiskit
2. Simulate the circuit using the statevector backend
3. Find the index of the maximum amplitude
4. Convert that index into a bitstring

This method guarantees the correct answer without approximation.

## Why this works
For small circuits (≤ 20 qubits), full statevector simulation is feasible and provides exact results, making it the most reliable approach.

## How to run

```bash
python solve_p1.py
```

## Output

Prints the peak bitstring corresponding to the highest probability state.
# Problem 2: Small Bump

## Overview
This problem involves a medium-sized quantum circuit (~12 qubits). The goal is to identify the peak bitstring with the highest probability.

## Approach
For this circuit, we used **sampling-based simulation**:

1. Load the `.qasm` circuit using Qiskit
2. Add measurement operations to all qubits
3. Run the circuit on a simulator with multiple shots
4. Collect measurement counts
5. Select the most frequent bitstring as the peak

## Why this works
The circuit has a clear dominant state, so repeated sampling reveals the peak bitstring reliably. Full statevector simulation is unnecessary here.

## How to run

```bash
python solve_p2.py
```

## Output
Prints the bitstring with the highest frequency from the sampled results.
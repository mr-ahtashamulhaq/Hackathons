# BlueQubit × Yale Quantum Hackathon - Solutions

This repository contains my solutions for the **BlueQubit Quantum Hackathon** conducted in collaboration with **Yale University** ([Hackathon Link](https://app.bluequbit.io/hackathons/wSvCWg8f38spoXX3)).
The challenge focused on solving **“Peaked Circuits”** - quantum circuits designed such that one specific bitstring has a significantly higher probability than all others. The goal was to identify that peak bitstring efficiently.

---

## 🧠 Background

Quantum computing is not my primary field. I approached this hackathon with minimal prior exposure and learned the required concepts along the way to participate effectively.

While the domain was quantum, a significant portion of the work involved:
- Problem solving
- Circuit analysis
- Efficient Python implementation

This allowed me to leverage strong Python skills to explore and solve problems in a new domain.

---

## 📊 Problems Solved

Out of 10 total challenges, I successfully solved **4 problems**:

| Problem | Qubits | Bitstring | Method |
| :--- | :--- | :--- | :--- |
| **P1** | 4 | `1001` | Exact Statevector |
| **P2** | 12 | `111010100110` | Sampling |
| **P3** | 30 | `000110111010100110100001111100` | MPS Simulation |
| **P6** | 60 | `111011000000000001110101110001101001111011100010100101001101` | Approximate Transpilation |

> Note: Bitstrings may also be valid in reversed order due to endianness differences.

---

## ⚙️ Methods Used

Different problems required different strategies:

### 1. Exact Statevector Simulation
- Used for very small circuits (P1)
- Directly computes full quantum state
- Extracts maximum amplitude

### 2. Sampling-Based Simulation
- Used for small-to-medium circuits (P2)
- Runs circuit multiple times
- Selects most frequent bitstring

### 3. Matrix Product State (MPS)
- Used for larger circuits (P3)
- Efficient approximation for entangled systems
- Avoids exponential memory growth

### 4. Approximate Transpilation (Key Insight)
- Used for large circuits (P6)
- Simplifies circuit using:
  - `optimization_level=3`
  - `approximation_degree ≈ 0.99`
- Collapses circuit depth drastically
- Makes simulation feasible and reveals dominant state

---

## 📁 Repository Structure

```

.
├── P1/
├── P2/
├── P3/
├── P6/
└── README.md

````

Each problem folder contains:
- `.qasm` file (original circuit)
- `solve_*.py` (solution script)
- `README.md` (approach explanation)

---

## 🛠️ Installation

Install required dependencies:

```bash
pip install qiskit qiskit-aer networkx numpy
````

---

## ▶️ How to Run

Navigate to any problem folder and run:

```bash
python solve_pX.py
```

Example:

```bash
cd P6
python solve_p6.py
```

---

## 💡 Key Learnings

* Not all quantum problems require brute-force simulation
* Circuit structure often matters more than raw compute
* Approximation and simplification can outperform exact methods
* Classical programming (Python) plays a major role in quantum workflows

---

## 🙌 Acknowledgment

Thanks to **Yale University** and **BlueQubit** for organizing this hackathon and providing a well-designed set of challenges.

---

## 🚀 Final Note

This was my first hands-on experience with quantum computing.
While I only solved a subset of problems, the learning experience and exposure to quantum circuit reasoning were extremely valuable.
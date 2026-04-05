from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit import transpile


def solve_p1(qasm_path):
    # load circuit
    qc = QuantumCircuit.from_qasm_file(qasm_path)

    # exact simulation
    sim = AerSimulator(method="statevector")
    qc = transpile(qc, sim)

    # get statevector
    result = sim.run(qc).result()
    state = result.get_statevector()

    # find max amplitude index
    max_index = max(range(len(state)), key=lambda i: abs(state[i]))

    # convert to bitstring
    bitstring = format(max_index, f"0{qc.num_qubits}b")

    return bitstring


if __name__ == "__main__":
    path = "P1_little_peak.qasm"
    ans = solve_p1(path)
    print(ans)
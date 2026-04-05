from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator


def solve_p2(qasm_path, shots=2000):
    # load circuit
    qc = QuantumCircuit.from_qasm_file(qasm_path)

    # add measurements
    qc.measure_all()

    # simulator
    sim = AerSimulator(method="statevector")

    # transpile
    qc = transpile(qc, sim)

    # run
    job = sim.run(qc, shots=shots)
    counts = job.result().get_counts()

    # find most frequent bitstring
    best = max(counts, key=counts.get)

    return best


if __name__ == "__main__":
    path = "P2_small_bump.qasm"
    ans = solve_p2(path)
    print(ans)
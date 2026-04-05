from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator


def solve_p3(qasm_path, shots=2000):
    # load circuit
    qc = QuantumCircuit.from_qasm_file(qasm_path)

    # add measurements
    qc.measure_all()

    # use MPS simulator for larger circuits
    sim = AerSimulator(method="matrix_product_state")

    # transpile
    qc = transpile(qc, sim)

    # run
    job = sim.run(qc, shots=shots)
    counts = job.result().get_counts()

    # find most frequent bitstring
    best = max(counts, key=counts.get)

    return best


if __name__ == "__main__":
    path = "P3_tiny_ripple.qasm"
    ans = solve_p3(path)
    print(ans)
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator


def solve_p6(qasm_path):
    qc = QuantumCircuit.from_qasm_file(qasm_path)

    print("Original depth:", qc.depth())

    best_candidate = None
    best_prob = 0

    # try multiple approximation levels
    for approx in [0.99, 0.97, 0.95, 0.90]:
        print(f"\nTrying approximation_degree = {approx}")

        qc_opt = transpile(
            qc,
            basis_gates=['u3', 'cx'],
            optimization_level=3,
            approximation_degree=approx
        )

        print("Optimized depth:", qc_opt.depth())

        # simulate only if circuit collapses
        if qc_opt.depth() < 30:
            qc_sim = qc_opt.copy()
            qc_sim.measure_all()

            sim = AerSimulator(method="matrix_product_state")
            job = sim.run(qc_sim, shots=2000)
            counts = job.result().get_counts()

            candidate = max(counts, key=counts.get)
            prob = counts[candidate] / 2000

            print("Candidate:", candidate, "Prob:", prob)

            if prob > best_prob:
                best_candidate = candidate
                best_prob = prob

    return best_candidate


if __name__ == "__main__":
    path = "P6_low_hill.qasm"
    ans = solve_p6(path)
    print("\nFinal Answer:", ans)
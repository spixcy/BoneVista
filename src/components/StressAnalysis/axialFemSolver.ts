export interface AxialFemInput {
  forceN: number;
  areaMm2: number;
  lengthMm: number;
  modulusGPa: number;
  elements: number;
}

export interface AxialFemResult {
  displacementsMm: number[];
  elementStressMPa: number[];
  maxStressMPa: number;
  endDisplacementMm: number;
}

/** Linear 1D bar FEM: assemble two-node axial stiffness matrices, fix node 0, apply an end force. */
export function solveAxialBar(input: AxialFemInput): AxialFemResult {
  const { forceN, areaMm2, lengthMm, modulusGPa, elements } = input;
  if (![forceN, areaMm2, lengthMm, modulusGPa].every(Number.isFinite) || forceN < 0 || areaMm2 <= 0 || lengthMm <= 0 || modulusGPa <= 0) {
    throw new Error('Force must be non-negative; area, length, and modulus must be positive finite values.');
  }
  if (!Number.isInteger(elements) || elements < 1 || elements > 100) throw new Error('Use between 1 and 100 finite elements.');

  // N and mm are used consistently: convert Young's modulus from GPa to N/mm² (MPa).
  const modulusMPa = modulusGPa * 1000;
  const elementLength = lengthMm / elements;
  const stiffness = modulusMPa * areaMm2 / elementLength;
  const size = elements + 1;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0) as number[]);
  for (let element = 0; element < elements; element += 1) {
    matrix[element][element] += stiffness;
    matrix[element][element + 1] -= stiffness;
    matrix[element + 1][element] -= stiffness;
    matrix[element + 1][element + 1] += stiffness;
  }

  // Apply u(0)=0 by removing the constrained degree of freedom; solve Kff uf = Ff.
  const reduced = matrix.slice(1).map((row) => row.slice(1));
  const loads = Array(elements).fill(0) as number[];
  loads[elements - 1] = forceN;
  const freeDisplacements = gaussianSolve(reduced, loads);
  const displacementsMm = [0, ...freeDisplacements];
  const elementStressMPa = Array.from({ length: elements }, (_, i) => modulusMPa * (displacementsMm[i + 1] - displacementsMm[i]) / elementLength);
  return {
    displacementsMm,
    elementStressMPa,
    maxStressMPa: Math.max(...elementStressMPa.map(Math.abs)),
    endDisplacementMm: displacementsMm[displacementsMm.length - 1],
  };
}

function gaussianSolve(source: number[][], rhs: number[]): number[] {
  const n = rhs.length;
  const a = source.map((row, i) => [...row, rhs[i]]);
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    if (Math.abs(a[pivot][col]) < 1e-12) throw new Error('The stiffness matrix is singular. Check the constraints.');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const divisor = a[col][col];
    for (let k = col; k <= n; k += 1) a[col][k] /= divisor;
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let k = col; k <= n; k += 1) a[row][k] -= factor * a[col][k];
    }
  }
  return a.map((row) => row[n]);
}

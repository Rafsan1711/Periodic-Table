import * as THREE from './node_modules/three';
import { Proton, Neutron, Electron } from './atom_particles.js';

export class Atom extends THREE.Group {
  constructor(
    symbol,         // e.g. 'O', 'Au'
    name,           // e.g. 'Oxygen', 'Gold'
    atomicNumber,   // number of protons
    neutrons = null, // custom neutron count (for isotopes)
    shellConfig = null // array, e.g., [2, 8, 18]
  ) {
    super();
    this.symbol = symbol;
    this.name = name;
    this.protons = atomicNumber;
    this.neutrons = neutrons ?? Math.max(0, atomicNumber - 1);
    this.shellConfig = shellConfig;
    this.electrons = [];

    // Nucleus rotation setup
    this.nucleusAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    this.nucleusRotationSpeed = 0.3 + Math.random() * 0.7;

    this.nucleus = new THREE.Group();
    this.add(this.nucleus);

    // Nucleus & nucleon placement
    const P = this.protons;
    const N = this.neutrons;
    const A = P + N;
    const R0 = 0.4; // Adjust for realistic nucleus size
    const nucleusRadius = R0 * Math.pow(A, 1 / 3);

    const packingFrac = 0.74;
    const Vnucleus = (4 / 3) * Math.PI * Math.pow(nucleusRadius, 3);
    const volPer = Vnucleus / (A * packingFrac);
    const particleRadius = Math.cbrt((3 * volPer) / (4 * Math.PI));
    const nucleonPositions = fibonacciSpherePoints(A, nucleusRadius);

    const nucleons = [];
    for (let i = 0; i < P; i++) nucleons.push(new Proton(particleRadius));
    for (let i = 0; i < N; i++) nucleons.push(new Neutron(particleRadius));
    shuffleArray(nucleons);
    nucleons.forEach((nuc, i) => {
      nuc.position.copy(nucleonPositions[i]);
      this.nucleus.add(nuc);
    });

    // Electron distribution
    let shellCounts;
    if (this.shellConfig === null) {
      shellCounts = this._distributeElectrons(P);
    } else {
      shellCounts = this.shellConfig;
    }
    this.electrons = this._createElectrons(shellCounts, nucleusRadius);
  }

  // Distribute electrons into shells based on the total number
  _distributeElectrons(total) {
    const shells = [];
    let n = 1;
    let remaining = total;
    while (remaining > 0) {
      const capacity = 2 * n * n;
      const fill = Math.min(capacity, remaining);
      shells.push(fill);
      remaining -= fill;
      n++;
    }
    return shells;
  }

  // Create electron objects and position them in shells
  _createElectrons(counts, nucleusRadius) {
    const electrons = [];
    counts.forEach((count, shell) => {
      const orbitR = (shell + 1 + nucleusRadius) * 2;
      const axis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
      const rotAngle = Math.random() * 2 * Math.PI;

      for (let i = 0; i < count; i++) {
        const e = new Electron();
        e.orbitRadius = orbitR;
        e.userData = {
          axis: axis.clone(),
          offset: (i / count) * 2 * Math.PI
        };

        const pos = new THREE.Vector3(
          orbitR * Math.cos(e.userData.offset),
          orbitR * Math.sin(e.userData.offset),
          0
        ).applyAxisAngle(axis, rotAngle);

        e.position.copy(pos);
        electrons.push(e);
        this.add(e);
      }
    });
    return electrons;
  }

  // Update method for animation
  update(time) {
    this.nucleus.setRotationFromAxisAngle(this.nucleusAxis, time * this.nucleusRotationSpeed);

    const speed = 0.8;
    for (const e of this.electrons) {
      const angle = time * speed + e.userData.offset;
      const pos = new THREE.Vector3(
        e.orbitRadius * Math.cos(angle),
        e.orbitRadius * Math.sin(angle),
        0
      ).applyAxisAngle(e.userData.axis, angle);
      e.position.copy(pos);
    }
  }

  arrangeElectrons2D() {
    // Distribute electrons evenly based on their existing shells
    const shells = new Map();

    for (const e of this.electrons) {
      const shell = Math.round((e.orbitRadius / 2) - this.nucleus.getWorldScale(new THREE.Vector3()).x);
      if (!shells.has(shell)) shells.set(shell, []);
      shells.get(shell).push(e);
    }

    // Now reposition electrons in each shell evenly on the X‑Y plane
    shells.forEach((elecs, shell) => {
      const radius = (shell + 1 + this.nucleus.getWorldScale(new THREE.Vector3()).x) * 2;
      const count = elecs.length;
      elecs.forEach((e, i) => {
        const angle = (2 * Math.PI * i) / count;
        e.position.set(
          radius * Math.cos(angle),
          radius * Math.sin(angle),
          0 // Z = 0 for a flat plane
        );
        // Reset userData offset so update() won't override static positions
        e.userData.offset = angle;
        e.userData.axis = new THREE.Vector3(0, 0, 1); // Not used in this mode
      });
    });
  }

}

// Helpers
function fibonacciSpherePoints(N, radius) {
  const pts = [];
  const off = 2 / N;
  const inc = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = (i * off) - 1 + off / 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * inc;
    pts.push(new THREE.Vector3(
      radius * Math.cos(phi) * r,
      radius * Math.sin(phi) * r,
      radius * y
    ));
  }
  return pts;
}

function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

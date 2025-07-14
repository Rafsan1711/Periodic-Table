import * as THREE from './node_modules/three';
import { Proton, Neutron, Electron } from './atom_particles.js';

export class Atom extends THREE.Group {
  constructor(ProtonCount, NeutronCount, ElectronCount) {
    super();
    this.electrons = [];
    this.nucleons = [];

    // Nucleus rotation setup
    this.nucleusAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    this.nucleusRotationSpeed = 0.3 + Math.random() * 0.7;

    this.nucleus = new THREE.Group();
    this.add(this.nucleus);

    // Nucleus and particle radii based on physics
    const A = ProtonCount + NeutronCount; 
    const R0 = 0.4;                                 // IMPORTANT: Adjust this value for realistic nucleus size
    const nucleusRadius = R0 * Math.pow(A, 1 / 3);
    const packingFrac = 0.74;
    const Vnucleus = (4 / 3) * Math.PI * Math.pow(nucleusRadius, 3);
    const volPer = Vnucleus / (A * packingFrac);
    const particleRadius = Math.cbrt((3 * volPer) / (4 * Math.PI));
    const nucleonPositions = fibonacciSpherePoints(A, nucleusRadius);

    // Create nucleons
    for (let i = 0; i < ProtonCount; i++) {
      const p = new Proton(particleRadius);
      this.nucleons.push(p);
    }
    for (let i = 0; i < NeutronCount; i++) {
      const n = new Neutron(particleRadius);
      this.nucleons.push(n);
    }

    // Shuffle & place
    shuffleArray(this.nucleons);
    this.nucleons.forEach((nuc, i) => {
      const pos = nucleonPositions[i];
      nuc.position.copy(pos);
      this.nucleus.add(nuc);
    });

    // Electron shells
    let electronsLeft = ElectronCount;
    let shell = 1;

    while (electronsLeft > 0) {
      const cap = 2 * shell * shell;
      const count = Math.min(cap, electronsLeft);
      const orbitR = (shell + nucleusRadius) * 2;
      const axis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
      const rotAngle = Math.random() * Math.PI * 2;

      for (let i = 0; i < count; i++) {
        const e = new Electron();
        e.orbitRadius = orbitR;
        e.userData = {
          axis: axis.clone(),
          offset: (i / count) * Math.PI * 2
        };

        const pos = new THREE.Vector3(
          orbitR * Math.cos(e.userData.offset),
          orbitR * Math.sin(e.userData.offset),
          0
        ).applyAxisAngle(axis, rotAngle);

        e.position.copy(pos);
        this.electrons.push(e);
        this.add(e);
      }

      electronsLeft -= count;
      shell++;
    }
  }

  update(time) {
    this.nucleus.setRotationFromAxisAngle(this.nucleusAxis, time * this.nucleusRotationSpeed);

    for (const e of this.electrons) {
      const speed = 0.8;
      const angle = time * speed + e.userData.offset;
      const pos = new THREE.Vector3(
        e.orbitRadius * Math.cos(angle),
        e.orbitRadius * Math.sin(angle),
        0
      ).applyAxisAngle(e.userData.axis, angle);
      e.position.copy(pos);
    }
  }
}

// Helpers unchanged
function fibonacciSpherePoints(N, radius) {
  const pts = [];
  const off = 2 / N;
  const inc = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = (i * off) - 1 + (off / 2);
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

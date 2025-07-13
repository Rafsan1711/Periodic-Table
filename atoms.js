import * as THREE from './node_modules/three';
import { Proton, Neutron, Electron } from './atom_particles.js';

export class Atom extends THREE.Group {
    constructor(ProtonCount, NeutronCount, ElectronCount) {
        super();
        this.protons = [];
        this.neutrons = [];
        this.electrons = [];

        // Create protons
        for (let i = 0; i < ProtonCount; i++) {
            const proton = new Proton();
            this.protons.push(proton);
            this.add(proton);
        }

        // Create neutrons
        for (let i = 0; i < NeutronCount; i++) {
            const neutron = new Neutron();
            this.neutrons.push(neutron);
            this.add(neutron);
        }

        // Create electrons
        for (let i = 0; i < ElectronCount; i++) {
            const electron = new Electron();
            electron.position.x = electron.orbitRadius * Math.cos((i / ElectronCount) * 2 * Math.PI);
            electron.position.y = electron.orbitRadius * Math.sin((i / ElectronCount) * 2 * Math.PI);
            this.electrons.push(electron);
            this.add(electron);
        }

    }
}
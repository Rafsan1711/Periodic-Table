import * as THREE from './node_modules/three';

export class Proton extends THREE.Mesh {
    constructor() {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        super(geometry, material);
        this.name = 'Proton';
    }
}

//--------------------------------------------------------------------------------------------------------------------------------------------

export class Neutron extends THREE.Mesh {
    constructor() {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        super(geometry, material);
        this.name = 'Neutron';
    }
}

//--------------------------------------------------------------------------------------------------------------------------------------------

export class Electron extends THREE.Mesh {
    constructor() {
        const geometry = new THREE.SphereGeometry(0.2, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        super(geometry, material);
        this.name = 'Electron';
        this.orbitRadius = 5; // Default orbit radius
    }
}
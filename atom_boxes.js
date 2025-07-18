import * as THREE from './node_modules/three';


// 19 horrizontal, 10 vertical

export class AtomBox extends THREE.Group {
    constructor(atom, position, color){
        super();
        this.atom = atom;
        this.position.copy(position);
        this.color = color; // Default to white if no color is provided
        this.createBox();

        this.atom.position.copy(this.position) // Center the atom within the box
        this.add(this.atom);
    }

    // Method to create a transparent colored box for the atom
    createBox(size = 20) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.15
        });
        const box = new THREE.Mesh(geometry, material);
        box.position.copy(this.position);
        this.add(box);
    }
}
import * as THREE from 'three';
import { Atom } from './atoms.js';

let renderer, scene, camera, raycaster;

const atom = new Atom(
    "h",
    "hydrogen",
    1,
    0,
    [2]); // Symbol, name, atomic number, neutrons, electrons 79, 118, 79

init();
animate();


function init() {

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    camera.position.set(0, 0, 60);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Example: Atom creation
    // const atom = new Atom(1, 1, 28); // 1 Proton, 1 Neutron, 2 Electrons
    atom.position.set(0, 0, 0);
    scene.add(atom);
    
    // EventListeners
    window.addEventListener('resize', onWindowResize);
}


function animate() {
    requestAnimationFrame(animate);
    render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    const time = performance.now() * 0.001;
    atom.update(time);
    atom.arrangeElectrons2D();
    renderer.render(scene, camera);
}
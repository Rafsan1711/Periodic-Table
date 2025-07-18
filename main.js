import * as THREE from 'three';
import { Atom } from './atoms.js';
import { AtomBox } from './atom_boxes.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

let renderer, scene, camera, controls,raycaster;

const pointer = new THREE.Vector2();

let mouseDown = false;
let mouseMoved = false;
let mouseDownPos = { x: 0, y: 0 };

const boxPositionsArray = boxPositions();
const atomBoxes = addAtomBoxes(boxPositionsArray)

init();
animate();


function init() {

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        80, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    camera.position.set(0, 0, 50);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY };
    controls.minDistance = 50;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = THREE.MathUtils.degToRad(90);
    controls.panSpeed = 1;

    // Example: Atom creation
    // atomBoxes.forEach(function(box){
    //     scene.add(box)
    // });
    
    // EventListeners
    window.addEventListener('resize', onWindowResize);

    document.addEventListener('mousedown', (event) => {
    mouseDown = true;
    mouseMoved = false;
    mouseDownPos = { x: event.clientX, y: event.clientY };
    });
    document.addEventListener('mousemove', (event) => {
        if (mouseDown) {
            const dx = event.clientX - mouseDownPos.x;
            const dy = event.clientY - mouseDownPos.y;
            if (Math.sqrt(dx*dx + dy*dy) > 5) {
                mouseMoved = true;
            }
        }
    });
    document.addEventListener('mouseup', (event) => {
        mouseDown = false;
        if (!mouseMoved) {
            onClick(event);
        }
    });

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
    // atom.update(time);
    // atom.arrangeElectrons2D();
    renderer.render(scene, camera);
}

function boxPositions(){
    const positions = [];
    const rows = 19;
    const cols = 10;
    const spacing = 11; // Adjust spacing as needed

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            positions.push(new THREE.Vector3(
                (i - rows / 2) * spacing,
                (j - cols / 2) * spacing,
                -50
            ));
        }
    }
    return positions;
}
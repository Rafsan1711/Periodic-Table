import * as THREE from './node_modules/three';
import { Atom } from './atoms.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

let renderer, scene, camera, controls,raycaster;

const pointer = new THREE.Vector2();

let mouseDown = false;
let mouseMoved = false;
let mouseDownPos = { x: 0, y: 0 };

let currentAtom = null;

init();
animate();


function init() {

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xff9ce6);
    //----------------------------------------------------------------------------------
    
    // Renderer setup
    const container = document.getElementById('atom-3d');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    //----------------------------------------------------------------------------------

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        100, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    camera.position.set(0, 0, 50);
    //----------------------------------------------------------------------------------
    
    //Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY };
    controls.minDistance = 10;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = THREE.MathUtils.degToRad(90);
    controls.panSpeed = 1;
    //----------------------------------------------------------------------------------    
    
    // EventListeners
    window.addEventListener('resize', onWindowResize);
    //----------------------------------------------------------------------------------
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
    //----------------------------------------------------------------------------------

    // Listen for clicks on periodic table elements
    document.querySelectorAll('.element').forEach(el => {
        el.addEventListener('click', () => {
            // Get element data
            const symbol = el.getAttribute('data-symbol');
            const name = el.getAttribute('title');
            const atomicNumber = parseInt(el.getAttribute('data-number'));
            // For demo, neutrons = atomicNumber (real data would be better)
            const atomicWeight = parseFloat(el.getAttribute('data-weight')) || atomicNumber;
            const neutrons = atomicWeight - atomicNumber;

            // Remove previous atom from scene
            if (currentAtom) {
                scene.remove(currentAtom);
            }

            // Create and add new atom
            currentAtom = new Atom(symbol, name, atomicNumber, neutrons);
            currentAtom.position.set(0, 0, 0);
            scene.add(currentAtom);

            // Show sidebar and update info
            document.getElementById('sidebar').classList.add('active');
            showAtomInfo(symbol, name, atomicNumber, atomicWeight);
            fetchWikipediaInfo(name);
        });
    });

    document.getElementById('close-sidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
        if (currentAtom) {
            scene.remove(currentAtom);
            currentAtom = null;
        }
    });

    document.addEventListener('mousedown', (event) => {
        const sidebar = document.getElementById('sidebar');
        const periodicTable = document.querySelector('.periodic-table');
        // If sidebar is open, and click is outside sidebar and not on a periodic table element
        if (
            sidebar.classList.contains('active') &&
            !sidebar.contains(event.target) &&
            !(event.target.closest('.element'))
        ) {
            sidebar.classList.remove('active');
            if (currentAtom) {
                scene.remove(currentAtom);
                currentAtom = null;
            }
        }
    });

    document.getElementById('toggle-arranged').addEventListener('change', () => {
        render();
    });

    onWindowResize();
}

function onWindowResize() {
    const container = document.getElementById('atom-3d');
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
}

function render() {
    const time = performance.now() * 0.001;
    if (currentAtom) {
        const arranged = document.getElementById('toggle-arranged').checked;
        if (arranged && typeof currentAtom.arrangeElectrons2D === 'function') {
            currentAtom.arrangeElectrons2D();
        } else {
            currentAtom.update(time);
        }
    }
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function showAtomInfo(symbol, name, atomicNumber, atomicWeight) {
    document.getElementById('atom-symbol').textContent = symbol;
    document.getElementById('atom-name').textContent = name;
    document.getElementById('atom-number').textContent = `Atomic Number: ${atomicNumber}`;
    document.getElementById('atom-weight').textContent = `Atomic weight: ${atomicWeight}`;
}

function fetchWikipediaInfo(name) {
    const wikiDiv = document.getElementById('atom-wiki');
    wikiDiv.textContent = 'Loading Wikipedia info...';
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`)
        .then(res => res.json())
        .then(data => {
            if (data.extract) {
                wikiDiv.innerHTML = `<p>${data.extract}</p><a href="https://en.wikipedia.org/wiki/${encodeURIComponent(name)}" target="_blank">Read more on Wikipedia</a>`;
            } else {
                wikiDiv.textContent = 'No Wikipedia info found.';
            }
        })
        .catch(() => {
            wikiDiv.textContent = 'Failed to load Wikipedia info.';
        });
}

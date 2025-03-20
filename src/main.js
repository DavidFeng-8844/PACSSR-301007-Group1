import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 20, 30);

// Add Lighting
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, 10, 10);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(gridHelper);
scene.add(lightHelper);

// Add controls
const controls = new OrbitControls(camera, renderer.domElement);

// Load a background image
const myTexture = new THREE.TextureLoader().load('src/pexels-anniroenkae-2832432.jpg');
scene.background = myTexture;

// Add a plate from stl in the middle of the scene
function loadPlateModel(url, position, scale) {
  const loader = new STLLoader();
  loader.load(url, function (geometry) {
    const texture = new THREE.TextureLoader().load('src/space.jpg');
    const material = new THREE.MeshStandardMaterial({ map: texture});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.scale.set(scale.x, scale.y, scale.z);
    mesh.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(mesh);
  });
}

// Adjust the plate position
loadPlateModel('src/models/plate.stl', new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0.5, 0.5, 0.5));

// Variables for pastries
const pastries = [];
const fallSpeed = 0.01;
const bounceFactor = 0.7;
const plateY = -0.5;
const pastryCount = 5; // Number of each type of pastry
const gravity = -0.001;

const pastryModels = [
  { name: 'Cookie', scale: new THREE.Vector3(0.1, 0.1, 0.1) },
  { name: 'bearCookie', scale: new THREE.Vector3(0.8, 0.8, 0.8) },
  { name: 'cake', scale: new THREE.Vector3(0.1, 0.1, 0.1) },
  { name: 'cupcake', scale: new THREE.Vector3(0.1, 0.1, 0.1) },
  { name: 'mooncake', scale: new THREE.Vector3(0.1, 0.1, 0.1) }
];

function loadPastryModel(modelInfo) {
  const loader = new STLLoader();
  loader.load(`src/models/${modelInfo.name}.stl`, function (geometry) {
    const texture = new THREE.TextureLoader().load('src/space.jpg');
    const material = new THREE.MeshStandardMaterial({ map: texture });
    
    for (let i = 0; i < pastryCount; i++) {
      const pastry = new THREE.Mesh(geometry, material);
      pastry.position.set(
        THREE.MathUtils.randFloatSpread(20),
        10 + Math.random() * 20,
        THREE.MathUtils.randFloatSpread(10)
      );
      pastry.scale.copy(modelInfo.scale);
      pastry.rotation.set(-Math.PI / 2, 0, 0);
      scene.add(pastry);

      pastries.push({ mesh: pastry, velocity: 0 });
    }
  });
}

// Load all pastry models
pastryModels.forEach(loadPastryModel);

// Animate function
function animate() {
  requestAnimationFrame(animate);
  pastries.forEach((pastry) => {
    // Apply gravity
    pastry.velocity += gravity;
    pastry.mesh.position.y += pastry.velocity;

    // Check for bounce
    if (pastry.mesh.position.y <= plateY + 1) {
      pastry.mesh.position.y = plateY + 1;
      pastry.velocity *= -bounceFactor;
      
      // Add a minimum bounce threshold to eventually stop bouncing
      if (Math.abs(pastry.velocity) < 0.01) {
        pastry.velocity = 0;
      }
    }

    // Rotate the pastry only if it's still moving
    if (Math.abs(pastry.velocity) > 0.01) {
      pastry.mesh.rotation.x += 0.01;
      pastry.mesh.rotation.y += 0.01;
    }
  });
  controls.update();
  renderer.render(scene, camera);
}
animate();
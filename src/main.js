import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(20, 30, 10);

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
const myTexture = new THREE.TextureLoader().load('textures/colorful.jpg');
// const myTexture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}textures/colorful.jpg`);

scene.background = myTexture;

// Add a plate from obj in the middle of the scene
function loadPlateModel(url, position, scale) {
  const loader = new OBJLoader();
  loader.load(url, function (object) {
    const texture = new THREE.TextureLoader().load('textures/plate.png');
    // const texture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}src/textures/plate.png`);
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ map: texture });
      }
    });
    object.position.copy(position);
    object.scale.set(scale.x, scale.y, scale.z);
    object.rotation.set(Math.PI / 1000, 0, 0);
    scene.add(object);
  });
}

// Adjust the plate position
loadPlateModel('models/plate.obj', new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0.5, 0.5, 0.5));
// loadPlateModel(`${import.meta.env.BASE_URL}/src/models/plate.obj`, new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0.5, 0.5, 0.5));

// Variables for pastries
const pastries = [];
const fallSpeed = 0.01;
const bounceFactor = 0.7;
const plateY = -0.5;
const pastryCount = 5; // Number of each type of pastry
const gravity = -0.001;

const pastryModels = [
  { name: 'Cookie', scale: new THREE.Vector3(0.2, 0.2, 0.2) },
  { name: 'bearCookie', scale: new THREE.Vector3(0.4, 0.4, 0.4) },
  { name: 'cake', scale: new THREE.Vector3(0.1, 0.1, 0.1) },
  { name: 'cupcake', scale: new THREE.Vector3(0.1, 0.1, 0.1) },
  { name: 'mooncake', scale: new THREE.Vector3(0.3, 0.3, 0.3) }
];

function loadPastryModel(modelInfo) {
  const loader = new OBJLoader();
  loader.load(`models/${modelInfo.name}.obj`, function (object) {
  // loader.load(`${import.meta.env.BASE_URL}src/models/${modelInfo.name}.obj`, function (object) {
    const texture = new THREE.TextureLoader().load(`textures/${modelInfo.name}.png`);
    // const texture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}src/textures/${modelInfo.name}.png`);
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ map: texture });
      }
    });
    
    for (let i = 0; i < pastryCount; i++) {
      const pastry = object.clone();
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

// Restart 
function resetPastries() {
  pastries.forEach((pastry) => {
    pastry.mesh.position.set(
      THREE.MathUtils.randFloatSpread(20),
      10 + Math.random() * 20,
      THREE.MathUtils.randFloatSpread(10)
    );
    pastry.velocity = 0;
    pastry.mesh.rotation.set(-Math.PI / 2, 0, 0);
  });
}

// Load all pastry models
pastryModels.forEach(loadPastryModel);

// Animate function
function animate() {
  requestAnimationFrame(animate);
  if (pastries.length > 0) {
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
  }
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Add Mouse Event Listender
document.addEventListener('mousemove', onMouseMove);

function onMouseMove(event) {
  const description = document.getElementById('description');
  const threshold = window.innerHeight - 100; // 100px to the bottom

  if (event.clientY > threshold) {
    description.style.bottom = '0';
  } else {
    description.style.bottom = '-200px';
  }
}

window.addEventListener('resize', onWindowResize);
document.getElementById('resetButton').addEventListener('click', resetPastries);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

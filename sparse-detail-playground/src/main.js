
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1117);

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 3.5);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.querySelector('#app').appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(
  camera,
  renderer.domElement
);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;

// Responsive Window
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});

// Global lighting
const ambientLight = new THREE.HemisphereLight(
  0xffffff,
  0x353545,
  2
);
scene.add(ambientLight);

// Directional light
const mainLight = new THREE.DirectionalLight(
  0xffffff,
  2
);
mainLight.position.set(3, 4, 5);
mainLight.target.position.set(0, 0, 0);
scene.add(mainLight);
scene.add(mainLight.target);

// Directional light helper
const lightHelper = new THREE.DirectionalLightHelper(
  mainLight,
  0.5,
  0xffff00
);
scene.add(lightHelper);

// Sphere Geometry
const geometry = new THREE.SphereGeometry(1, 256, 256);

// Textures
geometry.setAttribute(
  'uv2',
  new THREE.BufferAttribute(geometry.attributes.uv.array, 2)
);

const textureLoader = new THREE.TextureLoader();

Promise.all([
  textureLoader.loadAsync('/Textures/Rock035_4K-PNG_Color.png'),
  textureLoader.loadAsync('/Textures/Rock035_4K-PNG_NormalGL.png'),
  textureLoader.loadAsync('/Textures/Rock035_4K-PNG_Roughness.png'),
  textureLoader.loadAsync('/Textures/Rock035_4K-PNG_AmbientOcclusion.png'),
  textureLoader.loadAsync('/Textures/Rock035_4K-PNG_Displacement.png')
])
  .then(([colorTexture, normalTexture, roughnessTexture, aoTexture, displacementTexture]) => {
    // Colour textures use the sRGB colour space.
    colorTexture.colorSpace = THREE.SRGBColorSpace;

    // Material
    const material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      aoMap: aoTexture,
      aoMapIntensity: 2,
      roughness: 0.85,
      displacementMap: displacementTexture,
      displacementScale: 0.08,
      displacementBias: -0.04,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
  })
  .catch((error) => {
    console.error('Failed to load the material textures:', error);
  });

// Render Loop
renderer.setAnimationLoop(() => {
  controls.update();
  lightHelper.update();
  renderer.render(scene, camera);
});

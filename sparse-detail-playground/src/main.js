
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera
const viewport = document.querySelector('#viewport');

const camera = new THREE.PerspectiveCamera(
  45,
  viewport.clientWidth / viewport.clientHeight,
  0.1,
  100
);

camera.position.set(0, 1.1, 4.5);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(viewport.clientWidth, viewport.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

viewport.appendChild(renderer.domElement);

// Camera controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.target.set(0, -0.05, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;

controls.minAzimuthAngle = -0.85;
controls.maxAzimuthAngle = 0.85;
controls.minPolarAngle = 0.55;
controls.maxPolarAngle = 1.65;
controls.minDistance = 3.5;
controls.maxDistance = 7.5;

const baseRotateSpeed = 0.8;
const baseZoomSpeed = 0.8;
const angleSoftZone = THREE.MathUtils.degToRad(18);
const distanceSoftZone = 0.8;

controls.rotateSpeed = baseRotateSpeed;
controls.zoomSpeed = baseZoomSpeed;
controls.update();

// Room dimensions
const floorY = -1.05;
const roomRadius = 3;
const wallHeight = 3;
const wallWidth = Math.sqrt(2) * roomRadius;
const wallThickness = 0.35;
const floorThickness = 0.18;

// Floor material
const floorMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x101b2c,
  roughness: 0.28,
  metalness: 0.04,
  clearcoat: 0.4,
  clearcoatRoughness: 0.16
});

// Wall materials
const wallEdgeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x0b1423,
  roughness: 0.16,
  metalness: 0.04,
  clearcoat: 0.8,
  clearcoatRoughness: 0.05
});

const wallBackMaterial = new THREE.MeshStandardMaterial({
  color: 0x080e18,
  roughness: 0.4,
  metalness: 0.02
});

const leftWallMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x14243b,
  roughness: 0.1,
  metalness: 0.03,
  clearcoat: 1,
  clearcoatRoughness: 0.035
});

const rightWallMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x1a2e49,
  roughness: 0.1,
  metalness: 0.03,
  clearcoat: 1,
  clearcoatRoughness: 0.035
});

// Solid floor
const floorShape = new THREE.Shape();

floorShape.moveTo(0, -roomRadius);
floorShape.lineTo(roomRadius, 0);
floorShape.lineTo(0, roomRadius);
floorShape.lineTo(-roomRadius, 0);
floorShape.closePath();

const floorGeometry = new THREE.ExtrudeGeometry(floorShape, {
  depth: floorThickness,
  bevelEnabled: false
});

floorGeometry.rotateX(-Math.PI / 2);

const floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.position.y = floorY - floorThickness;
floor.receiveShadow = true;

scene.add(floor);

// Solid walls with visible thickness
const wallGeometry = new THREE.BoxGeometry(
  wallWidth,
  wallHeight,
  wallThickness
);

const wallCenterY = floorY + wallHeight / 2;
const wallCenterZ = -roomRadius / 2;

const leftWall = new THREE.Mesh(wallGeometry, [
  wallEdgeMaterial,
  wallEdgeMaterial,
  wallEdgeMaterial,
  wallEdgeMaterial,
  leftWallMaterial,
  wallBackMaterial
]);

leftWall.position.set(
  -roomRadius / 2,
  wallCenterY,
  wallCenterZ
);

leftWall.rotation.y = Math.PI / 4;
leftWall.castShadow = true;
leftWall.receiveShadow = true;

scene.add(leftWall);

const rightWall = new THREE.Mesh(wallGeometry, [
  wallEdgeMaterial,
  wallEdgeMaterial,
  wallEdgeMaterial,
  wallEdgeMaterial,
  rightWallMaterial,
  wallBackMaterial
]);

rightWall.position.set(
  roomRadius / 2,
  wallCenterY,
  wallCenterZ
);

rightWall.rotation.y = -Math.PI / 4;
rightWall.castShadow = true;
rightWall.receiveShadow = true;

scene.add(rightWall);

// Focused spotlight
const mainLight = new THREE.SpotLight(0xffffff, 140);

mainLight.position.set(-2, 3.5, 4.5);
mainLight.target.position.set(0, floorY + 0.65, -1.5);

mainLight.angle = 0.32;
mainLight.penumbra = 0.18;
mainLight.decay = 2;
mainLight.distance = 0;
mainLight.castShadow = true;

mainLight.shadow.mapSize.set(2048, 2048);
mainLight.shadow.camera.near = 0.1;
mainLight.shadow.camera.far = 20;
mainLight.shadow.bias = -0.0001;
mainLight.shadow.normalBias = 0.03;
mainLight.shadow.radius = 3;

scene.add(mainLight);
scene.add(mainLight.target);

// Sphere geometry
const geometry = new THREE.SphereGeometry(1, 256, 256);

geometry.setAttribute(
  'uv2',
  new THREE.BufferAttribute(geometry.attributes.uv.array, 2)
);

// Load material textures
const textureLoader = new THREE.TextureLoader();

let sphere = null;

Promise.all([
  textureLoader.loadAsync('/Textures/Rock035_4K-PNG_Color.png'),
  textureLoader.loadAsync('/Textures/Rock035_4K-PNG_NormalGL.png'),
  textureLoader.loadAsync('/Textures/Rock035_4K-PNG_Roughness.png'),
  textureLoader.loadAsync('/Textures/Rock035_4K-PNG_AmbientOcclusion.png'),
  textureLoader.loadAsync('/Textures/Rock035_4K-PNG_Displacement.png')
])
  .then(([
    colorTexture,
    normalTexture,
    roughnessTexture,
    aoTexture,
    displacementTexture
  ]) => {
    colorTexture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      aoMap: aoTexture,
      aoMapIntensity: 2,
      roughness: 0.85,
      displacementMap: displacementTexture,
      displacementScale: 0.08,
      displacementBias: -0.04
    });

    sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, floorY + 1.04, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    scene.add(sphere);
  })
  .catch((error) => {
    console.error('Failed to load the material textures:', error);
  });

// Shift + left-drag rotates the sphere
let sphereDragging = false;
let spherePointerId = null;
let previousX = 0;
let previousY = 0;

renderer.domElement.addEventListener('pointerdown', (event) => {
  if (!sphere || event.button !== 0 || !event.shiftKey) return;

  sphereDragging = true;
  spherePointerId = event.pointerId;

  previousX = event.clientX;
  previousY = event.clientY;

  controls.enabled = false;

  renderer.domElement.setPointerCapture(event.pointerId);
  renderer.domElement.classList.add('is-dragging');

  event.preventDefault();
}, true);

renderer.domElement.addEventListener('pointermove', (event) => {
  if (
    !sphereDragging ||
    event.pointerId !== spherePointerId ||
    !sphere
  ) {
    return;
  }

  const deltaX = event.clientX - previousX;
  const deltaY = event.clientY - previousY;

  sphere.rotation.y += deltaX * 0.01;
  sphere.rotation.x += deltaY * 0.01;

  previousX = event.clientX;
  previousY = event.clientY;
});

function endSphereDrag(event) {
  if (event.pointerId !== spherePointerId) return;

  sphereDragging = false;
  spherePointerId = null;

  controls.enabled = true;
  renderer.domElement.classList.remove('is-dragging');
}

renderer.domElement.addEventListener('pointerup', endSphereDrag);
renderer.domElement.addEventListener('pointercancel', endSphereDrag);

renderer.domElement.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

// Responsive viewport
window.addEventListener('resize', () => {
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;

  if (width === 0 || height === 0) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});

// Render loop with cushioned camera boundaries
renderer.setAnimationLoop(() => {
  const azimuth = controls.getAzimuthalAngle();
  const polar = controls.getPolarAngle();
  const distance = camera.position.distanceTo(controls.target);

  const azimuthRoom = Math.min(
    azimuth - controls.minAzimuthAngle,
    controls.maxAzimuthAngle - azimuth
  );

  const polarRoom = Math.min(
    polar - controls.minPolarAngle,
    controls.maxPolarAngle - polar
  );

  const angleRoom = Math.min(azimuthRoom, polarRoom);

  const angleFactor = THREE.MathUtils.smoothstep(
    angleRoom,
    0,
    angleSoftZone
  );

  controls.rotateSpeed =
    baseRotateSpeed * Math.max(0.12, angleFactor);

  const distanceRoom = Math.min(
    distance - controls.minDistance,
    controls.maxDistance - distance
  );

  const distanceFactor = THREE.MathUtils.smoothstep(
    distanceRoom,
    0,
    distanceSoftZone
  );

  controls.zoomSpeed =
    baseZoomSpeed * Math.max(0.15, distanceFactor);

  controls.update();
  renderer.render(scene, camera);
});

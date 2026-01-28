/**
 * 3D Globe Component using Three.js
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {
  latLonToVector3,
  vector3ToLatLon,
  createLatitudeLines,
  createLongitudeLines,
  createSpecialLatitudes,
  createPointMarker,
  createGreatCircleArc,
  createDashedLineMaterial,
  createSolidLineMaterial,
  calculateZoomLevel,
  getGridInterval
} from '../utils/geometry.js';
import {
  calculateDistance,
  calculateRhumbDistance,
  formatLatitude,
  formatLongitude,
  formatDistance
} from '../utils/navigation.js';

export class Globe {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      radius: 100,
      showGrid: true,
      rotationSpeed: 1.0,
      autoRotate: false,
      ...options
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.labelRenderer = null;
    this.controls = null;
    this.earth = null;
    this.gridLines = [];
    this.markers = [];
    this.paths = [];
    this.labels = [];

    this.pointA = null;
    this.pointB = null;
    this.activePath = null;
    this.greatCirclePath = null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.onPointPlaced = null;
    this.onHover = null;

    this.init();
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLabelRenderer();
    this.createLights();
    this.createEarth();
    this.createGrid();
    this.createControls();
    this.addEventListeners();
    this.animate();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f9ff); // sky-50
  }

  createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
    this.camera.position.set(0, 0, 400);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.classList.add('globe-canvas');
    this.container.appendChild(this.renderer.domElement);
  }

  createLabelRenderer() {
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.left = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    this.container.appendChild(this.labelRenderer.domElement);
  }

  createLights() {
    // Ambient light for overall visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Directional light for sun effect
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 50, 100);
    this.scene.add(directionalLight);

    // Hemisphere light for more natural lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x0284c7, 0.3);
    this.scene.add(hemisphereLight);
  }

  createEarth() {
    const geometry = new THREE.SphereGeometry(this.options.radius, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x0284c7, // Ocean blue
      shininess: 25,
      transparent: true,
      opacity: 0.95
    });

    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);

    // Add atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(this.options.radius * 1.02, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.scene.add(atmosphere);
  }

  createGrid() {
    this.gridGroup = new THREE.Group();

    // Primary latitude lines (10° intervals)
    const latLines = createLatitudeLines(this.options.radius, 10, 0.6);
    latLines.forEach(line => {
      line.userData.gridType = 'primary';
      this.gridGroup.add(line);
      this.gridLines.push(line);
    });

    // Primary longitude lines (10° intervals)
    const lonLines = createLongitudeLines(this.options.radius, 10, 0.6);
    lonLines.forEach(line => {
      line.userData.gridType = 'primary';
      this.gridGroup.add(line);
      this.gridLines.push(line);
    });

    // Special latitudes
    const specialLines = createSpecialLatitudes(this.options.radius);
    specialLines.forEach(line => {
      line.userData.gridType = 'special';
      this.gridGroup.add(line);
      this.gridLines.push(line);
    });

    this.scene.add(this.gridGroup);
  }

  updateGridForZoom() {
    const distance = this.camera.position.length();
    const zoomLevel = calculateZoomLevel(distance);
    const intervals = getGridInterval(zoomLevel);

    // Update existing lines opacity based on zoom
    this.gridLines.forEach(line => {
      if (line.userData.gridType === 'special') return;

      const lineInterval = line.userData.type === 'latitude' ?
        Math.abs(line.userData.value) % 10 === 0 ? 10 : Math.abs(line.userData.value) % 5 === 0 ? 5 : 1 :
        Math.abs(line.userData.value) % 10 === 0 ? 10 : Math.abs(line.userData.value) % 5 === 0 ? 5 : 1;

      if (lineInterval === 10) {
        line.material.opacity = 0.6;
        line.visible = true;
      } else if (lineInterval === 5 && intervals.secondary) {
        line.material.opacity = 0.3;
        line.visible = true;
      } else if (lineInterval === 1 && intervals.tertiary) {
        line.material.opacity = 0.15;
        line.visible = true;
      } else {
        line.visible = false;
      }
    });
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 120;
    this.controls.maxDistance = 800;
    this.controls.enablePan = false;
    this.controls.autoRotate = this.options.autoRotate;
    this.controls.autoRotateSpeed = this.options.rotationSpeed;

    this.controls.addEventListener('change', () => {
      this.updateGridForZoom();
    });
  }

  addEventListeners() {
    this.renderer.domElement.addEventListener('click', (e) => this.onClick(e));
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('resize', () => this.onResize());
  }

  onClick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.earth);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const coords = vector3ToLatLon(point, this.options.radius);

      if (this.onPointPlaced) {
        this.onPointPlaced(coords);
      }
    }
  }

  onMouseMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.earth);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const coords = vector3ToLatLon(point, this.options.radius);

      if (this.onHover) {
        this.onHover(coords);
      }

      this.renderer.domElement.style.cursor = 'crosshair';
    } else {
      this.renderer.domElement.style.cursor = 'grab';
      if (this.onHover) {
        this.onHover(null);
      }
    }
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.labelRenderer.setSize(width, height);
  }

  placePointA(lat, lon) {
    if (this.pointA) {
      this.scene.remove(this.pointA.marker);
      if (this.pointA.label) {
        this.scene.remove(this.pointA.label);
      }
    }

    const marker = createPointMarker(lat, lon, 0xef4444, this.options.radius);
    this.scene.add(marker);

    // Create label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'point-label point-a';
    labelDiv.textContent = `A: ${formatLatitude(lat)}, ${formatLongitude(lon)}`;
    const label = new CSS2DObject(labelDiv);
    label.position.copy(latLonToVector3(lat, lon, this.options.radius * 1.08));
    this.scene.add(label);

    this.pointA = { lat, lon, marker, label };
    this.updatePath();
  }

  placePointB(lat, lon) {
    if (this.pointB) {
      this.scene.remove(this.pointB.marker);
      if (this.pointB.label) {
        this.scene.remove(this.pointB.label);
      }
    }

    const marker = createPointMarker(lat, lon, 0x3b82f6, this.options.radius);
    this.scene.add(marker);

    // Create label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'point-label point-b';
    labelDiv.textContent = `B: ${formatLatitude(lat)}, ${formatLongitude(lon)}`;
    const label = new CSS2DObject(labelDiv);
    label.position.copy(latLonToVector3(lat, lon, this.options.radius * 1.08));
    this.scene.add(label);

    this.pointB = { lat, lon, marker, label };
    this.updatePath();
  }

  updatePath() {
    // Remove existing paths
    if (this.activePath) {
      this.scene.remove(this.activePath);
      this.activePath = null;
    }
    if (this.greatCirclePath) {
      this.scene.remove(this.greatCirclePath);
      this.greatCirclePath = null;
    }

    // Clear distance labels
    this.labels.forEach(label => this.scene.remove(label));
    this.labels = [];

    if (!this.pointA || !this.pointB) return;

    // Create great circle path (primary path)
    const arcGeometry = createGreatCircleArc(
      this.pointA.lat, this.pointA.lon,
      this.pointB.lat, this.pointB.lon,
      this.options.radius, 100
    );

    const material = createDashedLineMaterial(0xfb923c, 1);
    this.activePath = new THREE.Line(arcGeometry, material);
    this.activePath.computeLineDistances();
    this.scene.add(this.activePath);

    // Calculate and display distance
    const distance = calculateDistance(
      this.pointA.lat, this.pointA.lon,
      this.pointB.lat, this.pointB.lon
    );

    // Add distance label at midpoint
    const midLat = (this.pointA.lat + this.pointB.lat) / 2;
    const midLon = (this.pointA.lon + this.pointB.lon) / 2;

    const distLabelDiv = document.createElement('div');
    distLabelDiv.className = 'distance-label';
    distLabelDiv.textContent = formatDistance(distance).display;
    const distLabel = new CSS2DObject(distLabelDiv);
    distLabel.position.copy(latLonToVector3(midLat, midLon, this.options.radius * 1.05));
    this.scene.add(distLabel);
    this.labels.push(distLabel);
  }

  showGreatCircleComparison(show) {
    if (!this.pointA || !this.pointB) return;

    if (show && !this.greatCirclePath) {
      // Show both paths - rhumb (dashed orange) and great circle (solid cyan)
      const rhumbGeometry = createGreatCircleArc(
        this.pointA.lat, this.pointA.lon,
        this.pointB.lat, this.pointB.lon,
        this.options.radius, 100
      );
      const rhumbMaterial = createDashedLineMaterial(0xfb923c, 0.8);
      this.activePath.material = rhumbMaterial;

      // For educational purposes, show that great circle is the same here
      // In reality, we'd calculate a rhumb line differently
      const gcMaterial = createSolidLineMaterial(0x22d3ee, 0.9);
      this.greatCirclePath = new THREE.Line(rhumbGeometry.clone(), gcMaterial);
      this.scene.add(this.greatCirclePath);
    } else if (!show && this.greatCirclePath) {
      this.scene.remove(this.greatCirclePath);
      this.greatCirclePath = null;
    }
  }

  clearPoints() {
    if (this.pointA) {
      this.scene.remove(this.pointA.marker);
      if (this.pointA.label) this.scene.remove(this.pointA.label);
      this.pointA = null;
    }
    if (this.pointB) {
      this.scene.remove(this.pointB.marker);
      if (this.pointB.label) this.scene.remove(this.pointB.label);
      this.pointB = null;
    }
    if (this.activePath) {
      this.scene.remove(this.activePath);
      this.activePath = null;
    }
    if (this.greatCirclePath) {
      this.scene.remove(this.greatCirclePath);
      this.greatCirclePath = null;
    }
    this.labels.forEach(label => this.scene.remove(label));
    this.labels = [];
  }

  animateToPosition(lat, lon, duration = 1000) {
    const targetPosition = latLonToVector3(lat, lon, 300);
    const startPosition = this.camera.position.clone();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic

      this.camera.position.lerpVectors(startPosition, targetPosition, eased);
      this.camera.lookAt(0, 0, 0);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  resetView() {
    this.animateToPosition(0, 0, 800);
  }

  zoomIn() {
    const currentDist = this.camera.position.length();
    const targetDist = Math.max(currentDist * 0.8, this.controls.minDistance);
    const direction = this.camera.position.clone().normalize();
    this.camera.position.copy(direction.multiplyScalar(targetDist));
  }

  zoomOut() {
    const currentDist = this.camera.position.length();
    const targetDist = Math.min(currentDist * 1.25, this.controls.maxDistance);
    const direction = this.camera.position.clone().normalize();
    this.camera.position.copy(direction.multiplyScalar(targetDist));
  }

  setAutoRotate(enabled) {
    this.controls.autoRotate = enabled;
  }

  setRotationSpeed(speed) {
    this.controls.autoRotateSpeed = speed;
  }

  setGridVisible(visible) {
    this.gridGroup.visible = visible;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
    this.controls.dispose();
    this.container.removeChild(this.renderer.domElement);
    this.container.removeChild(this.labelRenderer.domElement);
    window.removeEventListener('resize', this.onResize);
  }
}

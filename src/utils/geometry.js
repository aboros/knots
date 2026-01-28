/**
 * Three.js geometry utility functions
 */

import * as THREE from 'three';

const DEG_TO_RAD = Math.PI / 180;

/**
 * Convert latitude/longitude to 3D coordinates on a sphere
 */
export function latLonToVector3(lat, lon, radius = 100) {
  const phi = (90 - lat) * DEG_TO_RAD;
  const theta = (lon + 180) * DEG_TO_RAD;

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

/**
 * Convert 3D coordinates to latitude/longitude
 */
export function vector3ToLatLon(vector, radius = 100) {
  const normalized = vector.clone().normalize();

  const lat = 90 - Math.acos(normalized.y) / DEG_TO_RAD;
  let lon = Math.atan2(normalized.z, -normalized.x) / DEG_TO_RAD - 180;

  // Normalize longitude to -180 to 180
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;

  return { lat, lon };
}

/**
 * Create a great circle arc between two points
 */
export function createGreatCircleArc(lat1, lon1, lat2, lon2, radius = 100, segments = 64) {
  const points = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = interpolateGreatCircle(lat1, lon1, lat2, lon2, t);
    points.push(latLonToVector3(point.lat, point.lon, radius * 1.001)); // Slightly above surface
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return geometry;
}

/**
 * Interpolate a point along a great circle
 */
export function interpolateGreatCircle(lat1, lon1, lat2, lon2, t) {
  const lat1Rad = lat1 * DEG_TO_RAD;
  const lon1Rad = lon1 * DEG_TO_RAD;
  const lat2Rad = lat2 * DEG_TO_RAD;
  const lon2Rad = lon2 * DEG_TO_RAD;

  // Calculate angular distance
  const d = 2 * Math.asin(Math.sqrt(
    Math.pow(Math.sin((lat2Rad - lat1Rad) / 2), 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.pow(Math.sin((lon2Rad - lon1Rad) / 2), 2)
  ));

  if (d === 0) {
    return { lat: lat1, lon: lon1 };
  }

  const a = Math.sin((1 - t) * d) / Math.sin(d);
  const b = Math.sin(t * d) / Math.sin(d);

  const x = a * Math.cos(lat1Rad) * Math.cos(lon1Rad) + b * Math.cos(lat2Rad) * Math.cos(lon2Rad);
  const y = a * Math.cos(lat1Rad) * Math.sin(lon1Rad) + b * Math.cos(lat2Rad) * Math.sin(lon2Rad);
  const z = a * Math.sin(lat1Rad) + b * Math.sin(lat2Rad);

  const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) / DEG_TO_RAD;
  const lon = Math.atan2(y, x) / DEG_TO_RAD;

  return { lat, lon };
}

/**
 * Create latitude grid lines
 */
export function createLatitudeLines(radius = 100, interval = 10, opacity = 0.4) {
  const lines = [];

  for (let lat = -90 + interval; lat < 90; lat += interval) {
    const points = [];
    const segments = 64;

    for (let i = 0; i <= segments; i++) {
      const lon = (i / segments) * 360 - 180;
      points.push(latLonToVector3(lat, lon, radius * 1.001));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: lat === 0 ? 0xfbbf24 : 0x38bdf8, // Yellow for equator, blue otherwise
      transparent: true,
      opacity: lat === 0 ? 0.8 : opacity,
      linewidth: lat === 0 ? 2 : 1
    });

    const line = new THREE.Line(geometry, material);
    line.userData = { type: 'latitude', value: lat };
    lines.push(line);
  }

  return lines;
}

/**
 * Create longitude grid lines
 */
export function createLongitudeLines(radius = 100, interval = 10, opacity = 0.4) {
  const lines = [];

  for (let lon = -180; lon < 180; lon += interval) {
    const points = [];
    const segments = 64;

    for (let i = 0; i <= segments; i++) {
      const lat = (i / segments) * 180 - 90;
      points.push(latLonToVector3(lat, lon, radius * 1.001));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: lon === 0 ? 0xfbbf24 : 0x38bdf8, // Yellow for prime meridian
      transparent: true,
      opacity: lon === 0 ? 0.8 : opacity,
      linewidth: lon === 0 ? 2 : 1
    });

    const line = new THREE.Line(geometry, material);
    line.userData = { type: 'longitude', value: lon };
    lines.push(line);
  }

  return lines;
}

/**
 * Create special latitude circles (tropics, polar circles)
 */
export function createSpecialLatitudes(radius = 100) {
  const specialLats = [
    { lat: 23.5, name: 'Tropic of Cancer', color: 0xfb923c },
    { lat: -23.5, name: 'Tropic of Capricorn', color: 0xfb923c },
    { lat: 66.5, name: 'Arctic Circle', color: 0xa5f3fc },
    { lat: -66.5, name: 'Antarctic Circle', color: 0xa5f3fc }
  ];

  const lines = [];

  for (const spec of specialLats) {
    const points = [];
    const segments = 64;

    for (let i = 0; i <= segments; i++) {
      const lon = (i / segments) * 360 - 180;
      points.push(latLonToVector3(spec.lat, lon, radius * 1.001));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
      color: spec.color,
      transparent: true,
      opacity: 0.5,
      dashSize: 3,
      gapSize: 2
    });

    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    line.userData = { type: 'special', name: spec.name, lat: spec.lat };
    lines.push(line);
  }

  return lines;
}

/**
 * Create a point marker (pin)
 */
export function createPointMarker(lat, lon, color = 0xef4444, radius = 100) {
  const group = new THREE.Group();

  // Pin body (cone pointing down)
  const pinGeometry = new THREE.ConeGeometry(1.5, 4, 16);
  const pinMaterial = new THREE.MeshPhongMaterial({
    color: color,
    shininess: 80
  });
  const pin = new THREE.Mesh(pinGeometry, pinMaterial);
  pin.rotation.x = Math.PI; // Point downward

  // Pin sphere (top)
  const sphereGeometry = new THREE.SphereGeometry(1.2, 16, 16);
  const sphere = new THREE.Mesh(sphereGeometry, pinMaterial);
  sphere.position.y = 3;

  group.add(pin);
  group.add(sphere);

  // Position on globe
  const position = latLonToVector3(lat, lon, radius);
  group.position.copy(position);

  // Orient to point away from center
  group.lookAt(0, 0, 0);
  group.rotateX(Math.PI / 2);

  // Move up so pin appears to stick into globe
  const normal = position.clone().normalize();
  group.position.add(normal.multiplyScalar(2));

  group.userData = { lat, lon };

  return group;
}

/**
 * Create distance markers along a path
 */
export function createDistanceMarkers(pathPoints, intervalNM = 10, radius = 100) {
  const markers = [];
  let totalDistance = 0;

  for (let i = 1; i < pathPoints.length; i++) {
    const prevPoint = pathPoints[i - 1];
    const currPoint = pathPoints[i];

    // Approximate segment distance
    const segmentDist = Math.sqrt(
      Math.pow(currPoint.lat - prevPoint.lat, 2) +
      Math.pow((currPoint.lon - prevPoint.lon) * Math.cos(currPoint.lat * Math.PI / 180), 2)
    ) * 60; // Convert to approximate nm

    totalDistance += segmentDist;

    if (Math.floor(totalDistance / intervalNM) > Math.floor((totalDistance - segmentDist) / intervalNM)) {
      const markerGeometry = new THREE.SphereGeometry(0.8, 8, 8);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xfb923c });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);

      const position = latLonToVector3(currPoint.lat, currPoint.lon, radius * 1.02);
      marker.position.copy(position);

      marker.userData = {
        distance: Math.round(totalDistance / intervalNM) * intervalNM
      };

      markers.push(marker);
    }
  }

  return markers;
}

/**
 * Create a dashed line material for paths
 */
export function createDashedLineMaterial(color = 0xfb923c, opacity = 1) {
  return new THREE.LineDashedMaterial({
    color: color,
    transparent: opacity < 1,
    opacity: opacity,
    dashSize: 3,
    gapSize: 2,
    linewidth: 2
  });
}

/**
 * Create a solid line material
 */
export function createSolidLineMaterial(color = 0x22d3ee, opacity = 1) {
  return new THREE.LineBasicMaterial({
    color: color,
    transparent: opacity < 1,
    opacity: opacity,
    linewidth: 2
  });
}

/**
 * Create coordinate labels at major intersections
 */
export function createCoordinateLabels(radius = 100, latInterval = 30, lonInterval = 30) {
  const labels = [];

  for (let lat = -60; lat <= 60; lat += latInterval) {
    for (let lon = -180; lon < 180; lon += lonInterval) {
      if (lat === 0 && lon === 0) continue; // Skip origin

      const position = latLonToVector3(lat, lon, radius * 1.02);
      labels.push({
        lat,
        lon,
        position,
        text: `${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon)}°${lon >= 0 ? 'E' : 'W'}`
      });
    }
  }

  return labels;
}

/**
 * Calculate camera distance for zoom level
 */
export function calculateZoomLevel(cameraDistance) {
  if (cameraDistance > 600) return 'far';
  if (cameraDistance > 300) return 'medium';
  return 'close';
}

/**
 * Get grid interval based on zoom level
 */
export function getGridInterval(zoomLevel) {
  switch (zoomLevel) {
    case 'far': return { primary: 10, secondary: null, tertiary: null };
    case 'medium': return { primary: 10, secondary: 5, tertiary: null };
    case 'close': return { primary: 10, secondary: 5, tertiary: 1 };
    default: return { primary: 10, secondary: null, tertiary: null };
  }
}

/**
 * Get grid opacity based on zoom level and line type
 */
export function getGridOpacity(lineType, zoomLevel) {
  const opacities = {
    primary: 0.6,
    secondary: 0.3,
    tertiary: 0.15
  };

  return opacities[lineType] || 0.4;
}

/**
 * Navigation utility functions for nautical calculations
 */

// Constants
export const EARTH_RADIUS_NM = 3440.065; // Earth's radius in nautical miles
export const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers
export const NM_TO_KM = 1.852; // Nautical miles to kilometers conversion
export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

/**
 * Convert degrees and minutes to decimal degrees
 */
export function dmToDecimal(degrees, minutes, direction) {
  const decimal = Math.abs(degrees) + minutes / 60;
  return (direction === 'S' || direction === 'W') ? -decimal : decimal;
}

/**
 * Convert decimal degrees to degrees and minutes
 */
export function decimalToDM(decimal) {
  const isNegative = decimal < 0;
  const absDecimal = Math.abs(decimal);
  const degrees = Math.floor(absDecimal);
  const minutes = (absDecimal - degrees) * 60;
  return { degrees, minutes: Math.round(minutes * 100) / 100, isNegative };
}

/**
 * Format latitude as string (e.g., "45°30'N")
 */
export function formatLatitude(decimal) {
  const { degrees, minutes, isNegative } = decimalToDM(decimal);
  const direction = isNegative ? 'S' : 'N';
  return `${degrees}°${minutes.toFixed(1)}'${direction}`;
}

/**
 * Format longitude as string (e.g., "10°15'W")
 */
export function formatLongitude(decimal) {
  const { degrees, minutes, isNegative } = decimalToDM(decimal);
  const direction = isNegative ? 'W' : 'E';
  return `${degrees}°${minutes.toFixed(1)}'${direction}`;
}

/**
 * Format coordinates as string
 */
export function formatCoordinates(lat, lon) {
  return `${formatLatitude(lat)}, ${formatLongitude(lon)}`;
}

/**
 * Calculate great circle distance between two points (in nautical miles)
 * Using the Haversine formula
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const lat1Rad = lat1 * DEG_TO_RAD;
  const lat2Rad = lat2 * DEG_TO_RAD;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_NM * c;
}

/**
 * Calculate rhumb line distance (loxodrome) between two points
 */
export function calculateRhumbDistance(lat1, lon1, lat2, lon2) {
  const lat1Rad = lat1 * DEG_TO_RAD;
  const lat2Rad = lat2 * DEG_TO_RAD;
  let dLon = (lon2 - lon1) * DEG_TO_RAD;

  // Mercator projection
  const dPhi = Math.log(Math.tan(Math.PI / 4 + lat2Rad / 2) / Math.tan(Math.PI / 4 + lat1Rad / 2));

  let q;
  if (Math.abs(dPhi) > 1e-10) {
    q = (lat2Rad - lat1Rad) / dPhi;
  } else {
    q = Math.cos(lat1Rad);
  }

  // Handle crossing antimeridian
  if (Math.abs(dLon) > Math.PI) {
    dLon = dLon > 0 ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon);
  }

  const distance = Math.sqrt((lat2Rad - lat1Rad) * (lat2Rad - lat1Rad) + q * q * dLon * dLon) * EARTH_RADIUS_NM;
  return distance;
}

/**
 * Calculate initial bearing (heading) from point 1 to point 2
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const lat1Rad = lat1 * DEG_TO_RAD;
  const lat2Rad = lat2 * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let bearing = Math.atan2(y, x) * RAD_TO_DEG;
  return (bearing + 360) % 360;
}

/**
 * Calculate rhumb line bearing (constant heading)
 */
export function calculateRhumbBearing(lat1, lon1, lat2, lon2) {
  const lat1Rad = lat1 * DEG_TO_RAD;
  const lat2Rad = lat2 * DEG_TO_RAD;
  let dLon = (lon2 - lon1) * DEG_TO_RAD;

  const dPhi = Math.log(Math.tan(Math.PI / 4 + lat2Rad / 2) / Math.tan(Math.PI / 4 + lat1Rad / 2));

  if (Math.abs(dLon) > Math.PI) {
    dLon = dLon > 0 ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon);
  }

  let bearing = Math.atan2(dLon, dPhi) * RAD_TO_DEG;
  return (bearing + 360) % 360;
}

/**
 * Calculate destination point given start, bearing, and distance
 * Uses spherical geometry for great circle path
 */
export function calculateDestination(lat, lon, bearing, distanceNM) {
  const latRad = lat * DEG_TO_RAD;
  const lonRad = lon * DEG_TO_RAD;
  const bearingRad = bearing * DEG_TO_RAD;
  const angularDistance = distanceNM / EARTH_RADIUS_NM;

  const destLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
    Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );

  const destLonRad = lonRad + Math.atan2(
    Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latRad),
    Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(destLatRad)
  );

  return {
    lat: destLatRad * RAD_TO_DEG,
    lon: destLonRad * RAD_TO_DEG
  };
}

/**
 * Calculate destination using rhumb line (constant heading)
 */
export function calculateRhumbDestination(lat, lon, bearing, distanceNM) {
  const latRad = lat * DEG_TO_RAD;
  const bearingRad = bearing * DEG_TO_RAD;
  const delta = distanceNM / EARTH_RADIUS_NM;

  const dLat = delta * Math.cos(bearingRad);
  let destLatRad = latRad + dLat;

  // Check for poles
  if (Math.abs(destLatRad) > Math.PI / 2) {
    destLatRad = destLatRad > 0 ? Math.PI - destLatRad : -Math.PI - destLatRad;
  }

  const dPhi = Math.log(Math.tan(destLatRad / 2 + Math.PI / 4) / Math.tan(latRad / 2 + Math.PI / 4));
  const q = Math.abs(dPhi) > 1e-10 ? dLat / dPhi : Math.cos(latRad);

  const dLon = delta * Math.sin(bearingRad) / q;
  const destLonRad = (lon * DEG_TO_RAD + dLon + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

  return {
    lat: destLatRad * RAD_TO_DEG,
    lon: destLonRad * RAD_TO_DEG
  };
}

/**
 * Get intermediate points along great circle path
 */
export function getGreatCirclePoints(lat1, lon1, lat2, lon2, numPoints = 100) {
  const points = [];
  const lat1Rad = lat1 * DEG_TO_RAD;
  const lon1Rad = lon1 * DEG_TO_RAD;
  const lat2Rad = lat2 * DEG_TO_RAD;
  const lon2Rad = lon2 * DEG_TO_RAD;

  const d = calculateDistance(lat1, lon1, lat2, lon2) / EARTH_RADIUS_NM;

  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const a = Math.sin((1 - f) * d) / Math.sin(d);
    const b = Math.sin(f * d) / Math.sin(d);

    const x = a * Math.cos(lat1Rad) * Math.cos(lon1Rad) + b * Math.cos(lat2Rad) * Math.cos(lon2Rad);
    const y = a * Math.cos(lat1Rad) * Math.sin(lon1Rad) + b * Math.cos(lat2Rad) * Math.sin(lon2Rad);
    const z = a * Math.sin(lat1Rad) + b * Math.sin(lat2Rad);

    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * RAD_TO_DEG;
    const lon = Math.atan2(y, x) * RAD_TO_DEG;

    points.push({ lat, lon });
  }

  return points;
}

/**
 * Get intermediate points along rhumb line
 */
export function getRhumbLinePoints(lat1, lon1, lat2, lon2, numPoints = 100) {
  const points = [];

  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const lat = lat1 + f * (lat2 - lat1);
    const lon = lon1 + f * (lon2 - lon1);
    points.push({ lat, lon });
  }

  return points;
}

/**
 * Convert nautical miles to kilometers
 */
export function nmToKm(nm) {
  return nm * NM_TO_KM;
}

/**
 * Convert kilometers to nautical miles
 */
export function kmToNm(km) {
  return km / NM_TO_KM;
}

/**
 * Convert knots to km/h
 */
export function knotsToKmh(knots) {
  return knots * NM_TO_KM;
}

/**
 * Convert km/h to knots
 */
export function kmhToKnots(kmh) {
  return kmh / NM_TO_KM;
}

/**
 * Format distance with both units
 */
export function formatDistance(nm) {
  const km = nmToKm(nm);
  return {
    nm: nm.toFixed(1),
    km: km.toFixed(1),
    display: `${nm.toFixed(1)} nm (${km.toFixed(1)} km)`
  };
}

/**
 * Format speed with both units
 */
export function formatSpeed(knots) {
  const kmh = knotsToKmh(knots);
  return {
    knots: knots.toFixed(1),
    kmh: kmh.toFixed(1),
    display: `${knots.toFixed(1)} knots (${kmh.toFixed(1)} km/h)`
  };
}

/**
 * Calculate latitude difference in minutes
 */
export function latDifferenceMinutes(lat1, lat2) {
  return Math.abs(lat2 - lat1) * 60;
}

/**
 * Calculate longitude difference at a given latitude (accounting for convergence)
 */
export function lonDifferenceNM(lon1, lon2, latitude) {
  const dLon = Math.abs(lon2 - lon1);
  const latRad = latitude * DEG_TO_RAD;
  return dLon * 60 * Math.cos(latRad);
}

/**
 * Get compass direction name from bearing
 */
export function bearingToCompass(bearing) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}

/**
 * Calculate wind/current drift
 */
export function calculateDrift(windDirection, windSpeed, duration) {
  // Wind direction is where wind comes FROM, so drift is opposite
  const driftDirection = (windDirection + 180) % 360;
  const driftDistance = windSpeed * duration;

  const northComponent = driftDistance * Math.cos(driftDirection * DEG_TO_RAD);
  const eastComponent = driftDistance * Math.sin(driftDirection * DEG_TO_RAD);

  return {
    direction: driftDirection,
    distance: driftDistance,
    north: northComponent,
    east: eastComponent
  };
}

/**
 * Apply drift to a position
 */
export function applyDrift(lat, lon, driftNorth, driftEast) {
  const latChange = driftNorth / 60; // 1 minute = 1 nm at any latitude
  const lonChange = driftEast / (60 * Math.cos(lat * DEG_TO_RAD)); // Adjust for latitude

  return {
    lat: lat + latChange,
    lon: lon + lonChange
  };
}

/**
 * Calculate error between two positions
 */
export function calculateError(actualLat, actualLon, expectedLat, expectedLon) {
  const distance = calculateDistance(actualLat, actualLon, expectedLat, expectedLon);
  const bearing = calculateBearing(expectedLat, expectedLon, actualLat, actualLon);

  return {
    distanceNM: distance,
    distanceKM: nmToKm(distance),
    bearing: bearing
  };
}

/**
 * Determine star rating based on error and distance traveled
 */
export function calculateStarRating(errorNM, distanceTraveled) {
  const errorPercent = (errorNM / distanceTraveled) * 100;

  if (errorPercent <= 5) return 3;
  if (errorPercent <= 10) return 2;
  if (errorPercent <= 20) return 1;
  return 0;
}

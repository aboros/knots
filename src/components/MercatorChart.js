/**
 * Mercator Chart Component
 * A 2D equirectangular projection view for navigation education
 */

import { calculateDistance, calculateRhumbDistance, formatLatitude, formatLongitude, formatDistance, DEG_TO_RAD } from '../utils/navigation.js';

export class MercatorChart {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: container.clientWidth || 400,
      height: container.clientHeight || 300,
      padding: 40,
      minLat: -60,
      maxLat: 60,
      minLon: -180,
      maxLon: 180,
      showGrid: true,
      gridInterval: 10,
      ...options
    };

    this.canvas = null;
    this.ctx = null;
    this.pointA = null;
    this.pointB = null;
    this.showGreatCircle = false;
    this.isDragging = false;
    this.dragStartPoint = null;
    this.wasDrag = false; // Track if the last interaction was a drag
    this.mouseDownPos = null; // Track mouse position on mousedown

    this.onPointPlaced = null;

    this.init();
  }

  init() {
    this.createCanvas();
    this.bindEvents();
    this.render();
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.options.width * dpr;
    this.canvas.height = this.options.height * dpr;
    this.canvas.style.width = `${this.options.width}px`;
    this.canvas.style.height = `${this.options.height}px`;
    this.canvas.className = 'mercator-chart rounded-lg shadow-inner';

    this.ctx = this.canvas.getContext('2d');
    // Avoid cumulative scaling across resizes by resetting transform.
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.container.appendChild(this.canvas);
  }

  bindEvents() {
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());

    window.addEventListener('resize', () => this.handleResize());
  }

  handleClick(e) {
    // Don't place point if this was a drag operation
    if (this.wasDrag) {
      this.wasDrag = false; // Reset for next interaction
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const coords = this.canvasToLatLon(x, y);

    // Reset wasDrag flag after handling click
    this.wasDrag = false;

    if (this.onPointPlaced) {
      this.onPointPlaced(coords);
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const coords = this.canvasToLatLon(x, y);

    if (coords.lat >= this.options.minLat && coords.lat <= this.options.maxLat) {
      this.canvas.style.cursor = 'crosshair';
      this.hoverCoords = coords;
    } else {
      this.canvas.style.cursor = 'default';
      this.hoverCoords = null;
    }

    if (this.isDragging && this.dragStartPoint) {
      // Check if mouse moved significantly (more than 5 pixels) - indicates a drag
      if (this.mouseDownPos) {
        const dx = x - this.mouseDownPos.x;
        const dy = y - this.mouseDownPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
          this.wasDrag = true; // Mark as drag if moved more than 5 pixels
        }
      }
      
      // Ruler measurement
      this.dragEndPoint = coords;
      this.render();
    }
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.isDragging = true;
    this.wasDrag = false; // Reset drag flag
    this.mouseDownPos = { x, y }; // Store initial mouse position
    this.dragStartPoint = this.canvasToLatLon(x, y);
  }

  handleMouseUp(e) {
    // If it was a drag and we have both points, calculate distance
    if (this.isDragging && this.wasDrag && this.dragStartPoint && this.dragEndPoint) {
      // Calculate distance with ruler
      const distance = calculateDistance(
        this.dragStartPoint.lat, this.dragStartPoint.lon,
        this.dragEndPoint.lat, this.dragEndPoint.lon
      );
      this.lastMeasurement = distance;
    }

    this.isDragging = false;
    this.mouseDownPos = null;
    
    // If it wasn't a drag, clear the drag points so handleClick can place a point
    // If it was a drag, keep them for ruler display (they'll be cleared on next interaction)
    if (!this.wasDrag) {
      this.dragStartPoint = null;
      this.dragEndPoint = null;
    }
    
    this.render();
  }

  handleResize() {
    this.options.width = this.container.clientWidth;
    this.options.height = this.container.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.options.width * dpr;
    this.canvas.height = this.options.height * dpr;
    this.canvas.style.width = `${this.options.width}px`;
    this.canvas.style.height = `${this.options.height}px`;

    // Reset transform before applying DPR scaling (prevents compounding).
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.render();
  }

  canvasToLatLon(x, y) {
    const { padding, width, height, minLat, maxLat, minLon, maxLon } = this.options;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const lon = minLon + ((x - padding) / chartWidth) * (maxLon - minLon);
    const lat = maxLat - ((y - padding) / chartHeight) * (maxLat - minLat);

    return { lat, lon };
  }

  latLonToCanvas(lat, lon) {
    const { padding, width, height, minLat, maxLat, minLon, maxLon } = this.options;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const x = padding + ((lon - minLon) / (maxLon - minLon)) * chartWidth;
    const y = padding + ((maxLat - lat) / (maxLat - minLat)) * chartHeight;

    return { x, y };
  }

  setViewBounds(centerLat, centerLon, span = 60) {
    this.options.minLat = Math.max(-80, centerLat - span / 2);
    this.options.maxLat = Math.min(80, centerLat + span / 2);
    this.options.minLon = centerLon - span;
    this.options.maxLon = centerLon + span;
    this.render();
  }

  placePointA(lat, lon) {
    this.pointA = { lat, lon };
    this.render();
  }

  placePointB(lat, lon) {
    this.pointB = { lat, lon };
    this.render();
  }

  clearPoints() {
    this.pointA = null;
    this.pointB = null;
    this.render();
  }

  setShowGreatCircle(show) {
    this.showGreatCircle = show;
    this.render();
  }

  render() {
    const { ctx, options } = this;
    const { width, height, padding } = options;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw ocean background
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(padding, padding, width - padding * 2, height - padding * 2);

    // Draw grid
    if (options.showGrid) {
      this.drawGrid();
    }

    // Draw border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);

    // Draw points and paths
    if (this.pointA && this.pointB) {
      this.drawPath();
    }

    if (this.pointA) {
      this.drawPoint(this.pointA, '#ef4444', 'A');
    }

    if (this.pointB) {
      this.drawPoint(this.pointB, '#3b82f6', 'B');
    }

    // Draw ruler if dragging
    if (this.isDragging && this.dragStartPoint && this.dragEndPoint) {
      this.drawRuler();
    }

    // Draw axis labels
    this.drawLabels();
  }

  drawGrid() {
    const { ctx, options } = this;
    const { minLat, maxLat, minLon, maxLon, gridInterval } = options;

    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 0.5;

    // Latitude lines
    for (let lat = Math.ceil(minLat / gridInterval) * gridInterval; lat <= maxLat; lat += gridInterval) {
      const { y } = this.latLonToCanvas(lat, 0);
      ctx.beginPath();
      ctx.moveTo(options.padding, y);
      ctx.lineTo(options.width - options.padding, y);

      // Highlight equator
      if (lat === 0) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 0.5;
      }

      ctx.stroke();
    }

    // Longitude lines
    for (let lon = Math.ceil(minLon / gridInterval) * gridInterval; lon <= maxLon; lon += gridInterval) {
      const { x } = this.latLonToCanvas(0, lon);
      ctx.beginPath();
      ctx.moveTo(x, options.padding);
      ctx.lineTo(x, options.height - options.padding);

      // Highlight prime meridian
      if (lon === 0) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 0.5;
      }

      ctx.stroke();
    }
  }

  drawPath() {
    const { ctx } = this;

    if (!this.pointA || !this.pointB) return;

    const startPos = this.latLonToCanvas(this.pointA.lat, this.pointA.lon);
    const endPos = this.latLonToCanvas(this.pointB.lat, this.pointB.lon);

    // Draw rhumb line (straight on Mercator)
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(endPos.x, endPos.y);
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw great circle if enabled
    if (this.showGreatCircle) {
      this.drawGreatCirclePath();
    }

    // Draw distance label
    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y + endPos.y) / 2;

    const distance = calculateDistance(
      this.pointA.lat, this.pointA.lon,
      this.pointB.lat, this.pointB.lon
    );

    ctx.fillStyle = '#fb923c';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(formatDistance(distance).display, midX, midY - 10);
  }

  drawGreatCirclePath() {
    const { ctx } = this;

    if (!this.pointA || !this.pointB) return;

    // For educational purposes, draw a slightly curved path
    // In reality, the curve depends on the specific coordinates
    const numPoints = 50;
    const points = [];

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;

      // Simple curved interpolation for visualization
      const lat = this.pointA.lat + (this.pointB.lat - this.pointA.lat) * t;
      const lon = this.pointA.lon + (this.pointB.lon - this.pointA.lon) * t;

      // Add slight curve based on latitude span
      const latSpan = Math.abs(this.pointB.lat - this.pointA.lat);
      const curveAmount = Math.sin(t * Math.PI) * latSpan * 0.1;

      points.push(this.latLonToCanvas(lat + curveAmount, lon));
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawPoint(point, color, label) {
    const { ctx } = this;
    const pos = this.latLonToCanvas(point.lat, point.lon);

    // Draw circle
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    ctx.fillStyle = color;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, pos.x, pos.y - 12);

    // Draw coordinates
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(
      `${formatLatitude(point.lat)}, ${formatLongitude(point.lon)}`,
      pos.x,
      pos.y + 20
    );
  }

  drawRuler() {
    const { ctx } = this;

    if (!this.dragStartPoint || !this.dragEndPoint) return;

    const start = this.latLonToCanvas(this.dragStartPoint.lat, this.dragStartPoint.lon);
    const end = this.latLonToCanvas(this.dragEndPoint.lat, this.dragEndPoint.lon);

    // Draw ruler line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw endpoints
    [start, end].forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
    });

    // Draw distance
    const distance = calculateDistance(
      this.dragStartPoint.lat, this.dragStartPoint.lon,
      this.dragEndPoint.lat, this.dragEndPoint.lon
    );

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(formatDistance(distance).display, midX, midY - 10);
  }

  drawLabels() {
    const { ctx, options } = this;
    const { padding, width, height, minLat, maxLat, minLon, maxLon, gridInterval } = options;

    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#64748b';

    // Latitude labels (left side)
    ctx.textAlign = 'right';
    for (let lat = Math.ceil(minLat / gridInterval) * gridInterval; lat <= maxLat; lat += gridInterval) {
      const { y } = this.latLonToCanvas(lat, 0);
      ctx.fillText(`${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'}`, padding - 5, y + 4);
    }

    // Longitude labels (bottom)
    ctx.textAlign = 'center';
    for (let lon = Math.ceil(minLon / gridInterval) * gridInterval; lon <= maxLon; lon += gridInterval) {
      const { x } = this.latLonToCanvas(0, lon);
      ctx.fillText(`${Math.abs(lon)}°${lon >= 0 ? 'E' : 'W'}`, x, height - padding + 15);
    }

    // Scale bar
    this.drawScaleBar();
  }

  drawScaleBar() {
    const { ctx, options } = this;
    const { padding, height } = options;

    const barX = padding + 10;
    const barY = height - padding - 10;
    const barWidth = 60;

    // Calculate what distance this represents at center latitude
    const centerLat = (options.maxLat + options.minLat) / 2;
    const point1 = this.canvasToLatLon(barX, barY);
    const point2 = this.canvasToLatLon(barX + barWidth, barY);
    const distance = calculateDistance(point1.lat, point1.lon, point2.lat, point2.lon);

    // Draw bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, barY - 4, barWidth, 4);

    // Draw ticks
    ctx.fillRect(barX, barY - 8, 2, 8);
    ctx.fillRect(barX + barWidth - 2, barY - 8, 2, 8);

    // Draw label
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText(`~${Math.round(distance)} nm`, barX + barWidth / 2, barY - 12);
  }

  dispose() {
    this.container.removeChild(this.canvas);
    window.removeEventListener('resize', this.handleResize);
  }
}

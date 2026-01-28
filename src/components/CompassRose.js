/**
 * Compass Rose Component
 * Interactive SVG compass for heading selection
 */

export class CompassRose {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      size: 200,
      initialHeading: 0,
      snapAngle: 15,
      snapThreshold: 5,
      ...options
    };

    this.heading = this.options.initialHeading;
    this.isDragging = false;
    this.onChange = null;

    this.init();
  }

  init() {
    this.createSVG();
    this.bindEvents();
    this.updateNeedle();
  }

  createSVG() {
    const { size } = this.options;
    const center = size / 2;
    const radius = size / 2 - 10;

    this.container.innerHTML = `
      <div class="compass-container relative" style="width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="compass-svg">
          <!-- Outer ring -->
          <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="2"/>

          <!-- Degree markers -->
          ${this.createDegreeMarkers(center, radius)}

          <!-- Cardinal directions -->
          ${this.createCardinalLabels(center, radius)}

          <!-- Inner circle -->
          <circle cx="${center}" cy="${center}" r="${radius * 0.3}" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>

          <!-- Needle group (rotatable) -->
          <g id="needle-group" transform="rotate(0, ${center}, ${center})" class="cursor-grab">
            <!-- Needle body -->
            <polygon
              points="${center},${center - radius * 0.8} ${center - 8},${center + 10} ${center + 8},${center + 10}"
              fill="#fb923c"
              class="drop-shadow-sm"
            />
            <!-- Needle tip glow -->
            <polygon
              points="${center},${center - radius * 0.85} ${center - 5},${center - radius * 0.75} ${center + 5},${center - radius * 0.75}"
              fill="#fcd34d"
            />
            <!-- Center pivot -->
            <circle cx="${center}" cy="${center}" r="8" fill="#ea580c"/>
            <circle cx="${center}" cy="${center}" r="4" fill="#ffffff"/>
          </g>

          <!-- Invisible interaction area -->
          <circle cx="${center}" cy="${center}" r="${radius}" fill="transparent" id="interaction-area" style="cursor: grab;"/>
        </svg>

        <!-- Heading display -->
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border border-slate-200">
          <span class="text-sm font-medium text-slate-600">Heading: </span>
          <span id="heading-display" class="font-mono font-bold text-slate-800">${String(this.heading).padStart(3, '0')}°</span>
        </div>
      </div>
    `;

    this.needleGroup = this.container.querySelector('#needle-group');
    this.headingDisplay = this.container.querySelector('#heading-display');
    this.interactionArea = this.container.querySelector('#interaction-area');
  }

  createDegreeMarkers(center, radius) {
    let markers = '';

    for (let i = 0; i < 360; i += 10) {
      const isCardinal = i % 90 === 0;
      const isIntercardinal = i % 45 === 0;
      const markerLength = isCardinal ? 15 : isIntercardinal ? 10 : 6;
      const strokeWidth = isCardinal ? 2 : 1;

      const angle = (i - 90) * (Math.PI / 180);
      const x1 = center + (radius - markerLength) * Math.cos(angle);
      const y1 = center + (radius - markerLength) * Math.sin(angle);
      const x2 = center + radius * Math.cos(angle);
      const y2 = center + radius * Math.sin(angle);

      markers += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#94a3b8" stroke-width="${strokeWidth}"/>`;

      // Add degree labels every 30°
      if (i % 30 === 0 && !isCardinal) {
        const labelRadius = radius - 22;
        const labelX = center + labelRadius * Math.cos(angle);
        const labelY = center + labelRadius * Math.sin(angle);
        markers += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-family="JetBrains Mono, monospace" fill="#64748b">${i}</text>`;
      }
    }

    return markers;
  }

  createCardinalLabels(center, radius) {
    const labels = [
      { text: 'N', angle: -90, color: '#ef4444' },
      { text: 'E', angle: 0, color: '#64748b' },
      { text: 'S', angle: 90, color: '#64748b' },
      { text: 'W', angle: 180, color: '#64748b' }
    ];

    const labelRadius = radius - 25;

    return labels.map(({ text, angle, color }) => {
      const rad = angle * (Math.PI / 180);
      const x = center + labelRadius * Math.cos(rad);
      const y = center + labelRadius * Math.sin(rad);
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="bold" font-family="Inter, sans-serif" fill="${color}">${text}</text>`;
    }).join('');
  }

  bindEvents() {
    const handleStart = (e) => {
      e.preventDefault();
      this.isDragging = true;
      this.interactionArea.style.cursor = 'grabbing';
      this.handleDrag(e);
    };

    const handleMove = (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      this.handleDrag(e);
    };

    const handleEnd = () => {
      this.isDragging = false;
      this.interactionArea.style.cursor = 'grab';
      this.snapToAngle();
    };

    // Mouse events
    this.interactionArea.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // Touch events
    this.interactionArea.addEventListener('touchstart', handleStart);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }

  handleDrag(e) {
    const rect = this.container.getBoundingClientRect();
    const center = this.options.size / 2;

    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left - center;
    const y = clientY - rect.top - center;

    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    this.setHeading(Math.round(angle));
  }

  snapToAngle() {
    const { snapAngle, snapThreshold } = this.options;
    const remainder = this.heading % snapAngle;

    if (remainder < snapThreshold) {
      this.setHeading(this.heading - remainder);
    } else if (snapAngle - remainder < snapThreshold) {
      this.setHeading(this.heading + (snapAngle - remainder));
    }
  }

  setHeading(heading) {
    this.heading = ((heading % 360) + 360) % 360;
    this.updateNeedle();

    if (this.onChange) {
      this.onChange(this.heading);
    }
  }

  getHeading() {
    return this.heading;
  }

  updateNeedle() {
    const center = this.options.size / 2;

    if (this.needleGroup) {
      this.needleGroup.setAttribute('transform', `rotate(${this.heading}, ${center}, ${center})`);
    }

    if (this.headingDisplay) {
      this.headingDisplay.textContent = `${String(Math.round(this.heading)).padStart(3, '0')}°`;
    }
  }

  dispose() {
    this.container.innerHTML = '';
  }
}

/**
 * Create a simple compass display (non-interactive)
 */
export function createCompassDisplay(container, heading) {
  const size = 60;
  const center = size / 2;

  container.innerHTML = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${center}" cy="${center}" r="${center - 2}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

      <!-- Cardinal directions -->
      <text x="${center}" y="12" text-anchor="middle" font-size="10" font-weight="bold" fill="#ef4444">N</text>
      <text x="${size - 8}" y="${center + 4}" text-anchor="middle" font-size="10" fill="#94a3b8">E</text>
      <text x="${center}" y="${size - 4}" text-anchor="middle" font-size="10" fill="#94a3b8">S</text>
      <text x="8" y="${center + 4}" text-anchor="middle" font-size="10" fill="#94a3b8">W</text>

      <!-- Needle -->
      <g transform="rotate(${heading}, ${center}, ${center})">
        <polygon points="${center},8 ${center - 4},${center} ${center + 4},${center}" fill="#fb923c"/>
        <polygon points="${center},${size - 8} ${center - 4},${center} ${center + 4},${center}" fill="#94a3b8"/>
        <circle cx="${center}" cy="${center}" r="3" fill="#ea580c"/>
      </g>
    </svg>
    <div class="text-center mt-1">
      <span class="font-mono text-sm font-medium">${String(Math.round(heading)).padStart(3, '0')}°</span>
    </div>
  `;
}

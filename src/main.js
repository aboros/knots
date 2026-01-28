/**
 * Main application entry point
 * Nautical Navigation Learning Experience
 */

import { Globe } from './components/Globe.js';
import { Dashboard } from './components/Dashboard.js';
import { loadState, saveState, resetProgress, updateSettings, completeChallenge, completeChapter, updateAchievement, getChapterProgress, isChapterUnlocked } from './utils/storage.js';
import { calculateDistance, calculateDestination, calculateRhumbDestination, calculateError, calculateStarRating, formatLatitude, formatLongitude, formatDistance, formatSpeed, dmToDecimal, DEG_TO_RAD, NM_TO_KM } from './utils/navigation.js';
import { chapters, quizQuestions, tooltips, achievements } from './data/challenges.js';

class NauticalApp {
  constructor() {
    this.state = loadState();
    this.globe = null;
    this.landingGlobe = null;
    this.currentMode = 'landing'; // landing, tutorial, game, quiz
    this.placingPoint = null; // 'A', 'B', or null
    this.challengeStartTime = null;
    this.tutorialStep = 0;
    this.perfectStreak = 0;

    this.init();
  }

  init() {
    this.bindEvents();
    this.bindKeyboardEvents();
    this.showFirstVisitNotice();
    this.initLandingGlobe();
    this.updateUI();
  }

  bindKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // Skip if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (this.currentMode === 'game') {
            e.preventDefault();
            this.prevChallenge();
          }
          break;
        case 'ArrowRight':
          if (this.currentMode === 'game') {
            e.preventDefault();
            this.nextChallenge();
          }
          break;
        case 'ArrowUp':
          if (this.globe && this.currentMode === 'game') {
            e.preventDefault();
            this.globe.zoomIn();
          }
          break;
        case 'ArrowDown':
          if (this.globe && this.currentMode === 'game') {
            e.preventDefault();
            this.globe.zoomOut();
          }
          break;
        case 'r':
        case 'R':
          if (this.globe && this.currentMode === 'game') {
            e.preventDefault();
            this.globe.resetView();
          }
          break;
        case 'Escape':
          // Close any open modals
          document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
          break;
        case 'Enter':
          if (this.currentMode === 'landing') {
            e.preventDefault();
            this.startLearning();
          }
          break;
        case 'm':
        case 'M':
          if (this.currentMode === 'game') {
            e.preventDefault();
            this.showChapterMenu();
          }
          break;
        case '?':
          // Show keyboard shortcuts help
          this.showKeyboardHelp();
          break;
      }
    });
  }

  showKeyboardHelp() {
    const existingHelp = document.getElementById('keyboard-help');
    if (existingHelp) {
      existingHelp.remove();
      return;
    }

    const help = document.createElement('div');
    help.id = 'keyboard-help';
    help.className = 'fixed bottom-20 right-4 z-50 bg-white rounded-xl shadow-xl p-4 max-w-xs animate-fade-in';
    help.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-bold text-slate-800">Keyboard Shortcuts</h4>
        <button class="btn btn-ghost btn-xs btn-circle" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
      <ul class="space-y-2 text-sm text-slate-600">
        <li><kbd class="kbd kbd-xs">←</kbd> / <kbd class="kbd kbd-xs">→</kbd> Previous/Next challenge</li>
        <li><kbd class="kbd kbd-xs">↑</kbd> / <kbd class="kbd kbd-xs">↓</kbd> Zoom in/out</li>
        <li><kbd class="kbd kbd-xs">R</kbd> Reset view</li>
        <li><kbd class="kbd kbd-xs">M</kbd> Chapter menu</li>
        <li><kbd class="kbd kbd-xs">Esc</kbd> Close dialogs</li>
        <li><kbd class="kbd kbd-xs">?</kbd> Toggle this help</li>
      </ul>
    `;
    document.body.appendChild(help);

    // Auto-remove after 10 seconds
    setTimeout(() => help.remove(), 10000);
  }

  bindEvents() {
    // Landing screen
    document.getElementById('start-btn')?.addEventListener('click', () => this.startLearning());

    // Navigation
    document.getElementById('home-btn')?.addEventListener('click', () => this.goHome());
    document.getElementById('prev-btn')?.addEventListener('click', () => this.prevChallenge());
    document.getElementById('next-btn')?.addEventListener('click', () => this.nextChallenge());
    document.getElementById('chapter-menu-btn')?.addEventListener('click', () => this.showChapterMenu());

    // Globe controls
    document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.globe?.zoomIn());
    document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.globe?.zoomOut());
    document.getElementById('reset-view-btn')?.addEventListener('click', () => this.globe?.resetView());
    document.getElementById('collapse-globe-btn')?.addEventListener('click', () => this.toggleGlobeCollapse());

    // Settings
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      document.getElementById('settings-modal')?.showModal();
    });
    document.getElementById('show-hints-toggle')?.addEventListener('change', (e) => {
      this.state = updateSettings(this.state, { showHints: e.target.checked });
    });
    document.getElementById('show-grid-toggle')?.addEventListener('change', (e) => {
      this.state = updateSettings(this.state, { showGrid: e.target.checked });
      this.globe?.setGridVisible(e.target.checked);
    });
    document.getElementById('rotation-speed')?.addEventListener('input', (e) => {
      const speed = parseFloat(e.target.value);
      this.state = updateSettings(this.state, { rotationSpeed: speed });
      this.globe?.setRotationSpeed(speed);
    });
    document.getElementById('reset-progress-btn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        this.state = resetProgress();
        document.getElementById('settings-modal')?.close();
        this.goHome();
      }
    });

    // First visit notice
    document.getElementById('dismiss-notice-btn')?.addEventListener('click', () => {
      document.getElementById('first-visit-notice')?.classList.add('hidden');
      this.state.firstVisitNoticeShown = true;
      saveState(this.state);
    });
  }

  showFirstVisitNotice() {
    if (!this.state.firstVisitNoticeShown) {
      setTimeout(() => {
        document.getElementById('first-visit-notice')?.classList.remove('hidden');
        // Auto dismiss after 8 seconds
        setTimeout(() => {
          document.getElementById('first-visit-notice')?.classList.add('hidden');
          this.state.firstVisitNoticeShown = true;
          saveState(this.state);
        }, 8000);
      }, 2000);
    }
  }

  initLandingGlobe() {
    const container = document.getElementById('landing-globe-container');
    if (!container) return;

    this.landingGlobe = new Globe(container, {
      autoRotate: true,
      rotationSpeed: 0.5
    });
  }

  startLearning() {
    this.currentMode = this.state.settings.tutorialCompleted ? 'game' : 'tutorial';

    // Clean up landing globe
    if (this.landingGlobe) {
      this.landingGlobe.dispose();
      this.landingGlobe = null;
    }

    // Hide landing, show game
    document.getElementById('landing-screen')?.classList.add('hidden');
    document.getElementById('game-screen')?.classList.remove('hidden');

    // Initialize main globe
    const container = document.getElementById('globe-container');
    if (container) {
      this.globe = new Globe(container, {
        showGrid: this.state.settings.showGrid,
        rotationSpeed: this.state.settings.rotationSpeed
      });

      this.globe.onPointPlaced = (coords) => this.handlePointPlaced(coords);
      this.globe.onHover = (coords) => this.handleHover(coords);
    }

    if (this.currentMode === 'tutorial') {
      this.showTutorial();
    } else {
      this.loadChapter(this.state.currentChapter);
    }
  }

  showTutorial() {
    // Render tutorial in the sidebar panel instead of a modal overlay
    const panel = document.getElementById('panel-content');
    if (!panel) return;

    this.tutorialSteps = [
      {
        title: 'Welcome to Navigation!',
        text: 'Navigation uses coordinates: latitude and longitude. These are measured in degrees and minutes.',
        action: 'Continue',
        icon: '🌍'
      },
      {
        title: 'The Coordinate Grid',
        text: 'Latitude lines run east-west and measure how far north or south you are. Longitude lines run north-south and measure east-west position.',
        action: 'Continue',
        icon: '📐'
      },
      {
        title: 'Try Rotating the Globe',
        text: 'Click and drag on the globe to rotate it. Explore the coordinate grid!',
        action: 'rotate',
        waitFor: 'globeRotated',
        icon: '🔄'
      },
      {
        title: 'Place Your First Point',
        text: 'Now click anywhere on the globe to place Point A. Watch the coordinates appear!',
        action: 'place',
        waitFor: 'pointAPlaced',
        icon: '📍'
      },
      {
        title: 'Place a Second Point',
        text: 'Click somewhere else to place Point B. The distance between the points will be calculated automatically.',
        action: 'place',
        waitFor: 'pointBPlaced',
        icon: '📍'
      },
      {
        title: 'You\'re Ready!',
        text: 'What if our speed and distance units matched this coordinate grid? That\'s exactly what nautical miles and knots do!',
        action: 'Start Chapter 1',
        icon: '🎉'
      }
    ];

    this.renderTutorialStep();

    // Track globe rotation for tutorial
    if (this.globe && !this._tutorialRotationListenerAdded) {
      this._tutorialRotationListenerAdded = true;
      this.globe.controls.addEventListener('change', () => {
        if (this.currentMode === 'tutorial' && !this.state.tutorialProgress.globeRotated) {
          this.state.tutorialProgress.globeRotated = true;
          saveState(this.state);
          if (this.tutorialSteps[this.tutorialStep]?.waitFor === 'globeRotated') {
            this.tutorialStep++;
            this.renderTutorialStep();
          }
        }
      });
    }
  }

  renderTutorialStep() {
    const panel = document.getElementById('panel-content');
    if (!panel || !this.tutorialSteps) return;

    const step = this.tutorialSteps[this.tutorialStep];
    if (!step) return;

    const isInteractiveStep = step.action === 'rotate' || step.action === 'place';
    const showSkipButton = this.tutorialStep >= 2;

    panel.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        <!-- Progress indicator -->
        <div class="flex items-center gap-2">
          <span class="badge badge-primary">Tutorial</span>
          <span class="text-sm text-slate-500">Step ${this.tutorialStep + 1} of ${this.tutorialSteps.length}</span>
        </div>
        <progress class="progress progress-primary w-full" value="${((this.tutorialStep + 1) / this.tutorialSteps.length) * 100}" max="100"></progress>

        <!-- Step content -->
        <div class="text-center py-4">
          <div class="text-5xl mb-4">${step.icon}</div>
          <h2 class="text-xl font-bold text-slate-800 mb-3">${step.title}</h2>
          <p class="text-slate-600">${step.text}</p>
        </div>

        <!-- Action area -->
        <div class="flex flex-col items-center gap-3 pt-4">
          ${isInteractiveStep ? `
            <div class="flex items-center gap-2 text-sky-600">
              <span class="loading loading-dots loading-sm"></span>
              <span class="text-sm font-medium">Waiting for your action on the globe...</span>
            </div>
          ` : `
            <button class="btn btn-primary w-full" id="tutorial-action-btn">${step.action}</button>
          `}

          ${showSkipButton ? `
            <button class="btn btn-ghost btn-sm" id="skip-tutorial-btn">Skip Tutorial</button>
          ` : ''}
        </div>

        <!-- Hint for interactive steps -->
        ${isInteractiveStep ? `
          <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-sm">${step.action === 'rotate' ? 'Click and drag on the globe to the left to rotate it.' : 'Click anywhere on the blue globe to place a point.'}</span>
          </div>
        ` : ''}
      </div>
    `;

    // Bind button events
    document.getElementById('tutorial-action-btn')?.addEventListener('click', () => {
      this.tutorialStep++;
      if (this.tutorialStep >= this.tutorialSteps.length) {
        this.completeTutorial();
      } else {
        this.renderTutorialStep();
      }
    });

    document.getElementById('skip-tutorial-btn')?.addEventListener('click', () => {
      this.completeTutorial();
    });
  }

  handlePointPlaced(coords) {
    if (this.currentMode === 'tutorial') {
      if (!this.state.tutorialProgress.pointAPlaced) {
        this.globe.placePointA(coords.lat, coords.lon);
        this.state.tutorialProgress.pointAPlaced = true;
        saveState(this.state);
        this.tutorialStep++;
        this.renderTutorialStep();
      } else if (!this.state.tutorialProgress.pointBPlaced) {
        this.globe.placePointB(coords.lat, coords.lon);
        this.state.tutorialProgress.pointBPlaced = true;
        saveState(this.state);
        this.tutorialStep++;
        this.renderTutorialStep();
      }
      return;
    }

    if (this.placingPoint === 'A') {
      this.globe.placePointA(coords.lat, coords.lon);
      this.currentPointA = coords;
      this.placingPoint = null;
      this.updatePlaceButtons();
      this.updateMeasurementInfo();

      // Update achievement
      if (this.currentPointA && this.currentPointB) {
        this.state = updateAchievement(this.state, 'globeTrotter');
      }
    } else if (this.placingPoint === 'B') {
      this.globe.placePointB(coords.lat, coords.lon);
      this.currentPointB = coords;
      this.placingPoint = null;
      this.updatePlaceButtons();
      this.updateMeasurementInfo();

      // Update achievement
      if (this.currentPointA && this.currentPointB) {
        this.state = updateAchievement(this.state, 'globeTrotter');
      }
    }
  }

  handleHover(coords) {
    const display = document.getElementById('coordinate-display');
    const latEl = document.getElementById('hover-lat');
    const lonEl = document.getElementById('hover-lon');

    if (coords && display && latEl && lonEl) {
      display.classList.remove('hidden');
      latEl.textContent = formatLatitude(coords.lat);
      lonEl.textContent = formatLongitude(coords.lon);
    } else if (display) {
      display.classList.add('hidden');
    }
  }

  completeTutorial() {
    document.getElementById('tutorial-overlay')?.classList.add('hidden');
    this.state.settings.tutorialCompleted = true;
    saveState(this.state);
    this.currentMode = 'game';
    this.loadChapter(1);
  }

  loadChapter(chapterNum) {
    const chapter = chapters.find(c => c.id === chapterNum);
    if (!chapter) return;

    this.state.currentChapter = chapterNum;
    this.state.currentChallenge = 0;
    saveState(this.state);

    this.updateProgressBar();
    this.loadChallenge(0);
  }

  loadChallenge(challengeIndex) {
    const chapter = chapters.find(c => c.id === this.state.currentChapter);
    if (!chapter || !chapter.challenges[challengeIndex]) return;

    const challenge = chapter.challenges[challengeIndex];
    this.state.currentChallenge = challengeIndex;
    saveState(this.state);

    this.challengeStartTime = Date.now();
    this.globe?.clearPoints();
    this.currentPointA = null;
    this.currentPointB = null;

    this.renderChallengePanel(chapter, challenge);
    this.updateNavButtons();
  }

  renderChallengePanel(chapter, challenge) {
    const panel = document.getElementById('panel-content');
    if (!panel) return;

    let content = `
      <div class="space-y-4 animate-fade-in">
        <div class="flex items-center gap-2 text-sm text-slate-500">
          <span class="badge badge-outline">${chapter.icon} Chapter ${chapter.id}</span>
          <span>Challenge ${challenge.id}/${chapter.challenges.length}</span>
        </div>

        <h2 class="text-xl font-bold text-slate-800">${challenge.title}</h2>

        <p class="text-slate-600">${challenge.instruction}</p>
    `;

    // Challenge-specific UI
    switch (challenge.type) {
      case 'exploration':
      case 'measurement':
        content += this.renderMeasurementUI(challenge);
        break;
      case 'discovery':
        content += this.renderDiscoveryUI(challenge);
        break;
      case 'deadReckoning':
        content += this.renderDeadReckoningUI(challenge);
        break;
      case 'comparison':
        content += this.renderComparisonUI(challenge);
        break;
      case 'mercator':
        content += this.renderMercatorUI(challenge);
        break;
      case 'timeTrial':
        content += this.renderTimeTrialUI(challenge);
        break;
      case 'planning':
        content += this.renderPlanningUI(challenge);
        break;
    }

    // Hints section
    if (challenge.hints && this.state.settings.showHints) {
      content += `
        <div class="collapse collapse-arrow bg-sky-50 rounded-lg mt-4">
          <input type="checkbox" />
          <div class="collapse-title text-sm font-medium text-sky-700">
            💡 Need a hint?
          </div>
          <div class="collapse-content">
            <ul class="text-sm text-sky-600 space-y-1">
              ${challenge.hints.map(h => `<li>• ${h}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    }

    // Mobile navigation buttons (visible only on small screens)
    const isFirstChallenge = this.state.currentChapter === 1 && this.state.currentChallenge === 0;
    content += `
      <div class="md:hidden border-t border-slate-200 mt-6 pt-4">
        <div class="flex items-center justify-between gap-2">
          <button id="mobile-prev-btn" class="btn btn-ghost btn-sm flex-1" ${isFirstChallenge ? 'disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <button id="mobile-chapter-menu-btn" class="btn btn-primary btn-sm flex-1">
            Chapters
          </button>
          <button id="mobile-next-btn" class="btn btn-ghost btn-sm flex-1">
            Next
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    `;

    content += `</div>`;
    panel.innerHTML = content;

    this.bindChallengeEvents(challenge);

    // Bind mobile navigation buttons
    document.getElementById('mobile-prev-btn')?.addEventListener('click', () => this.prevChallenge());
    document.getElementById('mobile-next-btn')?.addEventListener('click', () => this.nextChallenge());
    document.getElementById('mobile-chapter-menu-btn')?.addEventListener('click', () => this.showChapterMenu());
  }

  renderMeasurementUI(challenge) {
    return `
      <div class="grid grid-cols-2 gap-3 mt-4">
        <button id="place-a-btn" class="btn btn-outline border-red-300 text-red-600 hover:bg-red-50">
          📍 Place Point A
        </button>
        <button id="place-b-btn" class="btn btn-outline border-blue-300 text-blue-600 hover:bg-blue-50">
          📍 Place Point B
        </button>
      </div>

      <div id="measurement-info" class="mt-4 hidden">
        <div class="distance-display">
          <div class="distance-primary" id="distance-nm">-- nm</div>
          <div class="distance-secondary" id="distance-km">(-- km)</div>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-3 text-sm">
          <div>
            <span class="text-slate-500">Point A:</span>
            <div id="point-a-coords" class="font-mono">--</div>
          </div>
          <div>
            <span class="text-slate-500">Point B:</span>
            <div id="point-b-coords" class="font-mono">--</div>
          </div>
        </div>
      </div>

      <button id="clear-points-btn" class="btn btn-ghost btn-sm mt-4">
        Clear Points
      </button>
    `;
  }

  renderDiscoveryUI(challenge) {
    return `
      <div class="info-box mt-4">
        <p class="font-medium mb-2">🎯 Target:</p>
        <p>Point A: ~${formatLatitude(challenge.targetA.lat)}, ${formatLongitude(challenge.targetA.lon)}</p>
        <p>Point B: ~${formatLatitude(challenge.targetB.lat)}, ${formatLongitude(challenge.targetB.lon)}</p>
      </div>

      <div class="grid grid-cols-2 gap-3 mt-4">
        <button id="place-a-btn" class="btn btn-outline border-red-300 text-red-600 hover:bg-red-50">
          📍 Place Point A
        </button>
        <button id="place-b-btn" class="btn btn-outline border-blue-300 text-blue-600 hover:bg-blue-50">
          📍 Place Point B
        </button>
      </div>

      <div id="measurement-info" class="mt-4 hidden">
        <div class="distance-display">
          <div class="distance-primary" id="distance-nm">-- nm</div>
          <div class="distance-secondary" id="distance-km">(-- km)</div>
        </div>
      </div>

      <div id="discovery-reveal" class="mt-4 hidden">
        <div class="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 class="font-bold">Discovery!</h4>
            <p class="text-sm">${challenge.discovery || ''}</p>
          </div>
        </div>
      </div>
    `;
  }

  renderDeadReckoningUI(challenge) {
    return `
      <div class="card bg-slate-50 p-4 mt-4">
        <h4 class="font-medium text-slate-700 mb-3">📋 Given Information</h4>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-slate-500">Starting Position:</span>
            <div class="font-mono font-medium">${formatLatitude(challenge.start.lat)}</div>
            <div class="font-mono font-medium">${formatLongitude(challenge.start.lon)}</div>
          </div>
          <div>
            <span class="text-slate-500">Heading:</span>
            <div class="font-mono font-medium">${challenge.heading}°</div>
          </div>
          <div>
            <span class="text-slate-500">Speed:</span>
            <div class="font-mono font-medium">${challenge.speed} knots</div>
            <div class="text-xs text-slate-400">(${(challenge.speed * NM_TO_KM).toFixed(1)} km/h)</div>
          </div>
          <div>
            <span class="text-slate-500">Time:</span>
            <div class="font-mono font-medium">${challenge.time} hours</div>
          </div>
        </div>

        ${challenge.wind ? `
          <div class="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
            <span class="text-yellow-700 text-sm">🌬️ Wind from ${challenge.wind.direction}° at ${challenge.wind.speed} knots</span>
            <div class="text-xs text-yellow-600">Drift: ${challenge.wind.driftNm} nm ${challenge.wind.driftDirection}</div>
          </div>
        ` : ''}

        ${challenge.current ? `
          <div class="mt-2 p-2 bg-cyan-50 rounded border border-cyan-200">
            <span class="text-cyan-700 text-sm">🌊 Current setting ${challenge.current.direction}° at ${challenge.current.speed} knots</span>
            <div class="text-xs text-cyan-600">Drift: ${challenge.current.driftNm} nm ${challenge.current.driftDirection}</div>
          </div>
        ` : ''}
      </div>

      ${challenge.showTrigHelper ? `
        <div class="formula-box mt-4">
          <p class="text-xs text-slate-500 mb-1">Component formulas:</p>
          <p>North = distance × cos(heading)</p>
          <p>East = distance × sin(heading)</p>
        </div>
      ` : ''}

      <div class="mt-6">
        <h4 class="font-medium text-slate-700 mb-3">📝 Your Answer</h4>

        <div class="space-y-3">
          <div>
            <label class="text-sm text-slate-500">Latitude</label>
            <div class="flex items-center gap-2">
              <input type="number" id="ans-lat-deg" class="coord-input" min="0" max="90" placeholder="°">
              <span class="coord-label">°</span>
              <input type="number" id="ans-lat-min" class="coord-input" min="0" max="59" step="0.1" placeholder="'">
              <span class="coord-label">'</span>
              <select id="ans-lat-dir" class="select select-bordered select-sm w-16">
                <option value="N">N</option>
                <option value="S">S</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-sm text-slate-500">Longitude</label>
            <div class="flex items-center gap-2">
              <input type="number" id="ans-lon-deg" class="coord-input" min="0" max="180" placeholder="°">
              <span class="coord-label">°</span>
              <input type="number" id="ans-lon-min" class="coord-input" min="0" max="59" step="0.1" placeholder="'">
              <span class="coord-label">'</span>
              <select id="ans-lon-dir" class="select select-bordered select-sm w-16">
                <option value="E">E</option>
                <option value="W">W</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <button id="submit-answer-btn" class="btn btn-primary flex-1">
            Submit Answer
          </button>
          <button id="show-solution-btn" class="btn btn-ghost">
            Show Solution
          </button>
        </div>
      </div>

      <div id="result-display" class="mt-4 hidden"></div>
    `;
  }

  renderComparisonUI(challenge) {
    // Similar to dead reckoning but with km/h input
    return `
      <div class="card bg-slate-50 p-4 mt-4">
        <h4 class="font-medium text-slate-700 mb-3">📋 Given Information (Metric)</h4>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-slate-500">Starting Position:</span>
            <div class="font-mono font-medium">${formatLatitude(challenge.start.lat)}</div>
            <div class="font-mono font-medium">${formatLongitude(challenge.start.lon)}</div>
          </div>
          <div>
            <span class="text-slate-500">Heading:</span>
            <div class="font-mono font-medium">${challenge.heading}°</div>
          </div>
          <div>
            <span class="text-slate-500">Speed:</span>
            <div class="font-mono font-medium">${challenge.speedKmh} km/h</div>
          </div>
          <div>
            <span class="text-slate-500">Time:</span>
            <div class="font-mono font-medium">${challenge.time} hours</div>
          </div>
        </div>
      </div>

      <div class="formula-box mt-4">
        <p class="text-xs text-slate-500 mb-1">Conversion steps needed:</p>
        <p>1. Distance (km) = Speed × Time</p>
        <p>2. Distance (nm) = km ÷ 1.852</p>
        <p>3. Degrees = nm ÷ 60</p>
      </div>

      <div class="mt-6">
        <h4 class="font-medium text-slate-700 mb-3">📝 Your Answer</h4>

        <div class="space-y-3">
          <div>
            <label class="text-sm text-slate-500">Latitude</label>
            <div class="flex items-center gap-2">
              <input type="number" id="ans-lat-deg" class="coord-input" min="0" max="90" placeholder="°">
              <span class="coord-label">°</span>
              <input type="number" id="ans-lat-min" class="coord-input" min="0" max="59" step="0.1" placeholder="'">
              <span class="coord-label">'</span>
              <select id="ans-lat-dir" class="select select-bordered select-sm w-16">
                <option value="N">N</option>
                <option value="S">S</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-sm text-slate-500">Longitude</label>
            <div class="flex items-center gap-2">
              <input type="number" id="ans-lon-deg" class="coord-input" min="0" max="180" placeholder="°">
              <span class="coord-label">°</span>
              <input type="number" id="ans-lon-min" class="coord-input" min="0" max="59" step="0.1" placeholder="'">
              <span class="coord-label">'</span>
              <select id="ans-lon-dir" class="select select-bordered select-sm w-16">
                <option value="E">E</option>
                <option value="W">W</option>
              </select>
            </div>
          </div>
        </div>

        <button id="submit-answer-btn" class="btn btn-primary w-full mt-4">
          Submit Answer
        </button>
      </div>

      <div id="result-display" class="mt-4 hidden"></div>
    `;
  }

  renderMercatorUI(challenge) {
    return `
      <div class="info-box mt-4">
        <p class="text-sm">📐 <strong>Simplified projection for learning</strong> - real navigation charts use true Mercator.</p>
      </div>

      <div class="mt-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="show-great-circle" class="checkbox checkbox-primary checkbox-sm">
          <span class="text-sm">Show Great Circle Route</span>
        </label>
      </div>

      ${challenge.objective ? `
        <div class="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p class="text-orange-700 text-sm font-medium">🎯 ${challenge.objective}</p>
        </div>
      ` : ''}

      <div class="grid grid-cols-2 gap-3 mt-4">
        <button id="place-a-btn" class="btn btn-outline border-red-300 text-red-600 hover:bg-red-50">
          📍 Place Point A
        </button>
        <button id="place-b-btn" class="btn btn-outline border-blue-300 text-blue-600 hover:bg-blue-50">
          📍 Place Point B
        </button>
      </div>

      <div id="measurement-info" class="mt-4 hidden">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="path-indicator rhumb"></span>
            <span class="text-sm">Rhumb Line:</span>
            <span id="rhumb-distance" class="font-mono">--</span>
          </div>
          <div class="flex items-center gap-2" id="great-circle-info" style="display: none;">
            <span class="path-indicator great-circle"></span>
            <span class="text-sm">Great Circle:</span>
            <span id="gc-distance" class="font-mono">--</span>
          </div>
        </div>
      </div>
    `;
  }

  renderTimeTrialUI(challenge) {
    return `
      <div class="text-center mt-4">
        <div class="stat">
          <div class="stat-title">Time</div>
          <div class="stat-value text-primary font-mono" id="timer-display">0:00</div>
          <div class="stat-desc">Complete all ${challenge.subChallenges?.length || 3} challenges</div>
        </div>
      </div>

      <div id="sub-challenge-container" class="mt-4">
        <!-- Sub-challenges will be rendered here -->
      </div>

      <button id="start-trial-btn" class="btn btn-primary w-full mt-4">
        ⏱️ Start Time Trial
      </button>
    `;
  }

  renderPlanningUI(challenge) {
    return `
      <div class="card bg-slate-50 p-4 mt-4">
        <h4 class="font-medium text-slate-700 mb-3">📋 Voyage Requirements</h4>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-slate-500">Start:</span>
            <div class="font-mono font-medium">${formatLatitude(challenge.start.lat)}</div>
            <div class="font-mono font-medium">${formatLongitude(challenge.start.lon)}</div>
          </div>
          <div>
            <span class="text-slate-500">Destination:</span>
            <div class="font-mono font-medium">${formatLatitude(challenge.destination.lat)}</div>
            <div class="font-mono font-medium">${formatLongitude(challenge.destination.lon)}</div>
          </div>
        </div>
        <div class="mt-3">
          <span class="text-slate-500">Time available:</span>
          <span class="font-mono font-medium ml-2">${challenge.time} hours</span>
        </div>
      </div>

      <div class="mt-6">
        <h4 class="font-medium text-slate-700 mb-3">📝 Your Plan</h4>

        <div class="space-y-3">
          <div>
            <label class="text-sm text-slate-500">Heading (°)</label>
            <input type="number" id="ans-heading" class="input input-bordered w-full" min="0" max="359" placeholder="Enter heading 0-359°">
          </div>

          <div>
            <label class="text-sm text-slate-500">Speed (knots)</label>
            <input type="number" id="ans-speed" class="input input-bordered w-full" min="1" max="100" step="0.1" placeholder="Enter speed">
          </div>
        </div>

        <button id="submit-plan-btn" class="btn btn-primary w-full mt-4">
          Submit Plan
        </button>
      </div>

      <div id="result-display" class="mt-4 hidden"></div>
    `;
  }

  bindChallengeEvents(challenge) {
    // Place point buttons
    document.getElementById('place-a-btn')?.addEventListener('click', () => {
      this.placingPoint = 'A';
      this.updatePlaceButtons();
    });

    document.getElementById('place-b-btn')?.addEventListener('click', () => {
      this.placingPoint = 'B';
      this.updatePlaceButtons();
    });

    document.getElementById('clear-points-btn')?.addEventListener('click', () => {
      this.globe?.clearPoints();
      this.currentPointA = null;
      this.currentPointB = null;
      this.placingPoint = null;
      this.updatePlaceButtons();
      document.getElementById('measurement-info')?.classList.add('hidden');
    });

    // Great circle toggle
    document.getElementById('show-great-circle')?.addEventListener('change', (e) => {
      this.globe?.showGreatCircleComparison(e.target.checked);
      const gcInfo = document.getElementById('great-circle-info');
      if (gcInfo) {
        gcInfo.style.display = e.target.checked ? 'flex' : 'none';
      }
    });

    // Submit answer
    document.getElementById('submit-answer-btn')?.addEventListener('click', () => {
      this.submitAnswer(challenge);
    });

    // Show solution
    document.getElementById('show-solution-btn')?.addEventListener('click', () => {
      this.showSolution(challenge);
    });

    // Submit plan
    document.getElementById('submit-plan-btn')?.addEventListener('click', () => {
      this.submitPlan(challenge);
    });

    // Start time trial
    document.getElementById('start-trial-btn')?.addEventListener('click', () => {
      this.startTimeTrial(challenge);
    });
  }

  updatePlaceButtons() {
    const btnA = document.getElementById('place-a-btn');
    const btnB = document.getElementById('place-b-btn');

    if (btnA) {
      if (this.placingPoint === 'A') {
        btnA.classList.add('btn-active', 'ring-2', 'ring-red-400');
        btnA.textContent = '📍 Click on globe...';
      } else if (this.currentPointA) {
        btnA.classList.remove('btn-active', 'ring-2', 'ring-red-400');
        btnA.textContent = '✓ Point A placed';
      } else {
        btnA.classList.remove('btn-active', 'ring-2', 'ring-red-400');
        btnA.textContent = '📍 Place Point A';
      }
    }

    if (btnB) {
      if (this.placingPoint === 'B') {
        btnB.classList.add('btn-active', 'ring-2', 'ring-blue-400');
        btnB.textContent = '📍 Click on globe...';
      } else if (this.currentPointB) {
        btnB.classList.remove('btn-active', 'ring-2', 'ring-blue-400');
        btnB.textContent = '✓ Point B placed';
      } else {
        btnB.classList.remove('btn-active', 'ring-2', 'ring-blue-400');
        btnB.textContent = '📍 Place Point B';
      }
    }
  }

  updateMeasurementInfo() {
    if (!this.currentPointA || !this.currentPointB) return;

    const infoEl = document.getElementById('measurement-info');
    if (!infoEl) return;

    infoEl.classList.remove('hidden');

    const distance = calculateDistance(
      this.currentPointA.lat, this.currentPointA.lon,
      this.currentPointB.lat, this.currentPointB.lon
    );

    const formatted = formatDistance(distance);

    const nmEl = document.getElementById('distance-nm');
    const kmEl = document.getElementById('distance-km');
    const coordAEl = document.getElementById('point-a-coords');
    const coordBEl = document.getElementById('point-b-coords');

    if (nmEl) nmEl.textContent = `${formatted.nm} nm`;
    if (kmEl) kmEl.textContent = `(${formatted.km} km)`;
    if (coordAEl) coordAEl.textContent = `${formatLatitude(this.currentPointA.lat)}, ${formatLongitude(this.currentPointA.lon)}`;
    if (coordBEl) coordBEl.textContent = `${formatLatitude(this.currentPointB.lat)}, ${formatLongitude(this.currentPointB.lon)}`;

    // Check for discovery challenges
    const chapter = chapters.find(c => c.id === this.state.currentChapter);
    const challenge = chapter?.challenges[this.state.currentChallenge];

    if (challenge?.type === 'discovery' && challenge.discovery) {
      // Check if points are close to targets
      const distA = calculateDistance(
        this.currentPointA.lat, this.currentPointA.lon,
        challenge.targetA.lat, challenge.targetA.lon
      );
      const distB = calculateDistance(
        this.currentPointB.lat, this.currentPointB.lon,
        challenge.targetB.lat, challenge.targetB.lon
      );

      if (distA < challenge.tolerance && distB < challenge.tolerance) {
        document.getElementById('discovery-reveal')?.classList.remove('hidden');
      }
    }
  }

  submitAnswer(challenge) {
    const latDeg = parseFloat(document.getElementById('ans-lat-deg')?.value) || 0;
    const latMin = parseFloat(document.getElementById('ans-lat-min')?.value) || 0;
    const latDir = document.getElementById('ans-lat-dir')?.value || 'N';
    const lonDeg = parseFloat(document.getElementById('ans-lon-deg')?.value) || 0;
    const lonMin = parseFloat(document.getElementById('ans-lon-min')?.value) || 0;
    const lonDir = document.getElementById('ans-lon-dir')?.value || 'W';

    const answerLat = dmToDecimal(latDeg, latMin, latDir);
    const answerLon = dmToDecimal(lonDeg, lonMin, lonDir);

    const error = calculateError(
      answerLat, answerLon,
      challenge.expected.lat, challenge.expected.lon
    );

    const distanceTraveled = challenge.speed * challenge.time;
    const stars = calculateStarRating(error.distanceNM, distanceTraveled);
    const timeTaken = Math.round((Date.now() - this.challengeStartTime) / 1000);

    this.showResult(challenge, stars, error, timeTaken);

    // Update state
    if (stars > 0) {
      this.state = completeChallenge(
        this.state,
        this.state.currentChapter,
        this.state.currentChallenge,
        stars,
        timeTaken
      );

      this.state = updateAchievement(this.state, 'deadReckoner');

      if (stars === 3) {
        this.perfectStreak++;
        if (this.perfectStreak >= 3) {
          this.state = updateAchievement(this.state, 'precisionNavigator', 3);
        }
      } else {
        this.perfectStreak = 0;
      }

      // Increment nautical calculations
      this.state.userProgress.calculationsInNautical++;
      saveState(this.state);
    }

    this.updateProgressBar();
  }

  showResult(challenge, stars, error, timeTaken) {
    const resultEl = document.getElementById('result-display');
    if (!resultEl) return;

    resultEl.classList.remove('hidden');

    const starIcons = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    const errorFormatted = formatDistance(error.distanceNM);

    let message = '';
    let alertClass = '';

    if (stars === 3) {
      message = `Perfect! You're only ${errorFormatted.display} off.`;
      alertClass = 'alert-success';
    } else if (stars === 2) {
      message = `Good! You're ${errorFormatted.display} off.`;
      alertClass = 'alert-info';
    } else if (stars === 1) {
      message = `Close! You're ${errorFormatted.display} off.`;
      alertClass = 'alert-warning';
    } else {
      message = `You're ${errorFormatted.display} off. Try again!`;
      alertClass = 'alert-error';
    }

    resultEl.innerHTML = `
      <div class="alert ${alertClass}">
        <div>
          <div class="text-2xl mb-2">${starIcons}</div>
          <p>${message}</p>
          <p class="text-sm mt-1">Time: ${timeTaken} seconds</p>
        </div>
      </div>

      ${stars > 0 ? `
        <button id="continue-btn" class="btn btn-primary w-full mt-4">
          Continue
        </button>
      ` : `
        <button id="retry-btn" class="btn btn-outline w-full mt-4">
          Try Again
        </button>
      `}
    `;

    document.getElementById('continue-btn')?.addEventListener('click', () => {
      this.nextChallenge();
    });

    document.getElementById('retry-btn')?.addEventListener('click', () => {
      this.loadChallenge(this.state.currentChallenge);
    });
  }

  showSolution(challenge) {
    const resultEl = document.getElementById('result-display');
    if (!resultEl) return;

    resultEl.classList.remove('hidden');
    resultEl.innerHTML = `
      <div class="alert alert-info">
        <div>
          <h4 class="font-bold">Solution</h4>
          <p class="font-mono mt-2">
            ${formatLatitude(challenge.expected.lat)}, ${formatLongitude(challenge.expected.lon)}
          </p>
          ${challenge.explanation ? `
            <p class="text-sm mt-2">${challenge.explanation}</p>
          ` : ''}
        </div>
      </div>

      <button id="continue-btn" class="btn btn-primary w-full mt-4">
        Continue
      </button>
    `;

    // Track hint usage
    this.state.userProgress.hintsUsed++;
    saveState(this.state);

    document.getElementById('continue-btn')?.addEventListener('click', () => {
      this.nextChallenge();
    });
  }

  submitPlan(challenge) {
    const heading = parseFloat(document.getElementById('ans-heading')?.value) || 0;
    const speed = parseFloat(document.getElementById('ans-speed')?.value) || 0;

    // Validate
    const isHeadingValid = heading >= challenge.acceptableHeadings[0] && heading <= challenge.acceptableHeadings[1];
    const isSpeedValid = speed >= challenge.acceptableSpeeds[0] && speed <= challenge.acceptableSpeeds[1];

    const resultEl = document.getElementById('result-display');
    if (!resultEl) return;

    resultEl.classList.remove('hidden');

    if (isHeadingValid && isSpeedValid) {
      resultEl.innerHTML = `
        <div class="alert alert-success">
          <div>
            <div class="text-2xl mb-2">⭐⭐⭐</div>
            <p>Excellent voyage planning! Your heading of ${heading}° and speed of ${speed} knots will get you there in time.</p>
          </div>
        </div>
        <button id="continue-btn" class="btn btn-primary w-full mt-4">Continue</button>
      `;

      this.state = completeChallenge(
        this.state,
        this.state.currentChapter,
        this.state.currentChallenge,
        3,
        Math.round((Date.now() - this.challengeStartTime) / 1000)
      );
    } else {
      let feedback = [];
      if (!isHeadingValid) feedback.push(`Heading should be between ${challenge.acceptableHeadings[0]}° and ${challenge.acceptableHeadings[1]}°`);
      if (!isSpeedValid) feedback.push(`Speed should be between ${challenge.acceptableSpeeds[0]} and ${challenge.acceptableSpeeds[1]} knots`);

      resultEl.innerHTML = `
        <div class="alert alert-warning">
          <div>
            <p>Not quite right:</p>
            <ul class="text-sm mt-2">
              ${feedback.map(f => `<li>• ${f}</li>`).join('')}
            </ul>
          </div>
        </div>
        <button id="retry-btn" class="btn btn-outline w-full mt-4">Try Again</button>
      `;
    }

    document.getElementById('continue-btn')?.addEventListener('click', () => this.nextChallenge());
    document.getElementById('retry-btn')?.addEventListener('click', () => {
      resultEl.classList.add('hidden');
    });
  }

  startTimeTrial(challenge) {
    // Time trial implementation
    const btn = document.getElementById('start-trial-btn');
    if (btn) btn.disabled = true;

    const timerEl = document.getElementById('timer-display');
    const startTime = Date.now();

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      if (timerEl) timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      if (!this.timeTrialComplete) {
        requestAnimationFrame(updateTimer);
      }
    };

    this.timeTrialComplete = false;
    updateTimer();

    // Render first sub-challenge
    this.currentSubChallenge = 0;
    this.renderSubChallenge(challenge);
  }

  renderSubChallenge(challenge) {
    const container = document.getElementById('sub-challenge-container');
    if (!container || !challenge.subChallenges) return;

    const sub = challenge.subChallenges[this.currentSubChallenge];
    if (!sub) {
      // All done
      this.timeTrialComplete = true;
      this.showTimeTrialResult(challenge);
      return;
    }

    container.innerHTML = `
      <div class="card bg-slate-50 p-4">
        <div class="badge badge-primary mb-2">Challenge ${this.currentSubChallenge + 1}/${challenge.subChallenges.length}</div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>Start: ${formatLatitude(sub.start.lat)}, ${formatLongitude(sub.start.lon)}</div>
          <div>Heading: ${sub.heading}°</div>
          <div>Speed: ${sub.speed} knots</div>
          <div>Time: ${sub.time} hours</div>
        </div>

        <div class="mt-4 space-y-2">
          <div class="flex items-center gap-2">
            <input type="number" id="sub-lat-deg" class="coord-input" min="0" max="90">°
            <input type="number" id="sub-lat-min" class="coord-input" min="0" max="59">'
            <select id="sub-lat-dir" class="select select-bordered select-sm w-14">
              <option>N</option><option>S</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input type="number" id="sub-lon-deg" class="coord-input" min="0" max="180">°
            <input type="number" id="sub-lon-min" class="coord-input" min="0" max="59">'
            <select id="sub-lon-dir" class="select select-bordered select-sm w-14">
              <option>W</option><option>E</option>
            </select>
          </div>
        </div>

        <button id="sub-submit-btn" class="btn btn-primary btn-sm w-full mt-3">Submit</button>
      </div>
    `;

    document.getElementById('sub-submit-btn')?.addEventListener('click', () => {
      const latDeg = parseFloat(document.getElementById('sub-lat-deg')?.value) || 0;
      const latMin = parseFloat(document.getElementById('sub-lat-min')?.value) || 0;
      const latDir = document.getElementById('sub-lat-dir')?.value || 'N';
      const lonDeg = parseFloat(document.getElementById('sub-lon-deg')?.value) || 0;
      const lonMin = parseFloat(document.getElementById('sub-lon-min')?.value) || 0;
      const lonDir = document.getElementById('sub-lon-dir')?.value || 'W';

      // Calculate expected
      const expected = calculateRhumbDestination(sub.start.lat, sub.start.lon, sub.heading, sub.speed * sub.time);
      const answer = {
        lat: dmToDecimal(latDeg, latMin, latDir),
        lon: dmToDecimal(lonDeg, lonMin, lonDir)
      };

      const error = calculateError(answer.lat, answer.lon, expected.lat, expected.lon);
      const stars = calculateStarRating(error.distanceNM, sub.speed * sub.time);

      if (stars > 0) {
        this.currentSubChallenge++;
        this.renderSubChallenge(challenge);
      } else {
        container.querySelector('.card')?.classList.add('border-error', 'border-2');
        setTimeout(() => {
          container.querySelector('.card')?.classList.remove('border-error', 'border-2');
        }, 500);
      }
    });
  }

  showTimeTrialResult(challenge) {
    const elapsed = Math.floor((Date.now() - this.challengeStartTime) / 1000);
    let medal = '';
    let stars = 1;

    if (elapsed <= challenge.timeBonus.gold) {
      medal = '🥇 Gold';
      stars = 3;
      this.state = updateAchievement(this.state, 'speedDemon');
    } else if (elapsed <= challenge.timeBonus.silver) {
      medal = '🥈 Silver';
      stars = 2;
    } else if (elapsed <= challenge.timeBonus.bronze) {
      medal = '🥉 Bronze';
    }

    const container = document.getElementById('sub-challenge-container');
    if (container) {
      container.innerHTML = `
        <div class="alert alert-success">
          <div class="text-center w-full">
            <div class="text-4xl mb-2">${medal}</div>
            <p class="text-xl font-bold">Completed in ${elapsed} seconds!</p>
            <p class="text-sm mt-2">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</p>
          </div>
        </div>
        <button id="continue-btn" class="btn btn-primary w-full mt-4">Continue</button>
      `;

      document.getElementById('continue-btn')?.addEventListener('click', () => this.nextChallenge());
    }

    this.state = completeChallenge(this.state, this.state.currentChapter, this.state.currentChallenge, stars, elapsed);
  }

  prevChallenge() {
    if (this.state.currentChallenge > 0) {
      this.loadChallenge(this.state.currentChallenge - 1);
    } else if (this.state.currentChapter > 1) {
      // Go to previous chapter's last challenge
      const prevChapter = chapters.find(c => c.id === this.state.currentChapter - 1);
      if (prevChapter) {
        this.state.currentChapter = prevChapter.id;
        saveState(this.state);
        this.loadChallenge(prevChapter.challenges.length - 1);
      }
    }
  }

  nextChallenge() {
    const chapter = chapters.find(c => c.id === this.state.currentChapter);
    if (!chapter) return;

    if (this.state.currentChallenge < chapter.challenges.length - 1) {
      this.loadChallenge(this.state.currentChallenge + 1);
    } else {
      // Chapter complete
      this.state = completeChapter(this.state, this.state.currentChapter);

      if (this.state.currentChapter === 4) {
        this.state = updateAchievement(this.state, 'chartMaster', 4);
      }

      if (this.state.currentChapter < 5) {
        // Go to next chapter
        this.loadChapter(this.state.currentChapter + 1);
      } else {
        // All chapters complete, show quiz
        this.showQuiz();
      }
    }
  }

  updateNavButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
      prevBtn.disabled = this.state.currentChapter === 1 && this.state.currentChallenge === 0;
    }
  }

  updateProgressBar() {
    const label = document.getElementById('chapter-label');
    const progress = document.getElementById('chapter-progress');
    const starsEl = document.getElementById('total-stars');

    const chapter = chapters.find(c => c.id === this.state.currentChapter);
    if (!chapter) return;

    if (label) label.textContent = `Chapter ${chapter.id}/5`;
    if (progress) {
      const chapterProgress = getChapterProgress(this.state, chapter.id);
      progress.value = chapterProgress.percentage;
    }
    if (starsEl) starsEl.textContent = this.state.userProgress.scores.totalStars;
  }

  showChapterMenu() {
    const modal = document.getElementById('chapter-modal');
    const list = document.getElementById('chapter-list');
    if (!modal || !list) return;

    list.innerHTML = chapters.map(chapter => {
      const isUnlocked = isChapterUnlocked(this.state, chapter.id);
      const progress = getChapterProgress(this.state, chapter.id);
      const isCurrent = chapter.id === this.state.currentChapter;

      return `
        <div class="card ${isCurrent ? 'bg-primary/10 border-primary' : 'bg-base-100'} border p-4 ${isUnlocked ? 'cursor-pointer hover:shadow-md' : 'opacity-50'}"
             ${isUnlocked ? `data-chapter="${chapter.id}"` : ''}>
          <div class="flex items-center gap-4">
            <span class="text-3xl">${chapter.icon}</span>
            <div class="flex-1">
              <h4 class="font-bold">${chapter.title}</h4>
              <p class="text-sm text-slate-600">${chapter.description}</p>
              <div class="flex items-center gap-2 mt-2">
                <progress class="progress progress-primary w-24" value="${progress.percentage}" max="100"></progress>
                <span class="text-xs text-slate-500">${progress.completed}/${progress.total}</span>
                <span class="text-xs">⭐ ${progress.stars}/${progress.maxStars}</span>
              </div>
            </div>
            ${isUnlocked ? '' : '<span class="badge badge-ghost">🔒 Locked</span>'}
          </div>
        </div>
      `;
    }).join('');

    // Bind click events
    list.querySelectorAll('[data-chapter]').forEach(el => {
      el.addEventListener('click', () => {
        const chapterId = parseInt(el.dataset.chapter);
        this.loadChapter(chapterId);
        modal.close();
      });
    });

    modal.showModal();
  }

  showQuiz() {
    this.currentMode = 'quiz';
    this.quizAnswers = [];
    this.currentQuestion = 0;

    const panel = document.getElementById('panel-content');
    if (!panel) return;

    this.renderQuizQuestion();
  }

  renderQuizQuestion() {
    const panel = document.getElementById('panel-content');
    if (!panel) return;

    const question = quizQuestions[this.currentQuestion];
    if (!question) {
      this.showQuizResults();
      return;
    }

    panel.innerHTML = `
      <div class="space-y-4 animate-fade-in">
        <div class="flex items-center justify-between">
          <span class="badge badge-primary">Final Quiz</span>
          <span class="text-sm text-slate-500">Question ${this.currentQuestion + 1}/${quizQuestions.length}</span>
        </div>

        <progress class="progress progress-primary w-full" value="${(this.currentQuestion / quizQuestions.length) * 100}" max="100"></progress>

        <h2 class="text-lg font-bold text-slate-800">${question.question}</h2>

        <div class="space-y-2">
          ${question.options.map(opt => `
            <button class="quiz-option btn btn-outline w-full justify-start text-left h-auto py-3" data-option="${opt.id}">
              <span class="badge badge-ghost mr-2">${opt.id.toUpperCase()}</span>
              ${opt.text}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    panel.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const optionId = btn.dataset.option;
        this.answerQuizQuestion(question, optionId);
      });
    });
  }

  answerQuizQuestion(question, answerId) {
    const correct = question.options.find(o => o.correct)?.id === answerId;
    this.quizAnswers.push({ questionId: question.id, answerId, correct });

    const panel = document.getElementById('panel-content');
    if (!panel) return;

    const selectedOption = question.options.find(o => o.id === answerId);
    const correctOption = question.options.find(o => o.correct);

    panel.innerHTML = `
      <div class="space-y-4 animate-fade-in">
        <div class="alert ${correct ? 'alert-success' : 'alert-error'}">
          <div>
            <p class="font-bold">${correct ? '✓ Correct!' : '✗ Not quite'}</p>
            ${!correct ? `<p class="text-sm mt-1">The correct answer was: ${correctOption?.text}</p>` : ''}
          </div>
        </div>

        <div class="info-box">
          <p class="text-sm">${question.explanation}</p>
        </div>

        <button id="next-question-btn" class="btn btn-primary w-full">
          ${this.currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
        </button>
      </div>
    `;

    document.getElementById('next-question-btn')?.addEventListener('click', () => {
      this.currentQuestion++;
      this.renderQuizQuestion();
    });
  }

  showQuizResults() {
    const correct = this.quizAnswers.filter(a => a.correct).length;
    const total = quizQuestions.length;
    const percentage = Math.round((correct / total) * 100);

    let medal = '';
    if (correct === total) {
      medal = '🏆 Navigation Expert';
      this.state = updateAchievement(this.state, 'navigationExpert');
    } else if (correct >= 8) {
      medal = '🥇 Gold';
    } else if (correct >= 6) {
      medal = '🥈 Silver';
    } else {
      medal = '🥉 Bronze';
    }

    const panel = document.getElementById('panel-content');
    if (!panel) return;

    panel.innerHTML = `
      <div class="text-center space-y-6 animate-fade-in">
        <div class="text-6xl">${medal.split(' ')[0]}</div>
        <h2 class="text-2xl font-bold">${medal}</h2>

        <div class="stat bg-primary/10 rounded-xl">
          <div class="stat-title">Score</div>
          <div class="stat-value text-primary">${correct}/${total}</div>
          <div class="stat-desc">${percentage}% correct</div>
        </div>

        <p class="text-slate-600">
          ${correct === total ?
            'Perfect score! You truly understand why nautical miles and knots are the natural choice for navigation.' :
            'Great effort! You\'ve learned the fundamentals of nautical navigation. Keep practicing!'}
        </p>

        <div class="flex flex-col gap-2">
          <button id="restart-quiz-btn" class="btn btn-outline">Retake Quiz</button>
          <button id="finish-btn" class="btn btn-primary">Finish</button>
        </div>
      </div>
    `;

    document.getElementById('restart-quiz-btn')?.addEventListener('click', () => {
      this.showQuiz();
    });

    document.getElementById('finish-btn')?.addEventListener('click', () => {
      this.showCompletionScreen();
    });
  }

  showCompletionScreen() {
    const panel = document.getElementById('panel-content');
    if (!panel) return;

    const stats = this.state.userProgress;

    panel.innerHTML = `
      <div class="text-center space-y-6 animate-fade-in">
        <div class="text-6xl">🎉</div>
        <h2 class="text-2xl font-bold text-gradient">Congratulations!</h2>

        <p class="text-slate-600">
          You've completed the Nautical Navigation Learning Experience!
        </p>

        <div class="stats stats-vertical shadow w-full">
          <div class="stat">
            <div class="stat-title">Total Stars</div>
            <div class="stat-value text-warning">⭐ ${stats.scores.totalStars}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Challenges Completed</div>
            <div class="stat-value">${stats.challengesCompleted.length}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Time Spent</div>
            <div class="stat-value text-sm">${Math.round(stats.totalTime / 60)} minutes</div>
          </div>
        </div>

        <div class="divider">Achievements</div>

        <div class="grid grid-cols-3 gap-2">
          ${Object.entries(this.state.achievements).map(([key, achievement]) => `
            <div class="flex flex-col items-center p-2 ${achievement.unlocked ? '' : 'opacity-30'}">
              <span class="text-2xl">${achievements[key]?.icon || '🏅'}</span>
              <span class="text-xs text-center mt-1">${achievements[key]?.name || key}</span>
            </div>
          `).join('')}
        </div>

        <button id="play-again-btn" class="btn btn-primary w-full">Play Again</button>
      </div>
    `;

    document.getElementById('play-again-btn')?.addEventListener('click', () => {
      this.loadChapter(1);
    });
  }

  toggleGlobeCollapse() {
    const globeSection = document.getElementById('globe-section');
    const controlPanel = document.getElementById('control-panel');
    const collapseBtn = document.getElementById('collapse-globe-btn');

    const isCollapsed = globeSection?.classList.contains('section-collapsed');

    if (isCollapsed) {
      // Expand globe
      globeSection?.classList.remove('section-collapsed');
      globeSection?.classList.add('section-expanded');
      controlPanel?.classList.remove('section-expanded');
      controlPanel?.classList.add('section-collapsed');
      if (collapseBtn) {
        // Up chevron when expanded (click to collapse)
        collapseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>`;
      }
    } else {
      // Collapse globe
      globeSection?.classList.add('section-collapsed');
      globeSection?.classList.remove('section-expanded');
      controlPanel?.classList.remove('section-collapsed');
      controlPanel?.classList.add('section-expanded');
      if (collapseBtn) {
        // Down chevron when collapsed (click to expand)
        collapseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>`;
      }
    }

    // Trigger globe resize after transition
    setTimeout(() => this.globe?.onResize(), 150);
  }

  goHome() {
    // Clean up
    if (this.globe) {
      this.globe.dispose();
      this.globe = null;
    }

    document.getElementById('game-screen')?.classList.add('hidden');
    document.getElementById('landing-screen')?.classList.remove('hidden');

    // Reinitialize landing globe
    this.initLandingGlobe();
    this.currentMode = 'landing';
  }

  updateUI() {
    // Apply saved settings
    const hintsToggle = document.getElementById('show-hints-toggle');
    const gridToggle = document.getElementById('show-grid-toggle');
    const rotationSlider = document.getElementById('rotation-speed');

    if (hintsToggle) hintsToggle.checked = this.state.settings.showHints;
    if (gridToggle) gridToggle.checked = this.state.settings.showGrid;
    if (rotationSlider) rotationSlider.value = this.state.settings.rotationSpeed;
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} animate-slide-in-right`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new NauticalApp();
});

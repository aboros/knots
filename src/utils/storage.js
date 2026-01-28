/**
 * LocalStorage persistence for game state
 */

const STORAGE_KEY = 'nautical-navigation-game';
const VERSION = '1.0';

/**
 * Default state structure
 */
export const defaultState = {
  currentChapter: 1,
  currentChallenge: 0,
  userProgress: {
    chaptersCompleted: [],
    challengesCompleted: [],
    scores: {
      totalStars: 0,
      perfectAnswers: 0
    },
    totalTime: 0,
    calculationsInNautical: 0,
    calculationsInMetric: 0,
    hintsUsed: 0
  },
  achievements: {
    globeTrotter: { unlocked: false, progress: 0 },
    deadReckoner: { unlocked: false, progress: 0 },
    speedDemon: { unlocked: false, progress: 0 },
    precisionNavigator: { unlocked: false, progress: 0 },
    chartMaster: { unlocked: false, progress: 0 },
    navigationExpert: { unlocked: false, progress: 0 }
  },
  settings: {
    showHints: true,
    showGrid: true,
    rotationSpeed: 1.0,
    tutorialCompleted: false
  },
  tutorialProgress: {
    globeRotated: false,
    pointAPlaced: false,
    pointBPlaced: false
  },
  sessionStartTime: null,
  firstVisitNoticeShown: false,
  version: VERSION
};

/**
 * Load state from localStorage
 */
export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { ...defaultState, sessionStartTime: Date.now() };
    }

    const parsed = JSON.parse(saved);

    // Version migration if needed
    if (parsed.version !== VERSION) {
      return migrateState(parsed);
    }

    // Update session start time
    parsed.sessionStartTime = Date.now();

    return { ...defaultState, ...parsed };
  } catch (error) {
    console.error('Failed to load state:', error);
    return { ...defaultState, sessionStartTime: Date.now() };
  }
}

/**
 * Save state to localStorage
 */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

/**
 * Migrate state from older versions
 */
function migrateState(oldState) {
  // For now, just merge with defaults
  return {
    ...defaultState,
    ...oldState,
    version: VERSION,
    sessionStartTime: Date.now()
  };
}

/**
 * Reset all progress
 */
export function resetProgress() {
  const newState = {
    ...defaultState,
    sessionStartTime: Date.now(),
    firstVisitNoticeShown: true // Keep this flag
  };
  saveState(newState);
  return newState;
}

/**
 * Update a specific part of state
 */
export function updateState(state, path, value) {
  const keys = path.split('.');
  const newState = { ...state };
  let current = newState;

  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = { ...current[keys[i]] };
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
  saveState(newState);
  return newState;
}

/**
 * Complete a challenge
 */
export function completeChallenge(state, chapter, challenge, stars, time) {
  const newState = { ...state };

  // Add to completed challenges
  const challengeData = { chapter, challenge, stars, time };
  const existingIndex = newState.userProgress.challengesCompleted.findIndex(
    c => c.chapter === chapter && c.challenge === challenge
  );

  if (existingIndex >= 0) {
    // Update if better score
    const existing = newState.userProgress.challengesCompleted[existingIndex];
    if (stars > existing.stars || (stars === existing.stars && time < existing.time)) {
      newState.userProgress.challengesCompleted[existingIndex] = challengeData;
    }
  } else {
    newState.userProgress.challengesCompleted.push(challengeData);
  }

  // Update total stars
  newState.userProgress.scores.totalStars = newState.userProgress.challengesCompleted.reduce(
    (sum, c) => sum + c.stars, 0
  );

  // Update perfect answers
  if (stars === 3) {
    newState.userProgress.scores.perfectAnswers++;
  }

  // Update total time
  newState.userProgress.totalTime += time;

  saveState(newState);
  return newState;
}

/**
 * Complete a chapter
 */
export function completeChapter(state, chapter) {
  const newState = { ...state };

  if (!newState.userProgress.chaptersCompleted.includes(chapter)) {
    newState.userProgress.chaptersCompleted.push(chapter);
  }

  saveState(newState);
  return newState;
}

/**
 * Update achievement progress
 */
export function updateAchievement(state, achievementKey, increment = 1) {
  const newState = { ...state };
  const achievement = newState.achievements[achievementKey];

  if (!achievement || achievement.unlocked) return state;

  achievement.progress += increment;

  // Check unlock conditions
  const unlockConditions = {
    globeTrotter: 10,
    deadReckoner: 5,
    speedDemon: 1, // Special condition
    precisionNavigator: 3,
    chartMaster: 5,
    navigationExpert: 1 // Special condition
  };

  if (achievement.progress >= unlockConditions[achievementKey]) {
    achievement.unlocked = true;
  }

  saveState(newState);
  return newState;
}

/**
 * Get chapter progress
 */
export function getChapterProgress(state, chapter) {
  const chapterChallenges = state.userProgress.challengesCompleted.filter(
    c => c.chapter === chapter
  );

  const totalChallenges = getChallengeCount(chapter);
  const completed = chapterChallenges.length;
  const stars = chapterChallenges.reduce((sum, c) => sum + c.stars, 0);
  const maxStars = totalChallenges * 3;

  return {
    completed,
    total: totalChallenges,
    stars,
    maxStars,
    percentage: Math.round((completed / totalChallenges) * 100)
  };
}

/**
 * Get total challenge count for a chapter
 */
function getChallengeCount(chapter) {
  const counts = {
    1: 3, // Chapter 1: Introduction
    2: 4, // Chapter 2: North-South
    3: 4, // Chapter 3: East-West
    4: 4, // Chapter 4: Mercator
    5: 5  // Chapter 5: Time Trial
  };
  return counts[chapter] || 3;
}

/**
 * Check if chapter is unlocked
 */
export function isChapterUnlocked(state, chapter) {
  if (chapter === 1) return true;
  return state.userProgress.chaptersCompleted.includes(chapter - 1);
}

/**
 * Get settings
 */
export function getSettings(state) {
  return state.settings;
}

/**
 * Update settings
 */
export function updateSettings(state, settings) {
  const newState = {
    ...state,
    settings: { ...state.settings, ...settings }
  };
  saveState(newState);
  return newState;
}

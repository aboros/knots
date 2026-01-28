# SimpleAnalytics Event Tracking Strategy

## Overview

This document outlines the strategy for tracking user interactions, progress, and success metrics in the Nautical Navigation Learning Experience using SimpleAnalytics custom events.

**Goals:**
- Understand user engagement and learning patterns
- Identify where users struggle or drop off
- Measure educational effectiveness
- Track feature usage and preferences
- Monitor completion rates and success metrics

## Event Naming Convention

SimpleAnalytics events use lowercase alphanumeric characters and underscores only. We'll follow this pattern:

```
[category]_[action]_[optional_detail]
```

Examples:
- `app_start` - App initialization
- `tutorial_step_complete` - Tutorial progress
- `challenge_complete_chapter_1_challenge_2` - Challenge completion with context
- `achievement_unlock_globe_trotter` - Achievement unlocked

## Event Categories

### 1. App Lifecycle Events

Track the overall user journey through the application.

| Event Name | When to Fire | Metadata |
|------------|--------------|----------|
| `app_start` | When app initializes (DOMContentLoaded) | `{ first_visit: boolean, has_progress: boolean }` |
| `app_landing_view` | Landing screen is displayed | `{ returning_user: boolean }` |
| `app_start_learning` | User clicks "Start Learning" button | `{ tutorial_completed: boolean }` |
| `app_home_click` | User clicks home button from game screen | `{ from_chapter: number, from_challenge: number }` |
| `app_reset_progress` | User resets all progress in settings | `{ chapters_completed: number, total_stars: number }` |

### 2. Tutorial Events

Track tutorial engagement and completion.

| Event Name | When to Fire | Metadata |
|------------|--------------|----------|
| `tutorial_start` | Tutorial begins (first time users) | None |
| `tutorial_step_complete` | User completes a tutorial step | `{ step_number: number, step_type: string }` |
| `tutorial_globe_rotate` | User rotates globe during tutorial | None |
| `tutorial_point_a_placed` | User places Point A during tutorial | None |
| `tutorial_point_b_placed` | User places Point B during tutorial | None |
| `tutorial_complete` | Tutorial completed successfully | `{ steps_completed: number, time_seconds: number }` |
| `tutorial_skip` | User skips tutorial | `{ step_when_skipped: number }` |

### 3. Chapter Navigation Events

Track how users navigate through chapters.

| Event Name | When to Fire | Metadata |
|------------|--------------|----------|
| `chapter_load` | Chapter is loaded/displayed | `{ chapter_id: number, chapter_title: string, is_unlocked: boolean }` |
| `chapter_menu_open` | Chapter menu modal opens | `{ current_chapter: number }` |
| `chapter_menu_select` | User selects chapter from menu | `{ from_chapter: number, to_chapter: number }` |
| `chapter_complete` | Chapter is completed | `{ chapter_id: number, stars_earned: number, time_seconds: number }` |
| `chapter_next` | User navigates to next chapter | `{ from_chapter: number, to_chapter: number }` |
| `chapter_prev` | User navigates to previous chapter | `{ from_chapter: number, to_chapter: number }` |

### 4. Challenge Events

Track individual challenge interactions and outcomes.

| Event Name | When to Fire | Metadata |
|------------|--------------|----------|
| `challenge_start` | Challenge begins loading | `{ chapter_id: number, challenge_id: number, challenge_type: string }` |
| `challenge_view` | Challenge is displayed to user | `{ chapter_id: number, challenge_id: number, challenge_type: string, is_first_attempt: boolean }` |
| `challenge_point_place` | User places a point (A or B) | `{ chapter_id: number, challenge_id: number, point_type: 'A'\|'B', lat: number, lon: number }` |
| `challenge_point_clear` | User clears placed points | `{ chapter_id: number, challenge_id: number }` |
| `challenge_distance_measure` | Distance is calculated between points | `{ chapter_id: number, challenge_id: number, distance_nm: number, distance_km: number }` |
| `challenge_answer_submit` | User submits an answer | `{ chapter_id: number, challenge_id: number, challenge_type: string, time_seconds: number }` |
| `challenge_answer_correct` | Answer is correct (any stars) | `{ chapter_id: number, challenge_id: number, stars: number, error_nm: number, time_seconds: number }` |
| `challenge_answer_incorrect` | Answer is incorrect (0 stars) | `{ chapter_id: number, challenge_id: number, error_nm: number, time_seconds: number }` |
| `challenge_complete` | Challenge completed successfully | `{ chapter_id: number, challenge_id: number, stars: number, time_seconds: number, attempts: number }` |
| `challenge_retry` | User clicks "Try Again" after failure | `{ chapter_id: number, challenge_id: number, previous_stars: number }` |
| `challenge_solution_view` | User clicks "Show Solution" | `{ chapter_id: number, challenge_id: number }` |
| `challenge_hint_view` | User expands hints section | `{ chapter_id: number, challenge_id: number, hint_count: number }` |
| `challenge_continue` | User continues to next challenge after completion | `{ chapter_id: number, challenge_id: number, stars: number }` |

**Challenge Types:**
- `exploration` - Free exploration challenges
- `measurement` - Distance measurement challenges
- `discovery` - Discovery-based challenges
- `deadReckoning` - Position calculation challenges
- `comparison` - Metric vs nautical comparison
- `mercator` - Chart reading challenges
- `timeTrial` - Speed challenges
- `planning` - Voyage planning challenges

### 5. Quiz Events

Track final quiz performance.

| Event Name | When to Fire | Metadata |
|------------|--------------|----------|
| `quiz_start` | Quiz begins | `{ total_questions: number }` |
| `quiz_question_view` | Question is displayed | `{ question_number: number, question_id: number }` |
| `quiz_answer_submit` | User selects an answer | `{ question_number: number, question_id: number, answer_id: string }` |
| `quiz_answer_correct` | Answer is correct | `{ question_number: number, question_id: number }` |
| `quiz_answer_incorrect` | Answer is incorrect | `{ question_number: number, question_id: number, correct_answer: string }` |
| `quiz_complete` | Quiz completed | `{ score: number, total: number, percentage: number, time_seconds: number }` |
| `quiz_retake` | User retakes quiz | `{ previous_score: number }` |

### 6. Achievement Events

Track achievement progress and unlocks.

| Event Name | When to Fire | Metadata |
|------------|--------------|----------|
| `achievement_progress` | Achievement progress updates | `{ achievement_key: string, progress: number, requirement: number }` |
| `achievement_unlock` | Achievement is unlocked | `{ achievement_key: string, achievement_name: string, total_stars: number }` |

**Achievement Keys:**
- `globe_trotter` - 10 distance measurements
- `dead_reckoner` - 5 position calculations
- `speed_demon` - Time trial under 60 seconds
- `precision_navigator` - 3 perfect answers in a row
- `chart_master` - Complete all Mercator exercises
- `navigation_expert` - Perfect quiz score

### 7. Globe Interaction Events

Track 3D globe usage and controls.

| Event Name | When to Fire | Metadata |
|------------|--------------|----------|
| `globe_rotate` | User rotates globe (manual interaction) | `{ interaction_type: 'drag'\|'button' }` |
| `globe_zoom_in` | User zooms in | `{ zoom_level: number }` |
| `globe_zoom_out` | User zooms out | `{ zoom_level: number }` |
| `globe_reset_view` | User resets view (R key or button) | None |
| `globe_hover_coords` | User hovers over globe (track frequency) | `{ lat: number, lon: number }` (sample, not every hover) |
| `globe_collapse` | User collapses/expands globe on mobile | `{ action: 'collapse'\|'expand' }` |

**Note:** For `globe_hover_coords`, only track periodically (e.g., every 5 seconds) to avoid excessive events.

### 8. Settings Events

Track user preferences and settings changes.

| Event Name | When to Fire | Metadata |
|------------|--------------|----------|
| `settings_open` | Settings modal opens | None |
| `settings_hints_toggle` | Show hints toggle changes | `{ enabled: boolean }` |
| `settings_grid_toggle` | Show grid toggle changes | `{ enabled: boolean }` |
| `settings_rotation_speed` | Rotation speed slider changes | `{ speed: number }` |
| `settings_close` | Settings modal closes | `{ changes_made: boolean }` |

### 9. UI Interaction Events

Track general UI interactions and navigation patterns.

| Event Name | When to Fire | Metadata |
|------------|--------------|----------|
| `keyboard_shortcut` | User uses keyboard shortcut | `{ shortcut: string, action: string }` |
| `mobile_nav_use` | User uses mobile navigation footer | `{ action: 'prev'\|'next'\|'menu' }` |
| `first_visit_notice_dismiss` | User dismisses first visit notice | `{ auto_dismissed: boolean }` |
| `keyboard_help_show` | User opens keyboard help (? key) | None |

## Implementation Strategy

### 1. Event Helper Function

Create a centralized event tracking function that:
- Checks if `sa_event` is available (with fallback)
- Handles metadata serialization
- Provides consistent error handling
- Optionally debounces high-frequency events

**Location:** `src/utils/analytics.js`

```javascript
/**
 * Track SimpleAnalytics event
 * @param {string} eventName - Event name (lowercase, underscores)
 * @param {object} metadata - Optional metadata object
 */
export function trackEvent(eventName, metadata = null) {
  // Check if sa_event is available
  if (typeof window.sa_event === 'function') {
    try {
      if (metadata) {
        // SimpleAnalytics supports metadata via sa_metadata
        // But for events, we can include in event name or use separate calls
        window.sa_event(eventName);
        // Note: Metadata might need to be tracked separately or encoded in event name
      } else {
        window.sa_event(eventName);
      }
    } catch (error) {
      console.warn('Analytics event failed:', eventName, error);
    }
  }
}
```

**Note:** SimpleAnalytics events don't support metadata directly in the event call. We have two options:
1. Encode metadata in the event name (e.g., `challenge_complete_ch1_c2_stars3`)
2. Use separate metadata tracking if SimpleAnalytics supports it
3. Track metadata as separate events with descriptive names

### 2. Integration Points

**Main Application (`src/main.js`):**
- `app_start` - In `init()` method
- `app_landing_view` - When landing screen is shown
- `app_start_learning` - In `startLearning()` method
- `app_home_click` - In `goHome()` method

**Tutorial Flow:**
- `tutorial_start` - In `showTutorial()` method
- `tutorial_step_complete` - In `renderTutorialStep()` when advancing
- `tutorial_complete` - In `completeTutorial()` method
- `tutorial_skip` - In tutorial skip button handler

**Challenge Flow:**
- `challenge_start` - In `loadChallenge()` method
- `challenge_point_place` - In `handlePointPlaced()` method
- `challenge_answer_submit` - In `submitAnswer()` method
- `challenge_complete` - In `submitAnswer()` when stars > 0
- `challenge_retry` - In retry button handler
- `challenge_solution_view` - In `showSolution()` method

**Chapter Navigation:**
- `chapter_load` - In `loadChapter()` method
- `chapter_complete` - In `nextChallenge()` when chapter ends
- `chapter_menu_open` - In `showChapterMenu()` method

**Quiz Flow:**
- `quiz_start` - In `showQuiz()` method
- `quiz_answer_submit` - In `answerQuizQuestion()` method
- `quiz_complete` - In `showQuizResults()` method

**Achievements:**
- `achievement_unlock` - In `updateAchievement()` when unlocked

**Globe Interactions:**
- `globe_rotate` - In Globe component controls event listener
- `globe_zoom_in/out` - In zoom button handlers
- `globe_reset_view` - In reset button handler

**Settings:**
- `settings_*` - In respective settings event handlers

### 3. Event Naming with Metadata

Since SimpleAnalytics events are simple strings, we can encode important metadata in the event name:

**Pattern:** `event_name_key1_value1_key2_value2`

Examples:
- `challenge_complete_ch1_c2_stars3` - Challenge 1-2 completed with 3 stars
- `achievement_unlock_globe_trotter` - Globe Trotter achievement unlocked
- `quiz_complete_score_8_10` - Quiz completed with 8/10 score

For more complex metadata, we can track separate events:
- `challenge_start_ch1_c2` followed by `challenge_type_dead_reckoning`
- Or use descriptive event names: `challenge_dead_reckoning_start_ch1_c2`

### 4. High-Frequency Event Throttling

Some events (like `globe_hover_coords`) should be throttled to avoid excessive tracking:

```javascript
let lastHoverTrack = 0;
const HOVER_TRACK_INTERVAL = 5000; // 5 seconds

function trackGlobeHover(coords) {
  const now = Date.now();
  if (now - lastHoverTrack > HOVER_TRACK_INTERVAL) {
    trackEvent('globe_hover_coords', { lat: coords.lat, lon: coords.lon });
    lastHoverTrack = now;
  }
}
```

## Analytics Goals & Metrics

### Primary Metrics

1. **Engagement Metrics**
   - App start rate
   - Tutorial completion rate
   - Average session duration
   - Return user rate

2. **Learning Progress**
   - Chapter completion rates
   - Challenge completion rates by type
   - Average stars per challenge
   - Time to complete challenges

3. **Success Metrics**
   - Perfect answer rate (3 stars)
   - Quiz pass rate
   - Achievement unlock rate
   - Final quiz score distribution

4. **Drop-off Points**
   - Where users stop (which chapter/challenge)
   - Tutorial abandonment rate
   - Challenge retry rate
   - Settings usage

5. **Feature Usage**
   - Globe interaction frequency
   - Hint usage rate
   - Solution viewing rate
   - Keyboard shortcuts usage
   - Mobile vs desktop usage

### Key Questions to Answer

1. **Engagement:**
   - What percentage of users complete the tutorial?
   - How many users reach each chapter?
   - What's the average time spent per challenge?

2. **Learning Effectiveness:**
   - Which challenge types are most difficult?
   - What's the correlation between hint usage and success?
   - Do users improve over time (retry success rate)?

3. **User Behavior:**
   - Do users prefer mobile or desktop?
   - How often do users use keyboard shortcuts?
   - What's the most common drop-off point?

4. **Content Optimization:**
   - Which chapters need improvement?
   - Are hints helpful?
   - Should we add more tutorial steps?

## Implementation Checklist

- [ ] Create `src/utils/analytics.js` with `trackEvent()` helper
- [ ] Add event tracking to app lifecycle events
- [ ] Add event tracking to tutorial flow
- [ ] Add event tracking to challenge interactions
- [ ] Add event tracking to chapter navigation
- [ ] Add event tracking to quiz flow
- [ ] Add event tracking to achievement system
- [ ] Add event tracking to globe interactions (throttled)
- [ ] Add event tracking to settings changes
- [ ] Add event tracking to UI interactions
- [ ] Test all events in SimpleAnalytics dashboard
- [ ] Verify event names follow naming convention
- [ ] Document any custom event naming patterns used

## Notes

1. **Privacy:** SimpleAnalytics is privacy-first and doesn't track personal data. All events are anonymous.

2. **Event Limits:** SimpleAnalytics doesn't have strict event limits, but we should be mindful of excessive tracking.

3. **Metadata:** Since SimpleAnalytics events are simple strings, we'll encode important context in event names or track related events.

4. **Testing:** Test events in development before deploying to production. Use SimpleAnalytics Events Explorer to verify events are being tracked correctly.

5. **Future Enhancements:**
   - Track user segments (new vs returning)
   - A/B test different challenge presentations
   - Track error rates and performance issues
   - Monitor feature adoption rates

## Event Summary Table

| Category | Event Count | Priority |
|----------|-------------|----------|
| App Lifecycle | 5 | High |
| Tutorial | 7 | High |
| Chapter Navigation | 6 | High |
| Challenge | 12 | High |
| Quiz | 6 | High |
| Achievement | 2 | Medium |
| Globe Interaction | 6 | Medium |
| Settings | 5 | Low |
| UI Interaction | 4 | Low |
| **Total** | **53 events** | |

**Priority Levels:**
- **High:** Core learning metrics, essential for understanding user progress
- **Medium:** Engagement metrics, useful for feature optimization
- **Low:** Nice-to-have metrics, for detailed analysis

# Nautical Navigation Learning Experience - PRD

## Product Overview

### Vision
An interactive, gamified web application that teaches users why nautical miles and knots are superior to metric units for maritime and aviation navigation through hands-on experience and progressive challenges.

### Target Audience
- Students learning navigation
- Aviation/maritime enthusiasts
- Educators teaching navigation concepts
- Anyone curious about why nautical units persist in modern navigation

### Core Value Proposition
Instead of reading about why knots are useful, users **experience** the difference by solving real navigation problems with both unit systems, making the advantages viscerally obvious.

## Technical Stack

- **3D Rendering**: Three.js (r160+)
- **UI Framework**: HTML5, vanilla JavaScript
- **Styling**: Tailwind CSS + DaisyUI components
- **Deployment**: Static site (no backend required)

## Design Philosophy

### Visual Style
- **Minimalistic**: Clean ocean blues (#0ea5e9, #0284c7) and navigation oranges (#fb923c)
- **Fresh**: Modern glassmorphism effects, smooth animations
- **Functional**: Every visual element serves the learning experience
- **Accessible**: High contrast, clear typography (Inter font), responsive design

### Interaction Design
- **Progressive disclosure**: Start simple, add complexity gradually
- **Immediate feedback**: Show calculations in real-time
- **Comparative learning**: Side-by-side km vs nautical mile experiences
- **Tactile**: Click, drag, and interact with the 3D globe

## Core Features

### 1. Interactive 3D Globe
**Purpose**: Visual foundation for understanding coordinates and distances

**Components**:
- Rotatable Earth with latitude/longitude grid lines
- Visible equator, tropics, and polar circles
- Coordinate labels at key intersections
- Graticule showing 10° intervals
- Day/night terminator (optional visual flair)

**Zoom and Grid Behavior**:
- **Far zoom** (camera distance >600): Show 10° grid lines only
- **Medium zoom** (camera distance 300-600): Fade in 5° subdivision lines
- **Close zoom** (camera distance <300): Fade in 1° subdivision lines
- **Adaptive rule**: Adjust thresholds dynamically to maintain 8-12 visible grid lines in the viewport
- Grid lines have opacity: primary (10°) = 0.6, secondary (5°) = 0.3, tertiary (1°) = 0.15
- Latitude/longitude labels appear only when zoomed to show <90° of globe
- Mouse drag to rotate
- Scroll to zoom
- Click coordinates to see lat/long values
- Hover to highlight grid lines

**Technical Notes**:
- Use THREE.SphereGeometry for Earth
- THREE.LineSegments for grid lines
- THREE.OrbitControls for interaction
- Texture map optional (can start with solid blue sphere)

### 2. Distance Measurement Tool
**Purpose**: Let users discover that latitude minutes = nautical miles

**UI Elements**:
- "Place Point A" button → click on globe
- "Place Point B" button → click on globe
- Visual line connecting points (great circle arc)
- Info panel showing:
  - Coordinate difference in degrees/minutes
  - Distance in nautical miles
  - Distance in kilometers
  - Conversion factor reminder

**Scenarios to Enable**:
1. **North-South**: Place points on same longitude, different latitudes
   - Show: "Latitude difference: 2°30' = 150 minutes = **150 nautical miles**"
   - Show: "In kilometers: 150 × 1.852 = 277.8 km"
   
2. **Equatorial East-West**: Place points on equator, different longitudes
   - Show: "On equator: longitude minutes ≈ nautical miles"
   
3. **High Latitude East-West**: Place points at 60°N
   - Show: "At 60°N, longitude compression: 60' of longitude = only **30 nautical miles**"
   - Highlight the cos(latitude) correction needed

**Visual Feedback**:
- Green highlight for north-south measurements (simple!)
- Yellow highlight for equatorial (simple but rare)
- Orange highlight for high latitude (needs correction)

### 3. Dead Reckoning Simulator
**Purpose**: Experience the practical advantage of knots for position calculations

**Game Mechanic**:
User is a navigator who must calculate new position after traveling.

**UI Layout**:
```
[3D Globe on left] | [Control Panel on right]
                    | Starting Position: [shown]
                    | Heading: [compass rose selector]
                    | Speed: [slider] knots
                    | Time: [slider] hours
                    | 
                    | [Calculate Position Button]
                    |
                    | Your Answer:
                    | Lat: [deg]° [min]' [N/S▼]
                    | Lon: [deg]° [min]' [E/W▼]
                    | Example: 45° 30' N, 10° 15' W
                    | 
                    | [Submit] [Show Solution]
```

**Challenge Generation Rules**:

All challenges follow these constraints:

**Chapter 1-2 (Simple navigation)**:
- Speeds: Round numbers (5, 6, 8, 10, 12, 15 knots)
- Times: Whole or half hours (1h, 1.5h, 2h, 2.5h, 3h)
- Headings: Cardinal directions only (000°, 090°, 180°, 270°)
- Starting positions: Round coordinates (40°00'N, not 40°17'N)

**Chapter 3 (Diagonal courses)**:
- Speeds: 8-15 knots (whole numbers)
- Times: 1-4 hours (0.5h increments)
- Headings: 45° increments (045°, 135°, 225°, 315°)
- Starting positions: Round to nearest 15' (45°00'N or 45°15'N)
- Formula helper shows: "North = distance × cos(heading), East = distance × sin(heading)"

**Chapter 4-5 (Realistic with environment)**:
- Speeds: 6-25 knots (decimals allowed: 12.5, 18.3)
- Times: 0.5-6 hours (0.25h increments)
- Headings: Any degree value (037°, 124°, 283°)
- Starting positions: Realistic precision (52°17'N, 10°43'W)
- Environmental factors:
  - Wind: "Wind from [direction] at [5-20] knots"
  - Current: "Current setting [direction] at [1-4] knots"
  - System shows: "Wind drift: 3.2nm north" (user factors this in)

**Validation Rules**:
- No challenges starting/ending on land (stay in oceans)
- Avoid extreme latitudes (keep between 70°N and 70°S)
- Ensure answers are achievable with provided tools
- Minimum distance: 10nm, Maximum: 300nm per challenge
**Example Challenges**:

**Level 1: Due North/South** (Tutorial)
- Heading: 000° (due north)
- Speed: 10 knots
- Time: 3 hours
- Expected answer: 40°30'N, 20°00'W
- Explanation shown: "30 nm north = 30 minutes latitude. Easy!"

**Level 2: Due North with Different Numbers**
- Start: 52°15'N, 10°30'E
- Heading: 180° (due south)
- Speed: 8 knots
- Time: 2.5 hours
- Expected answer: 51°55'N, 10°30'E
- Build confidence with pattern

**Level 3: Diagonal at 45° Course** (Introduces components)
- Start: 45°00'N, 10°00'W
- Heading: 045° (northeast)
- Speed: 12 knots
- Time: 2 hours
- Provide calculator with sin/cos buttons
- Show north and east components separately
- Expected answer: ~45°17'N, 9°36'W

**Level 4: Same Challenge, Now with Kilometers**
- Repeat Level 3 but force user to work in km/h
- Show all the conversion steps required
- Time the user (gamification)
- At end: "Knots took 45 seconds, kilometers took 2 minutes 15 seconds"

**Level 5: Environmental Factors** (Chapters 4-5)
- User receives challenge with environmental conditions
- System displays: "Wind from 270° at 15 knots" and "Current setting 045° at 2 knots"
- System automatically calculates and shows drift: "Wind drift: 3.2nm east over 2 hours" and "Current drift: 4nm northeast over 2 hours"
- User must factor these drifts into their dead reckoning calculation
- Total position = intended position + wind drift + current drift
- Example challenge:
  - Start: 52°17'N, 10°43'W
  - Intended course: 090° at 18 knots for 3 hours
  - Wind from north at 12 knots → drift: 3.6nm south
  - Current setting east at 2 knots → drift: 6nm east
  - User calculates: intended (54nm east) + wind drift (3.6nm south) + current drift (6nm east)
- "You need to reach this point in 4 hours, what heading and speed?"
- Multiple correct answers possible
- Emphasizes planning use-case

**Feedback System**:
Error tolerance scales with distance traveled:
- **3 stars**: Within 5% of distance (e.g., 30nm trip → within 1.5nm)
- **2 stars**: Within 10% of distance (e.g., 30nm trip → within 3nm)
- **1 star**: Within 20% of distance (e.g., 30nm trip → within 6nm)
- **Try again**: Beyond 20% of distance

Feedback messages:
- 3 stars: "Perfect! ⭐⭐⭐ You're [X]nm off (within 5%). [Encouraging message about knots]"
- 2 stars: "Good! ⭐⭐ You're [X]nm off. [Hint about what to check]"
- 1 star: "Close! ⭐ You're [X]nm off. [Show solution option]"
- 0 stars: "You're [X]nm off. Try again! [Offer hint]"

### 4. Mercator Chart Trainer
**Purpose**: Teach why Mercator projection + nautical miles work together

**Implementation Note**: Uses simplified equirectangular projection (latitude/longitude as x/y) rather than true Mercator for educational clarity. Include note: "Simplified projection for learning - real navigation charts use true Mercator."

**Visual**:
- Split screen: 3D globe on left, 2D Mercator chart on right
- As user rotates globe, corresponding area highlights on chart

**Interactive Elements**:
- Ruler tool: Drag on Mercator chart to measure distance
- Automatic reading from latitude scale at measurement location
- Highlight how straight lines on Mercator = constant headings (rhumb lines)
- Show great circle path as curved line on Mercator for comparison

**Distance Display Format**:
Throughout the application, always display both units side by side:
- Primary format: "150 nautical miles (277.8 km)"
- In compact spaces: "150 nm (277.8 km)"
- Speed format: "12 knots (22.2 km/h)"
- Conversion shown with 1 decimal place for km
- In error messages: "You're 18nm off (33.3 km). Try again!"
- On Mercator chart ruler: dual scale showing both units

**Learning Moments**:
1. "Measure this distance on the chart" → show it reads directly in nm
2. "Notice how the latitude scale spacing changes near poles"
3. "Straight lines keep your compass heading constant"

**Great Circle Route Toggle** (available from Chapter 2 onward):
- Toggle switch in control panel: "Show Great Circle Route" (default: OFF)
- When OFF: Shows only rhumb line (constant heading path) - orange dashed
- When ON: Shows both paths simultaneously:
  - Rhumb line: orange dashed
  - Great circle: cyan solid line
  - Distance comparison badge: "Rhumb: 245nm | Great Circle: 238nm (saves 7nm)"
- Tooltip on hover: "Great circle is the shortest distance but requires changing your heading constantly. Rhumb line maintains a constant compass bearing."
- In challenges, users navigate using rhumb lines (practical navigation)

### 5. Unit Comparison Dashboard
**Purpose**: Drive home the efficiency advantage with real numbers

**Display Stats** (accumulated across all challenges):
- **Calculations completed**: [X] in nautical miles, [Y] in kilometers
- **Average time per calculation**: [A] seconds vs [B] seconds
- **Conversion steps needed**: [M] vs [N]
- **Mental math possible**: [P%] vs [Q%]

**Visual**: Progress bars, charts showing time difference

### 6. Knowledge Reinforcement Quiz
**Purpose**: Test understanding, not just mechanical skill

**Complete 10-Question Quiz**:

**Question 1** (Conceptual):
"Why does 1 nautical mile equal 1 minute of latitude?"
- A) It's based on the meter definition
- B) ✓ It's defined as 1/60th of a degree of Earth's circumference
- C) Ships used to travel 1 mile in 1 minute
- D) It matches the speed of ocean currents

**Question 2** (Conceptual):
"When does the nautical mile system NOT simplify calculations?"
- A) North-south navigation
- B) ✓ East-west navigation at high latitudes
- C) Measuring distances on charts
- D) Converting speed to distance

**Question 3** (Practical):
"You're at 60°N. Why is east-west navigation more complex here than at the equator?"
- A) Magnetic declination is stronger
- B) The Coriolis effect is reversed
- C) ✓ Longitude lines converge, so 1 minute of longitude ≠ 1 nautical mile
- D) Currents flow faster

**Question 4** (Real-world):
"You're a pilot. ATC says 'you're 43 miles out.' Your groundspeed is 215 knots. How long until landing?"
- A) 8 minutes
- B) ✓ 12 minutes (43÷215×60 = 12)
- C) 15 minutes
- D) 20 minutes

**Question 5** (Conceptual):
"What is a rhumb line?"
- A) The shortest distance between two points
- B) ✓ A path of constant compass bearing
- C) A line parallel to the equator
- D) A meridian of longitude

**Question 6** (Practical):
"You sail due south at 10 knots for 3 hours from 45°30'N. What's your new latitude?"
- A) 45°00'N
- B) ✓ 45°00'N (30nm = 30 minutes south)
- C) 44°30'N
- D) 44°00'N

**Question 7** (Conceptual):
"On a Mercator chart, why can you measure distances using the latitude scale?"
- A) It's just a convenient ruler
- B) Latitude lines are evenly spaced
- C) ✓ The projection is designed so 1 minute of latitude = 1 nautical mile anywhere
- D) Longitude scale would be more accurate

**Question 8** (Real-world):
"When would you choose a great circle route over a rhumb line?"
- A) For short distances
- B) ✓ For long distances where fuel savings matter
- C) When navigating near the equator
- D) When you want constant heading

**Question 9** (Practical):
"Flying northeast (045°) at 20 knots for 2 hours travels how far in each direction?"
- A) 20nm north, 20nm east
- B) 40nm north, 40nm east
- C) ✓ ~28nm north, ~28nm east (40 × 0.707)
- D) 20nm north, 40nm east

**Question 10** (Integration):
"What makes the knot most practical for navigation?"
- A) It's faster than km/h
- B) It's easier to pronounce
- C) ✓ It matches the coordinate system (degrees/minutes) used on charts and GPS
- D) It's the oldest unit still in use

**Scoring**:
- 10 questions
- Bronze (6-7), Silver (8-9), Gold (10) medals
- Unlock "Navigation Expert" badge

## User Flow

### Entry Experience
1. **Landing**: Title screen with animated globe rotating
   - "Why Do Ships and Planes Use Knots?"
   - "An Interactive Exploration"
   - [Start Learning] button

2. **Tutorial** (Progressive skip):
   - Brief intro (30 seconds max)
   - "Navigation uses coordinates: latitude and longitude"
   - "These are measured in degrees and minutes"
   - "What if our speed and distance units matched this grid?"
   - User must complete 3 interactions before skip button appears:
     1. Rotate the globe once
     2. Click to place Point A
     3. Click to place Point B
   - After 3rd interaction: "Skip Tutorial" button fades in at bottom
   - Skip button: ghost style, small, unobtrusive
   - Skipping moves directly to Chapter 1

3. **Progressive Chapters**:
   - Chapter 1: The Coordinate Grid (3D Globe exploration)
   - Chapter 2: North-South Simplicity (Dead reckoning basics)
   - Chapter 3: The East-West Challenge (Latitude corrections)
   - Chapter 4: The Mercator Connection (Chart reading)
   - Chapter 5: Time Trial (Nautical vs Metric comparison)
   - Final Quiz

**Chapter Progression Rules**:
- Must complete Chapter N to unlock Chapter N+1
- Can always replay any completed chapter
- Can attempt next locked chapter once (preview mode) but must complete previous to fully unlock
- Progress tracked per chapter: challenges completed, total stars, best time

### Navigation Structure
```
[Progress Bar: Chapter X/5]

[◀ Previous]  [Chapter Menu]  [Next ▶]

[3D Globe View]

[Challenge Panel]
```

## UI Components (DaisyUI)

### Core Components to Use
- `card` - For challenge panels and info boxes
- `btn` - Primary actions (Calculate, Submit, Next)
- `btn-ghost` - Secondary actions (Skip, Hint)
- `badge` - Achievement indicators, difficulty levels
- `progress` - Chapter completion
- `alert` - Feedback messages (success, error, info)
- `modal` - Tutorial overlays, solution explanations
- `tooltip` - Hover help on complex terms
- `stat` - Dashboard statistics display
- `tabs` - Switching between unit systems
- `range` - Sliders for speed/time inputs
- `input` - Coordinate entry fields

### Color Scheme (Tailwind + DaisyUI)
```
Primary: Ocean Blue (sky-600, sky-700)
Secondary: Navigation Orange (orange-500)
Accent: Success Green (emerald-500)
Neutral: Slate grays (slate-100 to slate-900)
Error: Red (red-500)

Background: gradient from sky-50 to sky-100
Cards: white with shadow-xl
Grid lines: sky-300 with opacity-50
```

### Typography
```
Headings: font-bold, text-2xl to text-4xl
Body: font-normal, text-base
Code/Numbers: font-mono
Captions: text-sm, text-slate-600
```

### Interactive Elements Specification

**Compass Rose (for heading selection)**:
- Circular SVG compass rose (200px diameter)
- Outer ring: Cardinal (N,E,S,W) and intercardinal (NE,SE,SW,NW) directions
- Inner ring: Degree markings every 30°
- Center: Draggable orange needle/arrow
- Click/drag needle to set heading, shows live value: "Heading: 127°"
- Snap to 15° increments when within 5° for easier selection
- Visual: needle glows orange during drag
- Below compass: numeric input field for precise entry (000-359)

**Coordinate Input Fields**:
- Latitude: [deg 0-90] ° [min 0-59] ' [N/S dropdown]
- Longitude: [deg 0-180] ° [min 0-59] ' [E/W dropdown]
- Input validation: prevent invalid values (lat >90, min >59)
- Keyboard: Tab moves between fields, Enter submits

**Speed/Time Sliders**:
- Speed: 5-30 knots (DaisyUI range slider)
- Time: 0.5-8 hours in 0.25h increments
- Display current value above slider
- Color: sky-600 track

## Three.js Implementation Details

### Scene Setup
```javascript
// Camera
- PerspectiveCamera (FOV: 45, near: 0.1, far: 2000)
- Position: (0, 0, 400) for initial view

// Lighting
- AmbientLight (intensity: 0.4) - see whole globe
- DirectionalLight (intensity: 0.8) - simulate sun
- Position light to create day/night effect

// Controls
- OrbitControls
- Enable damping for smooth rotation
- Set min/max distance for zoom
- Disable pan (keep globe centered)
```

### Globe Construction
```javascript
// Sphere
- Radius: 100 units (arbitrary, scale consistently)
- widthSegments: 64, heightSegments: 64 (smooth sphere)

// Materials
- MeshPhongMaterial for Earth (base color: #0284c7)
- LineBasicMaterial for grid (color: #38bdf8, opacity: 0.4)

// Graticule (grid lines)
- Create circles for latitude lines every 10°
- Create semicircles for longitude lines every 10°
- Highlight equator and prime meridian (brighter, thicker)
```

### Interaction Handlers
```javascript
// Raycasting for click detection
- On click: raycast to find intersection with globe
- Convert 3D point to lat/long coordinates
- Display marker at clicked position
- Store coordinates for calculation

// Point Markers
- Use navigation pin/marker 3D models (or cone geometry pointing down)
- Point A: Red pin (#ef4444)
- Point B: Blue pin (#3b82f6)
- Pin sticks into globe surface at clicked location
- CSS2DRenderer label shows coordinates above pin
- Subtle drop shadow beneath pin for depth
- Scale pins based on zoom level (larger when zoomed out)
```

### Drawing Paths Between Points
```javascript
// Great circle arc with distance markers
- Calculate intermediate points along arc (every 10nm)
- Use THREE.Line with dashed material (dashSize: 2, gapSize: 1)
- Add small sphere markers every 10nm along path
- Label markers with distance from start (10nm, 20nm, 30nm...)
- Primary color: orange (#fb923c) for active path
- When "Show Great Circle" toggled: show both rhumb (orange dashed) and great circle (cyan solid)
- TubeGeometry alternative for more visible line (radius: 0.5)
- Animate drawing with material.dashOffset or geometry.setDrawRange

// Rhumb line (for Mercator comparison)
- Different calculation than great circle
- Show both simultaneously in later chapters
```

## Data & State Management

### Application State
```javascript
{
  currentChapter: 1-5,
  currentChallenge: number,
  userProgress: {
    chaptersCompleted: [],
    challengesCompleted: [],
    scores: {},
    totalTime: number,
    calculationsInNautical: number,
    calculationsInMetric: number
  },
  settings: {
    showHints: boolean,
    showGrid: boolean,
    rotationSpeed: number
  },
  activePoints: {
    pointA: {lat, lon, vector3},
    pointB: {lat, lon, vector3}
  }
}
```

### LocalStorage Persistence
- Save progress after each completed challenge
- Save settings on change
- Load on app initialization
- "Reset Progress" option in settings

**Example Saved State JSON**:
```json
{
  "currentChapter": 3,
  "currentChallenge": 2,
  "userProgress": {
    "chaptersCompleted": [1, 2],
    "challengesCompleted": [
      { "chapter": 1, "challenge": 1, "stars": 3, "time": 45 },
      { "chapter": 1, "challenge": 2, "stars": 3, "time": 52 },
      { "chapter": 2, "challenge": 1, "stars": 2, "time": 89 }
    ],
    "scores": {
      "totalStars": 8,
      "perfectAnswers": 2
    },
    "totalTime": 186,
    "calculationsInNautical": 5,
    "calculationsInMetric": 2,
    "hintsUsed": 3
  },
  "achievements": {
    "globeTrotter": { "unlocked": true, "progress": 12 },
    "deadReckoner": { "unlocked": false, "progress": 3 },
    "speedDemon": { "unlocked": false, "progress": 0 }
  },
  "settings": {
    "showHints": true,
    "showGrid": true,
    "rotationSpeed": 1.0,
    "tutorialCompleted": true
  },
  "sessionStartTime": 1706457600000,
  "version": "1.0"
}
```

### Gamification Elements

**Animation Timing Guidelines**:
- **Quick transitions** (150-250ms): Button clicks, toggle switches, tooltip appears
- **Medium transitions** (300-500ms): Modal open/close, panel slide in/out, tab switches
- **Slow animations** (800-1200ms): Globe rotation to new position, chapter transitions
- **Journey animations** (2000-3000ms): Ship/plane marker traveling along path
- **Celebration effects** (1000ms): Star reveals, achievement unlocks

Easing functions:
- Interactions: `ease-in-out` (natural feel)
- Reveals: `ease-out` (appears quickly, settles gently)
- Exits: `ease-in` (starts slow, speeds up)

### Achievement Badges
- 🌍 "Globe Trotter" - Complete 10 distance measurements
- 🧭 "Dead Reckoner" - Solve 5 position calculations
- ⚡ "Speed Demon" - Complete time trial under 60 seconds
- 🎯 "Precision Navigator" - Get 3 perfect answers in a row
- 📐 "Chart Master" - Complete all Mercator exercises
- 🏆 "Navigation Expert" - Perfect score on final quiz

### Leaderboard (Optional Enhancement)
- If backend added later: global leaderboard for time trials
- For now: personal best times

### Streak Tracking
- "Daily Navigation": Come back tomorrow for bonus challenge
- Stored in localStorage

## Content & Copy

### Educational Tooltips
Provide on-hover help for technical terms:
- **Latitude**: "Angular distance north or south of equator (0° to 90°)"
- **Longitude**: "Angular distance east or west of prime meridian (0° to 180°)"
- **Nautical Mile**: "1 minute of latitude = 1,852 meters"
- **Knot**: "Speed of 1 nautical mile per hour"
- **Rhumb Line**: "Path of constant compass bearing"
- **Great Circle**: "Shortest distance between two points on a sphere"
- **Dead Reckoning**: "Calculating position from last known position, speed, and time"

### Success Messages
Make them encouraging and educational:
- "Perfect! You just did in 30 seconds what would take 2 minutes with kilometers."
- "Nice work! Notice how you didn't need a calculator for that north-south calculation?"
- "Excellent! The nautical mile is just degrees and minutes in disguise."

### Hint System
Progressive hints for stuck users:
1. First hint: Conceptual nudge ("Think about how many minutes of latitude...")
2. Second hint: Formula ("Distance = Speed × Time")
3. Third hint: First step shown ("24 nm traveled in 2 hours...")
4. Final hint: Full solution with explanation

## Responsive Design

### Breakpoints
- **Desktop (1024px+)**: Side-by-side layout, 3D globe left, controls right
- **Tablet (768px-1023px)**: Stacked layout, globe top, controls bottom
- **Mobile (< 768px)**: 
  - 50/50 vertical split by default (globe top 50%, controls bottom 50%)
  - Each section has collapse/expand button (chevron icon in header)
  - Collapsed globe: 25% height, shows miniature view
  - Collapsed controls: 25% height, shows current challenge summary
  - Expanded section takes remaining 75% of screen
  - Touch: swipe section header up/down to toggle
  - Simplified 3D rendering (reduce sphere segments to 32, grid lines to 5° only)
  - Touch controls: single finger drag to rotate, pinch zoom, double-tap reset
  - Control panel scrolls vertically when expanded

### Touch Interactions
- Swipe to rotate globe
- Pinch to zoom
- Tap to place points
- Bottom drawer for controls (slides up)

## Performance Optimization

### 3D Rendering
- Use LOW quality mode on mobile (reduce segments)
- Implement frustum culling for grid lines
- Reduce particle effects on low-end devices
- Cap frame rate at 30fps on mobile

### Asset Loading
- Minimal textures (can start with procedural materials)
- Lazy load chapters (code splitting)
- Preload next chapter while user completes current

### Initial Load Time Target
- < 3 seconds on 4G connection
- < 1 second to interactive

### Progress Persistence Notice
On first visit, show non-intrusive toast notification (DaisyUI alert):
- Position: bottom-right corner
- Duration: 8 seconds (auto-dismiss)
- Message: "💾 Progress saved locally in your browser. Clearing browser data will reset your progress."
- Dismiss button: X icon
- Set localStorage flag: `firstVisitNoticeShown: true` to never show again

## Accessibility

### Keyboard Navigation
- Tab through interactive elements
- Arrow keys to rotate globe
- Enter to submit answers
- Escape to close modals

### Screen Reader Support
- ARIA labels on all interactive elements
- Descriptive alt text for visual feedback
- Announce state changes ("Point A placed at 45°N, 10°W")

### Visual Accessibility
- High contrast mode toggle
- Text scaling support (use rem units)
- Colorblind-friendly palette option
- Skip animation option

## Analytics & Success Metrics

### Track (Privacy-Respecting)
- Chapter completion rates
- Average time per challenge type
- Common wrong answers (to improve hints)
- Drop-off points
- Browser/device distribution

### Success Criteria
- 60% of users complete all 5 chapters
- 80% of users correctly answer "why nautical miles" after experience
- Average Net Promoter Score > 8/10
- < 5% bounce rate on landing page

### Success State Feedback
When users achieve 3 stars on a challenge:
- **Inline celebration** (no modal interruption):
  - Green checkmark icon appears (✓)
  - 3 gold stars appear with brief scale animation (0.8s)
  - Success message: "Perfect! ⭐⭐⭐" in emerald-600
  - Time and accuracy stats shown below
  - Subtle green border pulse on challenge card (1 cycle, 1s)
- **No blocking popups** - user can immediately proceed to next challenge
- Achievement notifications appear as small toast in top-right (if unlocked)

## Future Enhancements (Out of Scope for V1)

### Phase 2 Ideas
- Multiplayer race mode (first to solve navigation problem)
- Custom challenge creator
- Integration with real flight/ship tracking APIs
- VR mode for immersive experience
- Celestial navigation mini-game (sextant simulation)
- Historical navigation methods comparison

### Community Features
- Share your best time challenges
- User-generated waypoint races
- Discussion forum for navigation questions

## Development Phases

### Phase 1: Foundation (Week 1)
- 3D globe with grid
- Basic rotation and zoom
- Two-point distance measurement
- Chapter 1 complete

### Phase 2: Core Gameplay (Week 2)
- Dead reckoning simulator
- Chapters 2-3 complete
- Hint system
- Progress persistence

### Phase 3: Advanced Features (Week 3)
- Mercator chart view
- East-west complications
- Chapters 4-5 complete
- Unit comparison dashboard

### Phase 4: Polish (Week 4)
- Final quiz
- Achievement system
- Responsive design refinement
- Accessibility audit
- Performance optimization

## Technical Requirements

### Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari, Chrome Mobile

### Dependencies
```json
{
  "three": "^0.160.0",
  "tailwindcss": "^3.4.0",
  "daisyui": "^4.6.0"
}
```

### Build Setup
- Vite for dev server and bundling
- PostCSS for Tailwind processing
- ESLint for code quality
- No backend required (static site)

## File Structure
```
/src
  /chapters
    chapter1.js
    chapter2.js
    ...
  /components
    Globe.js
    ChallengePanel.js
    ProgressBar.js
    ...
  /utils
    navigation.js      // calculation functions
    coordinates.js     // lat/long conversions
    geometry.js        // three.js helpers
  /data
    challenges.json
    tooltips.json
  main.js
  styles.css
/public
  /textures (if needed)
  /fonts
index.html
```

## Implementation Decisions (All Resolved)

All open-ended questions have been resolved. Here are the specific decisions:

1. **Earth texture**: Stylized solid blue sphere with coordinate grid only (no texture map)

2. **Dead reckoning animation**: Animate the journey - marker smoothly moves from start to finish over 2-3 seconds

3. **Difficulty modes**: Introduce wind/current gradually in Chapters 4-5 as standard challenges

4. **Tutorial skipping**: Skip becomes available after completing first 2-3 interactions

5. **Coordinate input format**: Degrees and minutes separately (two inputs per coordinate)

6. **Calculator**: Formula helper only - show formulas but no built-in calculator

7. **Grid detail on zoom**: Adaptive grid density to maintain ~8-12 visible lines on screen

8. **Time trial scoring**: Speed + accuracy - time penalty added for errors (30 seconds per 10nm)

9. **Hint penalties**: Track hints used but don't penalize stars

10. **Mobile touch controls**: Single drag to rotate + pinch to zoom + double-tap to reset view

11. **Error tolerance**: Scales with distance - longer journeys get proportionally larger tolerances (5% = 3 stars)

12. **Great circle display**: Available as toggle from Chapter 2 onward

13. **Challenge specifications**: Use generation rules with progressive difficulty constraints

14. **Quiz questions**: Complete 10-question quiz specified in detail

15. **Achievement conditions**: Within single session only (resets on page reload)

16. **LocalStorage format**: Concrete example JSON provided

17. **Animation timing**: Guidelines with ranges (quick: 150-250ms, medium: 300-500ms, slow: 800-1200ms)

18. **Wind/current**: System shows drift automatically (e.g., "Current pushing you 2nm east")

19. **Zoom grid behavior**: Adaptive based on viewport to maintain optimal line density

20. **Challenge parameters**: Progressive difficulty - early chapters use round numbers, later use realistic decimals

21. **Error messages**: Show distance from correct answer ("You're 18nm off. Try again!")

22. **Chapter navigation**: Unlock +1 ahead - can replay completed OR try next chapter

23. **Mercator projection**: Simplified equirectangular with notation that it's educational approximation

24. **Point markers**: Pin/marker icons that stick into globe surface

25. **Path visualization**: Dashed/segmented line showing distance increments (every 10nm)

26. **Unit display**: Always show both units ("150 nautical miles (277.8 km)")

27. **Success celebration**: Inline badge with checkmark and stars, no interruption

28. **Compass rose**: Interactive dial - click and drag to rotate, shows degrees dynamically

29. **Progress warning**: One-time notice on first visit about localStorage usage

30. **Mobile layout**: 50/50 split with collapse/expand capability for each section

## Success Definition

This PRD is successful if:
1. ✅ Developer can implement without major clarifying questions
2. ✅ Final product teaches the "why" viscerally, not just intellectually
3. ✅ Users complete the experience saying "oh NOW I get it!"
4. ✅ Balance between game and education is maintained
5. ✅ Technical implementation is clean and performant

---

**Version**: 1.0  
**Last Updated**: 2025-01-28  
**Document Owner**: Product/Learning Experience Design  
**Target Implementation**: Claude Code

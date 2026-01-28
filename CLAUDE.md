# Nautical Navigation Learning Experience

## Project Overview
An interactive, gamified web application that teaches users why nautical miles and knots are superior to metric units for maritime and aviation navigation through hands-on experience and progressive challenges.

## Tech Stack
- **3D Rendering**: Three.js (r160+)
- **UI Framework**: HTML5, vanilla JavaScript
- **Styling**: Tailwind CSS + DaisyUI components
- **Build Tool**: Vite
- **Deployment**: Static site (no backend required)

## Design System

### Colors
- Primary: Ocean Blue (sky-600, sky-700)
- Secondary: Navigation Orange (orange-500)
- Accent: Success Green (emerald-500)
- Neutral: Slate grays (slate-100 to slate-900)
- Error: Red (red-500)
- Background: gradient from sky-50 to sky-100
- Cards: white with shadow-xl
- Grid lines: sky-300 with opacity-50

### Typography
- Font: Inter
- Headings: font-bold, text-2xl to text-4xl
- Body: font-normal, text-base
- Code/Numbers: font-mono (JetBrains Mono)
- Captions: text-sm, text-slate-600

### Animation Timing
- Quick transitions (150-250ms): Button clicks, toggles, tooltips
- Medium transitions (300-500ms): Modal open/close, panel slides
- Slow animations (800-1200ms): Globe rotation, chapter transitions
- Journey animations (2000-3000ms): Ship/plane traveling along path
- Celebration effects (1000ms): Star reveals, achievements

## Project Structure
```
/src
  /components       # UI and 3D components
    Globe.js        # Three.js 3D globe with grid
    MercatorChart.js # 2D equirectangular projection
    CompassRose.js  # Interactive heading selector
    Dashboard.js    # Unit comparison statistics
  /utils
    navigation.js   # Distance/coordinate calculations
    geometry.js     # Three.js geometry helpers
    storage.js      # LocalStorage persistence
  /data
    challenges.js   # Challenge definitions & quiz
  main.js           # Application entry point
  styles.css        # Tailwind imports + custom styles
/public
  /fonts            # Inter, JetBrains Mono
index.html          # Main HTML file
```

## Key Features
1. **Interactive 3D Globe** - Rotatable Earth with coordinate grid
2. **Distance Measurement Tool** - Point A/B placement with great circle distance
3. **Dead Reckoning Simulator** - Calculate position from heading/speed/time
4. **Mercator Chart Trainer** - 2D projection with rhumb/great circle comparison
5. **Unit Comparison Dashboard** - Statistics showing nautical vs metric efficiency
6. **Knowledge Quiz** - 10 questions testing conceptual understanding

## Chapters
1. **The Coordinate Grid** - Explore latitude/longitude
2. **North-South Simplicity** - Dead reckoning basics (cardinal directions)
3. **The East-West Challenge** - Latitude corrections for longitude
4. **The Mercator Connection** - Chart reading and rhumb lines
5. **Time Trial** - Environmental factors (wind/current)

## Development Commands
```bash
npm install         # Install dependencies
npm run dev         # Start dev server (port 3000)
npm run build       # Production build to /dist
npm run preview     # Preview production build
```

## Keyboard Shortcuts
- `←` / `→` - Previous/Next challenge
- `↑` / `↓` - Zoom in/out
- `R` - Reset globe view
- `M` - Open chapter menu
- `Esc` - Close dialogs
- `?` - Show keyboard help

## Important Implementation Notes

### Globe
- Radius: 100 units
- Camera initial position: (0, 0, 400)
- Grid zoom levels: 10° (far >600), 5° (medium 300-600), 1° (close <300)
- Special latitudes: Tropics (23.5°), Polar circles (66.5°)

### Navigation Calculations
- Use Haversine formula for great circle distance
- Rhumb line for constant heading paths
- Error tolerance: 5%/10%/20% of distance for 3/2/1 stars
- Always display both units: "150 nm (277.8 km)"

### State Management
- LocalStorage key: `nautical-navigation-game`
- Tracks: chapters completed, challenge scores, achievements, settings
- Auto-saves after each challenge completion

### Responsive Design
- Desktop (1024px+): Side-by-side layout
- Tablet/Mobile: Stacked with 50/50 split
- Mobile sections can collapse/expand
- Touch-optimized (44px minimum targets)

### Accessibility
- Keyboard navigation for all interactions
- ARIA labels on interactive elements
- Reduced motion support
- High contrast mode support

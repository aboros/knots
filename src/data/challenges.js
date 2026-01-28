/**
 * Challenge definitions for all chapters
 */

export const chapters = [
  {
    id: 1,
    title: 'The Coordinate Grid',
    description: 'Explore the Earth\'s coordinate system and understand how latitude and longitude work together.',
    icon: '🌍',
    challenges: [
      {
        id: 1,
        type: 'exploration',
        title: 'Finding Your Position',
        instruction: 'Click anywhere on the globe to see the coordinates. Notice how latitude measures north-south position and longitude measures east-west.',
        objective: 'Place a point on the globe',
        hints: [
          'Latitude lines run east-west (horizontal)',
          'Longitude lines run north-south (vertical)',
          'The equator is at 0° latitude'
        ]
      },
      {
        id: 2,
        type: 'measurement',
        title: 'Measuring Distance',
        instruction: 'Place two points on the globe to measure the distance between them. Try placing them on the same longitude (north-south from each other).',
        objective: 'Measure a north-south distance',
        hints: [
          'Click "Place Point A" then click on the globe',
          'Click "Place Point B" then click on another location',
          'Notice how the distance is shown in both nautical miles and kilometers'
        ]
      },
      {
        id: 3,
        type: 'discovery',
        title: 'The Magic of Minutes',
        instruction: 'Place Point A at approximately 45°N, 10°W. Place Point B at approximately 46°N, 10°W. Notice anything special about the distance?',
        objective: 'Discover that 1° of latitude = 60 nautical miles',
        targetA: { lat: 45, lon: -10 },
        targetB: { lat: 46, lon: -10 },
        tolerance: 5,
        hints: [
          'The points should be on the same longitude (10°W)',
          'One degree of latitude equals 60 minutes',
          'Each minute of latitude equals... how many nautical miles?'
        ],
        discovery: '1° of latitude = 60 nautical miles. That\'s because 1 nautical mile is defined as 1 minute of latitude!'
      }
    ]
  },
  {
    id: 2,
    title: 'North-South Simplicity',
    description: 'Master dead reckoning for north-south travel, where the math is beautifully simple.',
    icon: '🧭',
    challenges: [
      {
        id: 1,
        type: 'deadReckoning',
        title: 'Due North',
        instruction: 'You\'re sailing due north at 10 knots for 3 hours. Calculate your new position.',
        start: { lat: 40, lon: -20 },
        heading: 0,
        speed: 10,
        time: 3,
        expected: { lat: 40.5, lon: -20 },
        explanation: '10 knots × 3 hours = 30 nm. Going north, 30 nm = 30 minutes of latitude = 0°30\'. New latitude: 40°00\' + 0°30\' = 40°30\'N',
        hints: [
          'Distance = Speed × Time',
          '1 nautical mile = 1 minute of latitude',
          'Going north adds to your latitude'
        ]
      },
      {
        id: 2,
        type: 'deadReckoning',
        title: 'Due South',
        instruction: 'Starting from 52°15\'N, 10°30\'E, sail due south at 8 knots for 2.5 hours.',
        start: { lat: 52.25, lon: 10.5 },
        heading: 180,
        speed: 8,
        time: 2.5,
        expected: { lat: 51.9167, lon: 10.5 },
        explanation: '8 knots × 2.5 hours = 20 nm = 20 minutes = 0°20\' south. New latitude: 52°15\' - 0°20\' = 51°55\'N',
        hints: [
          'South means subtracting from latitude',
          '20 nm traveled means 20 minutes of latitude change',
          'Longitude stays the same when going due south'
        ]
      },
      {
        id: 3,
        type: 'deadReckoning',
        title: 'Longer Journey North',
        instruction: 'From 35°00\'N, 15°00\'W, travel due north at 12 knots for 4 hours.',
        start: { lat: 35, lon: -15 },
        heading: 0,
        speed: 12,
        time: 4,
        expected: { lat: 35.8, lon: -15 },
        explanation: '12 × 4 = 48 nm = 48 minutes = 0°48\'. New position: 35°48\'N, 15°00\'W',
        hints: [
          'Calculate distance first: speed × time',
          'Convert to degrees: divide by 60',
          'Add to starting latitude'
        ]
      },
      {
        id: 4,
        type: 'comparison',
        title: 'Knots vs Kilometers',
        instruction: 'Same journey as before, but now try it with kilometers. Start at 35°N, 15°W, go north at 22.2 km/h for 4 hours.',
        start: { lat: 35, lon: -15 },
        heading: 0,
        speedKmh: 22.2,
        time: 4,
        expected: { lat: 35.8, lon: -15 },
        explanation: 'With km/h: 22.2 × 4 = 88.8 km → divide by 1.852 → 47.95 nm → divide by 60 → 0.799° ≈ 0°48\'. Same answer, more steps!',
        showComparison: true,
        hints: [
          'First calculate distance in km',
          'Convert km to nm (divide by 1.852)',
          'Then convert nm to degrees (divide by 60)'
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'The East-West Challenge',
    description: 'Learn why east-west navigation requires extra care, especially at higher latitudes.',
    icon: '↔️',
    challenges: [
      {
        id: 1,
        type: 'discovery',
        title: 'East on the Equator',
        instruction: 'At the equator, travel due east. Place points at 0°N, 0°E and 0°N, 1°E. How far apart are they?',
        targetA: { lat: 0, lon: 0 },
        targetB: { lat: 0, lon: 1 },
        tolerance: 5,
        discovery: 'At the equator, 1° of longitude = 60 nautical miles, just like latitude! The equator is the only latitude where this is true.',
        hints: [
          'The equator is the widest circle around Earth',
          'At 0° latitude, longitude minutes equal nautical miles',
          'This only works at the equator!'
        ]
      },
      {
        id: 2,
        type: 'discovery',
        title: 'East at 60°N',
        instruction: 'Now measure 1° of longitude at 60°N. Place points at 60°N, 0°E and 60°N, 1°E.',
        targetA: { lat: 60, lon: 0 },
        targetB: { lat: 60, lon: 1 },
        tolerance: 5,
        discovery: 'At 60°N, 1° of longitude is only 30 nautical miles! Longitude lines converge toward the poles. The formula is: nm = minutes × cos(latitude).',
        hints: [
          'Longitude lines get closer together at higher latitudes',
          'At 60°N, the distance is halved',
          'This is the cos(latitude) factor'
        ]
      },
      {
        id: 3,
        type: 'deadReckoning',
        title: 'Diagonal Course',
        instruction: 'From 45°N, 10°W, travel northeast (045°) at 12 knots for 2 hours.',
        start: { lat: 45, lon: -10 },
        heading: 45,
        speed: 12,
        time: 2,
        expected: { lat: 45.283, lon: -9.6 },
        explanation: 'Distance: 24 nm. North component: 24 × cos(45°) ≈ 17 nm = 17\'. East component: 24 × sin(45°) ≈ 17 nm. But at 45°N, 17 nm east = 17 / cos(45°) ≈ 24\' of longitude.',
        showTrigHelper: true,
        hints: [
          'Split the distance into north and east components',
          'North: distance × cos(heading)',
          'East: distance × sin(heading)',
          'Adjust east component for latitude'
        ]
      },
      {
        id: 4,
        type: 'deadReckoning',
        title: 'Southwest Course',
        instruction: 'From 50°N, 5°E, travel southwest (225°) at 15 knots for 3 hours.',
        start: { lat: 50, lon: 5 },
        heading: 225,
        speed: 15,
        time: 3,
        expected: { lat: 49.47, lon: 4.3 },
        explanation: 'Distance: 45 nm. South component: 45 × cos(225°) ≈ -32 nm (south). West component: 45 × sin(225°) ≈ -32 nm. At 50°N, 32 nm west = 32 / cos(50°) ≈ 50\' of longitude.',
        showTrigHelper: true,
        hints: [
          '225° is southwest (45° past due south)',
          'cos(225°) is negative - means south',
          'sin(225°) is negative - means west'
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'The Mercator Connection',
    description: 'Understand why Mercator charts and nautical miles work perfectly together.',
    icon: '🗺️',
    challenges: [
      {
        id: 1,
        type: 'mercator',
        title: 'Reading the Chart',
        instruction: 'Use the Mercator chart to measure distance. Notice how you can read distance directly from the latitude scale on the side.',
        objective: 'Measure a distance using the chart\'s latitude scale',
        hints: [
          'The latitude scale on the side IS your distance ruler',
          'Each minute of latitude = 1 nautical mile',
          'Measure at the same latitude as your path'
        ]
      },
      {
        id: 2,
        type: 'mercator',
        title: 'Rhumb Lines',
        instruction: 'Draw a straight line on the Mercator chart. This line represents a constant compass heading - called a rhumb line.',
        objective: 'Understand rhumb lines',
        showGreatCircle: true,
        hints: [
          'A straight line on Mercator keeps a constant heading',
          'Great circle routes are shorter but require changing heading',
          'For short distances, rhumb lines are practical'
        ]
      },
      {
        id: 3,
        type: 'deadReckoning',
        title: 'Chart Navigation',
        instruction: 'From 48°N, 5°W, follow heading 270° (due west) at 10 knots for 4 hours.',
        start: { lat: 48, lon: -5 },
        heading: 270,
        speed: 10,
        time: 4,
        expected: { lat: 48, lon: -6 },
        useMercator: true,
        explanation: '40 nm west at 48°N. Longitude change: 40 / cos(48°) / 60 = 1° west. New position: 48°N, 6°W.',
        hints: [
          'Due west means latitude stays the same',
          'Adjust for latitude when converting nm to degrees',
          'Check your answer on the Mercator chart'
        ]
      },
      {
        id: 4,
        type: 'deadReckoning',
        title: 'Plotting Your Course',
        instruction: 'Plan a route from 42°N, 8°W to reach a point due east, traveling at 18 knots for 2 hours.',
        start: { lat: 42, lon: -8 },
        heading: 90,
        speed: 18,
        time: 2,
        expected: { lat: 42, lon: -7.2 },
        useMercator: true,
        explanation: '36 nm east at 42°N. Longitude change: 36 / cos(42°) / 60 ≈ 0.8°. New position: 42°N, 7°12\'W.',
        hints: [
          'East means heading 090°',
          'Calculate longitude change carefully',
          'Plot both points on the Mercator chart'
        ]
      }
    ]
  },
  {
    id: 5,
    title: 'Time Trial',
    description: 'Put your skills to the test with realistic navigation scenarios including wind and current.',
    icon: '⏱️',
    challenges: [
      {
        id: 1,
        type: 'timeTrial',
        title: 'Speed Round',
        instruction: 'Complete these three calculations as fast as you can! All due north or south for simplicity.',
        subChallenges: [
          { start: { lat: 40, lon: -10 }, heading: 0, speed: 15, time: 2 },
          { start: { lat: 55, lon: 20 }, heading: 180, speed: 10, time: 1.5 },
          { start: { lat: 30, lon: -80 }, heading: 0, speed: 20, time: 1 }
        ],
        timeBonus: { gold: 60, silver: 90, bronze: 120 },
        hints: [
          'Speed × Time = Distance in nm',
          'nm = minutes of latitude for N/S travel',
          'Work quickly but accurately!'
        ]
      },
      {
        id: 2,
        type: 'deadReckoning',
        title: 'Wind Drift',
        instruction: 'Sail from 52°17\'N, 10°43\'W heading 090° at 18 knots for 3 hours. Wind from the north pushes you 3.6 nm south.',
        start: { lat: 52.283, lon: -10.717 },
        heading: 90,
        speed: 18,
        time: 3,
        wind: { direction: 0, speed: 12, driftNm: 3.6, driftDirection: 'south' },
        expected: { lat: 52.22, lon: -9.3 },
        explanation: 'Intended: 54 nm east. With wind drift 3.6 nm south, final position is southeast of intended.',
        hints: [
          'First calculate intended position (no wind)',
          'Then apply wind drift (3.6 nm south)',
          'Wind from north pushes you south'
        ]
      },
      {
        id: 3,
        type: 'deadReckoning',
        title: 'Current Effect',
        instruction: 'From 45°N, 20°W, sail 045° at 15 knots for 4 hours. Current sets 090° at 2 knots.',
        start: { lat: 45, lon: -20 },
        heading: 45,
        speed: 15,
        time: 4,
        current: { direction: 90, speed: 2, driftNm: 8, driftDirection: 'east' },
        expected: { lat: 45.71, lon: -18.9 },
        explanation: 'Boat motion: 60 nm at 045°. Current drift: 8 nm east. Total: 42.4 nm north, 50.4 nm east.',
        hints: [
          'Calculate boat movement first',
          'Add current drift separately',
          'Current setting 090° means it flows east'
        ]
      },
      {
        id: 4,
        type: 'deadReckoning',
        title: 'Combined Effects',
        instruction: 'Navigate from 50°N, 15°W heading 135° at 20 knots for 3 hours. Wind from 270° at 15 knots (drift: 4.5 nm). Current sets 045° at 3 knots.',
        start: { lat: 50, lon: -15 },
        heading: 135,
        speed: 20,
        time: 3,
        wind: { direction: 270, speed: 15, driftNm: 4.5, driftDirection: 'east' },
        current: { direction: 45, speed: 3, driftNm: 9, driftDirection: 'northeast' },
        expected: { lat: 49.2, lon: -13.3 },
        explanation: 'This is a complex calculation requiring you to add boat motion + wind drift + current drift.',
        hints: [
          'Break down each component separately',
          'Wind from 270° drifts you east',
          'Current at 045° drifts you northeast',
          'Sum all north and east components'
        ]
      },
      {
        id: 5,
        type: 'planning',
        title: 'Voyage Planning',
        instruction: 'You need to reach 48°N, 8°W from 45°N, 12°W. What heading and speed would get you there in 5 hours?',
        start: { lat: 45, lon: -12 },
        destination: { lat: 48, lon: -8 },
        time: 5,
        acceptableHeadings: [40, 50],
        acceptableSpeeds: [45, 55],
        hints: [
          'First calculate the required distance',
          'Use inverse tangent for heading',
          'Speed = Distance / Time'
        ]
      }
    ]
  }
];

/**
 * Quiz questions for final assessment
 */
export const quizQuestions = [
  {
    id: 1,
    question: 'Why does 1 nautical mile equal 1 minute of latitude?',
    options: [
      { id: 'a', text: 'It\'s based on the meter definition' },
      { id: 'b', text: 'It\'s defined as 1/60th of a degree of Earth\'s circumference', correct: true },
      { id: 'c', text: 'Ships used to travel 1 mile in 1 minute' },
      { id: 'd', text: 'It matches the speed of ocean currents' }
    ],
    explanation: 'The nautical mile is defined as one minute of arc of latitude along any meridian, making it directly tied to Earth\'s coordinate system.'
  },
  {
    id: 2,
    question: 'When does the nautical mile system NOT simplify calculations?',
    options: [
      { id: 'a', text: 'North-south navigation' },
      { id: 'b', text: 'East-west navigation at high latitudes', correct: true },
      { id: 'c', text: 'Measuring distances on charts' },
      { id: 'd', text: 'Converting speed to distance' }
    ],
    explanation: 'At high latitudes, longitude lines converge, so the simple 1 minute = 1 nm relationship no longer works for east-west travel.'
  },
  {
    id: 3,
    question: 'You\'re at 60°N. Why is east-west navigation more complex here than at the equator?',
    options: [
      { id: 'a', text: 'Magnetic declination is stronger' },
      { id: 'b', text: 'The Coriolis effect is reversed' },
      { id: 'c', text: 'Longitude lines converge, so 1 minute of longitude ≠ 1 nautical mile', correct: true },
      { id: 'd', text: 'Currents flow faster' }
    ],
    explanation: 'At 60°N, longitude lines are only half as far apart as at the equator. You must multiply by cos(60°) = 0.5.'
  },
  {
    id: 4,
    question: 'You\'re a pilot. ATC says "you\'re 43 miles out." Your groundspeed is 215 knots. How long until landing?',
    options: [
      { id: 'a', text: '8 minutes' },
      { id: 'b', text: '12 minutes', correct: true },
      { id: 'c', text: '15 minutes' },
      { id: 'd', text: '20 minutes' }
    ],
    explanation: 'Time = Distance / Speed = 43 / 215 × 60 = 12 minutes. Simple division because both use nautical units!'
  },
  {
    id: 5,
    question: 'What is a rhumb line?',
    options: [
      { id: 'a', text: 'The shortest distance between two points' },
      { id: 'b', text: 'A path of constant compass bearing', correct: true },
      { id: 'c', text: 'A line parallel to the equator' },
      { id: 'd', text: 'A meridian of longitude' }
    ],
    explanation: 'A rhumb line crosses all meridians at the same angle, meaning you can follow it with a constant compass heading.'
  },
  {
    id: 6,
    question: 'You sail due south at 10 knots for 3 hours from 45°30\'N. What\'s your new latitude?',
    options: [
      { id: 'a', text: '45°00\'N', correct: true },
      { id: 'b', text: '45°30\'N' },
      { id: 'c', text: '44°30\'N' },
      { id: 'd', text: '44°00\'N' }
    ],
    explanation: '10 knots × 3 hours = 30 nm = 30 minutes south. 45°30\'N - 30\' = 45°00\'N.'
  },
  {
    id: 7,
    question: 'On a Mercator chart, why can you measure distances using the latitude scale?',
    options: [
      { id: 'a', text: 'It\'s just a convenient ruler' },
      { id: 'b', text: 'Latitude lines are evenly spaced' },
      { id: 'c', text: 'The projection is designed so 1 minute of latitude = 1 nautical mile anywhere', correct: true },
      { id: 'd', text: 'Longitude scale would be more accurate' }
    ],
    explanation: 'The Mercator projection stretches the map to preserve angles, which makes the latitude scale work as a distance ruler at any latitude.'
  },
  {
    id: 8,
    question: 'When would you choose a great circle route over a rhumb line?',
    options: [
      { id: 'a', text: 'For short distances' },
      { id: 'b', text: 'For long distances where fuel savings matter', correct: true },
      { id: 'c', text: 'When navigating near the equator' },
      { id: 'd', text: 'When you want constant heading' }
    ],
    explanation: 'Great circle routes are shorter but require constantly changing heading. For long voyages, the fuel savings outweigh the navigation complexity.'
  },
  {
    id: 9,
    question: 'Flying northeast (045°) at 20 knots for 2 hours travels how far in each direction?',
    options: [
      { id: 'a', text: '20nm north, 20nm east' },
      { id: 'b', text: '40nm north, 40nm east' },
      { id: 'c', text: '~28nm north, ~28nm east', correct: true },
      { id: 'd', text: '20nm north, 40nm east' }
    ],
    explanation: 'Distance = 40nm. At 45°, both components are 40 × cos(45°) = 40 × 0.707 ≈ 28nm each.'
  },
  {
    id: 10,
    question: 'What makes the knot most practical for navigation?',
    options: [
      { id: 'a', text: 'It\'s faster than km/h' },
      { id: 'b', text: 'It\'s easier to pronounce' },
      { id: 'c', text: 'It matches the coordinate system (degrees/minutes) used on charts and GPS', correct: true },
      { id: 'd', text: 'It\'s the oldest unit still in use' }
    ],
    explanation: 'The knot\'s value comes from its direct relationship to coordinates: 1 nm/hour means you travel 1 minute of latitude per hour when going north or south.'
  }
];

/**
 * Educational tooltips
 */
export const tooltips = {
  latitude: 'Angular distance north or south of equator (0° to 90°)',
  longitude: 'Angular distance east or west of prime meridian (0° to 180°)',
  nauticalMile: '1 minute of latitude = 1,852 meters',
  knot: 'Speed of 1 nautical mile per hour',
  rhumbLine: 'Path of constant compass bearing',
  greatCircle: 'Shortest distance between two points on a sphere',
  deadReckoning: 'Calculating position from last known position, speed, and time',
  heading: 'Direction of travel measured in degrees from north (0-360°)',
  bearing: 'Direction to a destination measured in degrees from north'
};

/**
 * Achievement definitions
 */
export const achievements = {
  globeTrotter: {
    name: 'Globe Trotter',
    icon: '🌍',
    description: 'Complete 10 distance measurements',
    requirement: 10
  },
  deadReckoner: {
    name: 'Dead Reckoner',
    icon: '🧭',
    description: 'Solve 5 position calculations',
    requirement: 5
  },
  speedDemon: {
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Complete time trial under 60 seconds',
    requirement: 1
  },
  precisionNavigator: {
    name: 'Precision Navigator',
    icon: '🎯',
    description: 'Get 3 perfect answers in a row',
    requirement: 3
  },
  chartMaster: {
    name: 'Chart Master',
    icon: '📐',
    description: 'Complete all Mercator exercises',
    requirement: 4
  },
  navigationExpert: {
    name: 'Navigation Expert',
    icon: '🏆',
    description: 'Perfect score on final quiz',
    requirement: 10
  }
};

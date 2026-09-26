/**
 * Central Junction (CJN) — Fictional Station Data
 * RailAssist Indoor Navigation
 *
 * SVG coordinate system: viewBox "0 0 900 620"
 *
 * Layout:
 *   y  12–204  → Concourse level
 *   y 204–222  → Platform access corridor
 *   y 222–540  → Platform zone (7 platforms + tracks)
 *   y 540–610  → Station end / service area
 *
 * Platform x-range: 88–888 (800 px wide)
 * Left cross-corridor: x 12–88
 */

// ── Station metadata ───────────────────────────────────────────────────────
export const STATION_META = {
  id: 'CJN',
  name: 'Central Junction',
  code: 'CJN',
  totalPlatforms: 7,
}

// ── Simulated current location ─────────────────────────────────────────────
export const CURRENT_LOCATION = {
  label: 'Platform 2 — Coach B4',
  platformId: 'platform-2',
  x: 312,   // SVG x: ~28% along platform (coach B area)
  y: 293,   // SVG y: centre of Platform 2 strip
}

// ── All interactive locations ──────────────────────────────────────────────
// x, y = SVG centre of the location box/area
// svgRect = { x, y, w, h } for click hit area
export const LOCATIONS = [

  /* ─── PLATFORMS ───────────────────────────────────── */
  {
    id: 'platform-1',
    name: 'Platform 1',
    shortName: 'P1',
    type: 'platform',
    level: 'platform',
    x: 488, y: 249,
    svgRect: { x: 88, y: 234, w: 800, h: 30 },
    accessible: true,
    description: 'Serves regional and express trains. Length: 12 coaches.',
    connections: ['cross-corridor', 'elevator', 'escalator', 'stairs'],
  },
  {
    id: 'platform-2',
    name: 'Platform 2',
    shortName: 'P2',
    type: 'platform',
    level: 'platform',
    x: 488, y: 293,
    svgRect: { x: 88, y: 278, w: 800, h: 30 },
    accessible: true,
    description: 'Serves intercity and local trains. Length: 12 coaches.',
    connections: ['cross-corridor', 'elevator', 'escalator', 'stairs'],
  },
  {
    id: 'platform-3',
    name: 'Platform 3',
    shortName: 'P3',
    type: 'platform',
    level: 'platform',
    x: 488, y: 337,
    svgRect: { x: 88, y: 322, w: 800, h: 30 },
    accessible: true,
    description: 'Serves express and superfast trains. Length: 12 coaches.',
    connections: ['cross-corridor', 'elevator', 'escalator', 'stairs'],
  },
  {
    id: 'platform-4',
    name: 'Platform 4',
    shortName: 'P4',
    type: 'platform',
    level: 'platform',
    x: 488, y: 381,
    svgRect: { x: 88, y: 366, w: 800, h: 30 },
    accessible: true,
    description: 'Serves mail and passenger trains. Length: 10 coaches.',
    connections: ['cross-corridor', 'elevator', 'escalator', 'stairs'],
  },
  {
    id: 'platform-5',
    name: 'Platform 5',
    shortName: 'P5',
    type: 'platform',
    level: 'platform',
    x: 488, y: 425,
    svgRect: { x: 88, y: 410, w: 800, h: 30 },
    accessible: true,
    description: 'Serves suburban and metro link trains.',
    connections: ['cross-corridor', 'elevator', 'escalator', 'stairs'],
  },
  {
    id: 'platform-6',
    name: 'Platform 6',
    shortName: 'P6',
    type: 'platform',
    level: 'platform',
    x: 488, y: 469,
    svgRect: { x: 88, y: 454, w: 800, h: 30 },
    accessible: true,
    description: 'Serves suburban and metro link trains.',
    connections: ['cross-corridor', 'elevator', 'escalator', 'stairs'],
  },
  {
    id: 'platform-7',
    name: 'Platform 7',
    shortName: 'P7',
    type: 'platform',
    level: 'platform',
    x: 488, y: 513,
    svgRect: { x: 88, y: 498, w: 800, h: 30 },
    accessible: true,
    description: 'Goods and service platform. Limited passenger access.',
    connections: ['cross-corridor', 'elevator', 'escalator', 'stairs'],
  },

  /* ─── EXITS / ENTRANCE ─────────────────────────────── */
  {
    id: 'exit-a',
    name: 'Exit A',
    shortName: 'Exit A',
    type: 'exit',
    level: 'concourse',
    x: 49, y: 42,
    svgRect: { x: 12, y: 12, w: 75, h: 60 },
    accessible: true,
    description: 'Exit towards Station Road and bus stops. Step-free access available.',
    connections: ['concourse', 'ticket-counter'],
  },
  {
    id: 'exit-b',
    name: 'Exit B',
    shortName: 'Exit B',
    type: 'exit',
    level: 'concourse',
    x: 854, y: 42,
    svgRect: { x: 820, y: 12, w: 68, h: 60 },
    accessible: true,
    description: 'Exit towards parking area and taxi stand. Ramp available.',
    connections: ['concourse', 'help-desk'],
  },
  {
    id: 'main-entrance',
    name: 'Main Entrance',
    shortName: 'Entrance',
    type: 'entrance',
    level: 'concourse',
    x: 648, y: 153,
    svgRect: { x: 557, y: 116, w: 182, h: 72 },
    accessible: true,
    description: 'Main entrance from Station Square. Automatic doors and step-free ramp.',
    connections: ['concourse', 'ticket-counter', 'info-desk'],
  },

  /* ─── CONCOURSE FACILITIES ─────────────────────────── */
  {
    id: 'ticket-counter',
    name: 'Ticket Counter',
    shortName: 'Tickets',
    type: 'facility',
    level: 'concourse',
    x: 167, y: 63,
    svgRect: { x: 95, y: 22, w: 144, h: 82 },
    accessible: true,
    description: 'Purchase and collect tickets. Counters 1–6. Open daily 5 am – 11 pm.',
    connections: ['concourse', 'exit-a', 'info-desk'],
  },
  {
    id: 'info-desk',
    name: 'Information Desk',
    shortName: 'Info',
    type: 'information',
    level: 'concourse',
    x: 305, y: 63,
    svgRect: { x: 247, y: 22, w: 116, h: 82 },
    accessible: true,
    description: 'Station information and travel assistance. Open 5 am – midnight.',
    connections: ['concourse', 'ticket-counter', 'waiting-area'],
  },
  {
    id: 'waiting-area',
    name: 'Waiting Area',
    shortName: 'Waiting',
    type: 'facility',
    level: 'concourse',
    x: 453, y: 63,
    svgRect: { x: 371, y: 22, w: 164, h: 82 },
    accessible: true,
    description: 'Seating for 120 passengers. Live departure screens inside.',
    connections: ['concourse', 'info-desk', 'help-desk'],
  },
  {
    id: 'help-desk',
    name: 'Help & Porter Desk',
    shortName: 'Help Desk',
    type: 'help',
    level: 'concourse',
    x: 624, y: 63,
    svgRect: { x: 543, y: 22, w: 162, h: 82 },  // careful: main-entrance starts x=557
    accessible: true,
    description: 'Station staff assistance and porter services. Open 24 hours.',
    connections: ['concourse', 'waiting-area', 'staff-point', 'exit-b'],
  },
  {
    id: 'staff-point',
    name: 'Station Staff Point',
    shortName: 'Staff',
    type: 'facility',
    level: 'concourse',
    x: 762, y: 63,
    svgRect: { x: 713, y: 22, w: 99, h: 82 },
    accessible: true,
    description: 'Station staff and security on duty. Emergency contact point.',
    connections: ['concourse', 'help-desk', 'exit-b'],
  },

  /* ─── TOILETS ───────────────────────────────────────── */
  {
    id: 'accessible-toilet',
    name: 'Accessible Toilet',
    shortName: 'Acc. WC',
    type: 'toilet-accessible',
    level: 'concourse',
    x: 145, y: 147,
    svgRect: { x: 95, y: 112, w: 100, h: 70 },
    accessible: true,
    description: 'Wheelchair-accessible toilet with baby-change facility.',
    connections: ['concourse', 'normal-toilet'],
  },
  {
    id: 'normal-toilet',
    name: 'Toilet (WC)',
    shortName: 'WC',
    type: 'toilet',
    level: 'concourse',
    x: 248, y: 147,
    svgRect: { x: 203, y: 112, w: 88, h: 70 },
    accessible: false,
    description: 'Standard toilet facilities. Separate male and female sections.',
    connections: ['concourse', 'accessible-toilet'],
  },

  /* ─── VERTICAL CONNECTIONS ──────────────────────────── */
  {
    id: 'elevator',
    name: 'Elevator',
    shortName: 'Elevator',
    type: 'elevator',
    level: 'both',
    x: 342, y: 147,
    svgRect: { x: 299, y: 112, w: 86, h: 70 },
    accessible: true,
    description: 'Step-free elevator between concourse and all platforms. Open 24 hours.',
    connections: ['concourse', 'cross-corridor', 'platform-access-corridor'],
  },
  {
    id: 'stairs',
    name: 'Stairs',
    shortName: 'Stairs',
    type: 'stairs',
    level: 'both',
    x: 428, y: 147,
    svgRect: { x: 393, y: 112, w: 70, h: 70 },
    accessible: false,
    description: 'Stairs between concourse and platform level. Not wheelchair accessible.',
    connections: ['concourse', 'cross-corridor', 'platform-access-corridor'],
  },
  {
    id: 'escalator',
    name: 'Escalator',
    shortName: 'Escalator',
    type: 'escalator',
    level: 'both',
    x: 511, y: 147,
    svgRect: { x: 471, y: 112, w: 80, h: 70 },
    accessible: true,
    description: 'Moving escalator between concourse and platform level.',
    connections: ['concourse', 'cross-corridor', 'platform-access-corridor'],
  },
]

// ── Platform structural data (for SVG rendering) ───────────────────────────
export const PLATFORM_STRIPS = [
  { id: 'platform-1', number: 1, y: 234, h: 30 },
  { id: 'platform-2', number: 2, y: 278, h: 30 },
  { id: 'platform-3', number: 3, y: 322, h: 30 },
  { id: 'platform-4', number: 4, y: 366, h: 30 },
  { id: 'platform-5', number: 5, y: 410, h: 30 },
  { id: 'platform-6', number: 6, y: 454, h: 30 },
  { id: 'platform-7', number: 7, y: 498, h: 30 },
]

// ── Track structural data (for SVG rendering) ──────────────────────────────
export const TRACK_STRIPS = [
  { y: 222, h: 12 }, // above platform 1
  { y: 264, h: 14 }, // between 1 and 2
  { y: 308, h: 14 }, // between 2 and 3
  { y: 352, h: 14 }, // between 3 and 4
  { y: 396, h: 14 }, // between 4 and 5
  { y: 440, h: 14 }, // between 5 and 6
  { y: 484, h: 14 }, // between 6 and 7
  { y: 528, h: 12 }, // below platform 7
]

// ── Coach labels for platform rendering ───────────────────────────────────
export const COACH_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L']

import { ICON_PATHS } from '../Icon'
import {
  LOCATIONS,
  PLATFORM_STRIPS,
  TRACK_STRIPS,
  COACH_LABELS,
  CURRENT_LOCATION,
} from '../../data/stationData'
import './StationMapCanvas.css'

const TONES = {
  navy: { fill: '#172033', stroke: '#172033', text: '#ffffff', sub: '#c3c9d4', glyph: '#ffffff' },
  red: { fill: '#b4232f', stroke: '#b4232f', text: '#ffffff', sub: '#f6d3d6', glyph: '#ffffff' },
  blue: { fill: '#eef5fd', stroke: '#c4dbf3', text: '#172033', sub: '#667085', glyph: '#1976d2' },
  green: { fill: '#ebf7f1', stroke: '#bfe3d2', text: '#172033', sub: '#667085', glyph: '#1f9d72' },
  neutral: { fill: '#ffffff', stroke: '#d5dbe3', text: '#172033', sub: '#667085', glyph: '#2a3449' },
}

const ROOMS = {
  'exit-a': { tone: 'navy', glyph: 'exit', label: 'Exit A', sub: 'Station Rd' },
  'exit-b': { tone: 'navy', glyph: 'exit', label: 'Exit B', sub: 'Parking' },
  'ticket-counter': { tone: 'neutral', glyph: 'ticket', label: 'Tickets', sub: 'Counters 1–6' },
  'info-desk': { tone: 'blue', glyph: 'info', label: 'Information' },
  'waiting-area': { tone: 'neutral', glyph: 'seat', label: 'Waiting Area', sub: '120 seats' },
  'help-desk': { tone: 'green', glyph: 'help', label: 'Help & Porter', sub: 'Open 24 hrs' },
  'staff-point': { tone: 'neutral', glyph: 'shield', label: 'Staff Point' },
  'main-entrance': { tone: 'red', glyph: 'exit', label: 'Main Entrance', sub: 'Station Square' },
  'accessible-toilet': { tone: 'blue', glyph: 'accessibility', label: 'Accessible WC' },
  'normal-toilet': { tone: 'neutral', glyph: 'toilet', label: 'Toilets' },
  elevator: { tone: 'blue', glyph: 'lift', label: 'Lift' },
  stairs: { tone: 'neutral', glyph: 'stairs', label: 'Stairs' },
  escalator: { tone: 'blue', glyph: 'escalator', label: 'Escalator' },
}

const ROOM_LOCATIONS = LOCATIONS.filter(location => ROOMS[location.id])
const PLATFORM_BY_ID = Object.fromEntries(LOCATIONS.filter(l => l.type === 'platform').map(l => [l.id, l]))

function Glyph({ name, x, y, size = 20, color }) {
  return (
    <svg x={x - size / 2} y={y} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  )
}

function hitProps(location, interactive, onSelect) {
  if (!interactive) return { 'aria-hidden': true }
  return {
    role: 'button',
    tabIndex: 0,
    'aria-label': `${location.name}. ${location.description}`,
    className: 'smc-hit',
    onClick: () => onSelect?.(location.id),
    onKeyDown: event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect?.(location.id)
      }
    },
  }
}

function Room({ location, highlighted, interactive, onSelect }) {
  const { x, y, w, h } = location.svgRect
  const room = ROOMS[location.id]
  const tone = TONES[room.tone]
  const offset = Math.max(0, (h - 70) / 2)
  const cx = x + w / 2

  return (
    <g {...hitProps(location, interactive, onSelect)}>
      {highlighted && <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx="13" fill="none" stroke="#b4232f" strokeWidth="2.5" />}
      <rect x={x} y={y} width={w} height={h} rx="10" fill={tone.fill} stroke={tone.stroke} strokeWidth="1.2" />
      <Glyph name={room.glyph} x={cx} y={y + offset + 10} color={tone.glyph} />
      <text x={cx} y={y + offset + 44} textAnchor="middle" className="smc-room-label" fill={tone.text}>{room.label}</text>
      {room.sub && <text x={cx} y={y + offset + 57} textAnchor="middle" className="smc-room-sub" fill={tone.sub}>{room.sub}</text>}
    </g>
  )
}

function Platform({ strip, highlighted, interactive, onSelect }) {
  const location = PLATFORM_BY_ID[strip.id]
  const mid = strip.y + strip.h / 2

  return (
    <g {...hitProps(location, interactive, onSelect)}>
      <rect x="88" y={strip.y} width="800" height={strip.h} fill={highlighted ? '#fbecee' : '#ffffff'} stroke={highlighted ? '#b4232f' : '#cdd2da'} strokeWidth={highlighted ? 2 : 1} />
      <line x1="88" x2="888" y1={strip.y + 2} y2={strip.y + 2} stroke="#e8b931" strokeWidth="1.5" />
      <line x1="88" x2="888" y1={strip.y + strip.h - 2} y2={strip.y + strip.h - 2} stroke="#e8b931" strokeWidth="1.5" />
      <text x="100" y={mid + 4} className="smc-platform-label" fill={highlighted ? '#b4232f' : '#172033'}>Platform {strip.number}</text>
      {COACH_LABELS.map((coach, index) => (
        <text key={coach} x={230 + index * 60} y={mid + 3} textAnchor="middle" className="smc-coach">{coach}</text>
      ))}
    </g>
  )
}

function DestinationPin({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} className="smc-pin" aria-hidden="true">
      <ellipse cx="0" cy="1" rx="7" ry="2.5" fill="rgba(23,32,51,.25)" />
      <path d="M0 0C-3 -7 -13 -12 -13 -23a13 13 0 1 1 26 0C13 -12 3 -7 0 0Z" fill="#b4232f" stroke="#ffffff" strokeWidth="2" />
      <circle cx="0" cy="-23" r="5" fill="#ffffff" />
    </g>
  )
}

function CurrentLocationMarker() {
  const { x, y } = CURRENT_LOCATION
  return (
    <g aria-hidden="true">
      <circle cx={x} cy={y} r="20" fill="#1976d2" className="smc-pulse" />
      <circle cx={x} cy={y} r="8" fill="#1976d2" stroke="#ffffff" strokeWidth="3" />
      <rect x={x - 40} y={y - 42} width="80" height="20" rx="10" fill="#172033" />
      <text x={x} y={y - 28.5} textAnchor="middle" className="smc-you">You are here</text>
    </g>
  )
}

export default function StationMapCanvas({
  viewBox = '0 0 900 620',
  selectedId,
  destinationId,
  onSelect,
  interactive = true,
  preserveAspectRatio = 'xMidYMid meet',
  className = '',
  title = 'Central Junction station map',
}) {
  const destination = destinationId ? LOCATIONS.find(location => location.id === destinationId) : null
  const isHighlighted = id => id === selectedId || id === destinationId

  return (
    <svg
      className={`smc ${className}`}
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      role={interactive ? 'group' : 'img'}
      aria-label={title}
    >
      <rect x="-400" y="-400" width="1700" height="1420" fill="#e9edf2" />
      <rect x="6" y="6" width="888" height="608" rx="18" fill="#ffffff" stroke="#d5dbe3" strokeWidth="1.5" />

      <rect x="12" y="12" width="876" height="192" rx="12" fill="#f6f7f9" />
      <text x="816" y="156" textAnchor="middle" className="smc-zone">CONCOURSE</text>

      <rect x="12" y="204" width="876" height="18" fill="#e4e8ee" />
      <text x="640" y="216" textAnchor="middle" className="smc-zone smc-zone--sm">PLATFORM ACCESS CORRIDOR</text>
      {[342, 428, 511].map(x => (
        <line key={x} x1={x} x2={x} y1="182" y2="204" stroke="#98a2b3" strokeWidth="1.5" strokeDasharray="3 3" />
      ))}

      <rect x="12" y="222" width="76" height="318" fill="#e4e8ee" />
      <text x="50" y="381" textAnchor="middle" transform="rotate(-90 50 381)" className="smc-zone smc-zone--sm">CROSS CORRIDOR</text>

      {TRACK_STRIPS.map(track => (
        <g key={track.y} aria-hidden="true">
          <rect x="88" y={track.y} width="800" height={track.h} fill="#dde2e8" />
          <line x1="88" x2="888" y1={track.y + track.h * 0.32} y2={track.y + track.h * 0.32} stroke="#9aa3b1" strokeWidth="1.1" />
          <line x1="88" x2="888" y1={track.y + track.h * 0.68} y2={track.y + track.h * 0.68} stroke="#9aa3b1" strokeWidth="1.1" />
        </g>
      ))}

      {PLATFORM_STRIPS.map(strip => (
        <Platform key={strip.id} strip={strip} highlighted={isHighlighted(strip.id)} interactive={interactive} onSelect={onSelect} />
      ))}

      <rect x="12" y="546" width="876" height="62" rx="10" fill="#eef1f5" />
      <text x="450" y="582" textAnchor="middle" className="smc-zone">SERVICE AREA · STAFF ONLY</text>

      {ROOM_LOCATIONS.map(location => (
        <Room key={location.id} location={location} highlighted={isHighlighted(location.id)} interactive={interactive} onSelect={onSelect} />
      ))}

      <CurrentLocationMarker />
      {destination && <DestinationPin x={destination.x} y={destination.y} />}
    </svg>
  )
}

import { useState, useCallback } from 'react'
import BottomNav from '../components/BottomNav'
import {
  STATION_META,
  LOCATIONS,
  PLATFORM_STRIPS,
  TRACK_STRIPS,
  COACH_LABELS,
  CURRENT_LOCATION,
} from '../data/stationData'
import './StationMap.css'

// ── Constants ──────────────────────────────────────────────────────────────
const VB_DEFAULT  = { x: 0,   y: 0,   w: 900, h: 620 }
const VB_RECENTER = { x: 150, y: 180, w: 320, h: 220 } // centred on Platform 2

const TYPE_LABELS = {
  platform:         'Platform',
  exit:             'Exit',
  entrance:         'Main Entrance',
  facility:         'Facility',
  information:      'Information',
  help:             'Help Desk',
  elevator:         'Elevator',
  stairs:           'Stairs',
  escalator:        'Escalator',
  toilet:           'Toilet',
  'toilet-accessible': 'Accessible Toilet',
}

const PLATFORM_IDS = new Set(PLATFORM_STRIPS.map(p => p.id))

// ── Category-based destination picker ──────────────────────────────────────
const CATEGORIES = [
  { key: 'platforms',   label: 'Platforms',  icon: '🚆', ids: ['platform-1','platform-2','platform-3','platform-4','platform-5','platform-6','platform-7'] },
  { key: 'exits',       label: 'Exits',      icon: '🚪', ids: ['exit-a','exit-b','main-entrance'] },
  { key: 'toilets',     label: 'Toilets',    icon: '🚻', ids: ['accessible-toilet','normal-toilet'] },
  { key: 'lifts',       label: 'Lifts',      icon: '⇅',  ids: ['elevator'] },
  { key: 'help',        label: 'Help Desk',  icon: '?',  ids: ['help-desk'] },
  { key: 'facilities',  label: 'Facilities', icon: '🏛',  ids: ['ticket-counter','waiting-area','escalator','stairs','info-desk','staff-point'] },
]

// Search aliases so "lift" matches "Elevator", etc.
const SEARCH_ALIASES = {
  'elevator':         ['lift', 'lifts'],
  'accessible-toilet':['accessible', 'disabled'],
  'normal-toilet':    ['washroom', 'bathroom', 'loo', 'restroom'],
  'main-entrance':    ['entrance', 'gate', 'door'],
  'info-desk':        ['information'],
  'help-desk':        ['porter', 'assistance'],
  'staff-point':      ['security', 'guard'],
}

// ── Inline SVG icons ───────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

// ── Helper ─────────────────────────────────────────────────────────────────
function clampVb({ x, y, w, h }) {
  const minW = 200, minH = 138
  const maxW = 900, maxH = 620
  const cw = Math.max(minW, Math.min(maxW, w))
  const ch = Math.max(minH, Math.min(maxH, h))
  return {
    x: Math.max(0, Math.min(900 - cw, x)),
    y: Math.max(0, Math.min(620 - ch, y)),
    w: cw,
    h: ch,
  }
}

// ══════════════════════════════════════════════════════════════════════════
export default function StationMap() {
  const [vb, setVb]             = useState(VB_DEFAULT)
  const [selected, setSelected] = useState(null)   // location shown in info panel
  const [destId, setDestId]     = useState(null)   // user-confirmed destination
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [showPicker, setShowPicker] = useState(false)  // category picker open
  const [activeCat, setActiveCat]   = useState(null)   // which category is expanded

  // ── Zoom / pan ───────────────────────────────────────────────────────────
  const zoomIn = useCallback(() =>
    setVb(p => clampVb({ x: p.x + p.w * 0.125, y: p.y + p.h * 0.125, w: p.w * 0.75, h: p.h * 0.75 }))
  , [])
  const zoomOut = useCallback(() =>
    setVb(p => clampVb({ x: p.x - p.w * 0.1667, y: p.y - p.h * 0.1667, w: p.w * 1.3333, h: p.h * 1.3333 }))
  , [])
  const resetMap = useCallback(() => { setVb(VB_DEFAULT); setSelected(null) }, [])
  const recenter = useCallback(() => setVb(VB_RECENTER), [])

  // ── Location selection ───────────────────────────────────────────────────
  const handleSelect = useCallback((id) => {
    const loc = LOCATIONS.find(l => l.id === id)
    setSelected(loc || null)
    // Zoom to area if not already visible
    if (loc) {
      setVb(clampVb({ x: loc.x - 200, y: loc.y - 130, w: 400, h: 280 }))
    }
  }, [])

  // ── Search ───────────────────────────────────────────────────────────────
  const handleSearch = useCallback((q) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    const lower = q.toLowerCase()
    const found = LOCATIONS.filter(l => {
      if (l.name.toLowerCase().includes(lower)) return true
      if ((l.shortName || '').toLowerCase().includes(lower)) return true
      if (l.type.toLowerCase().includes(lower)) return true
      if ((l.description || '').toLowerCase().includes(lower)) return true
      // Check aliases
      const aliases = SEARCH_ALIASES[l.id] || []
      if (aliases.some(a => a.includes(lower) || lower.includes(a))) return true
      return false
    }).slice(0, 8)
    setResults(found)
    // When typing, hide category picker and show text results
    setActiveCat(null)
  }, [])

  const pickResult = useCallback((loc) => {
    setQuery(loc.name)
    setResults([])
    setShowPicker(false)
    setActiveCat(null)
    // Auto-set as destination AND zoom to it
    setDestId(loc.id)
    setSelected(null)
    setVb(clampVb({ x: loc.x - 200, y: loc.y - 130, w: 400, h: 280 }))
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setShowPicker(false)
    setActiveCat(null)
  }, [])

  const clearDest = useCallback(() => {
    setDestId(null)
    setQuery('')
    setResults([])
    setShowPicker(false)
    setActiveCat(null)
    setVb(VB_DEFAULT)
  }, [])

  // ── Derived ─────────────────────────────────────────────────────────────
  const viewBoxStr = `${vb.x} ${vb.y} ${vb.w} ${vb.h}`
  const destLoc    = destId ? LOCATIONS.find(l => l.id === destId) : null

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="smap">

      {/* ── Page header ── */}
      <div className="smap-header">
        <div>
          <h1 className="smap-header-title">{STATION_META.name}</h1>
          <p className="smap-header-sub">Indoor Station Map — {STATION_META.code}</p>
        </div>
      </div>

      {/* ── Search bar + category picker ── */}
      <div className="smap-searchbar">
        <div className="smap-search-inner">
          <span className="smap-search-icon"><IconSearch /></span>
          <input
            className="smap-search-input"
            type="search"
            placeholder="Search destination…"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => { if (!query) setShowPicker(true) }}
            aria-label="Search destination"
            autoComplete="off"
          />
          {(query || showPicker) && (
            <button className="smap-search-clear" onClick={clearSearch} aria-label="Clear search">
              <IconClose />
            </button>
          )}
        </div>

        {/* Text search results */}
        {query && results.length > 0 && (
          <ul className="smap-results" role="listbox" aria-label="Search results">
            {results.map(r => (
              <li key={r.id} role="option">
                <button className="smap-result-btn" onClick={() => pickResult(r)}>
                  <span className="smap-result-tag">{TYPE_LABELS[r.type] || r.type}</span>
                  <span className="smap-result-name">{r.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* No results message */}
        {query && query.trim() && results.length === 0 && (
          <div className="smap-no-results">No destination found</div>
        )}

        {/* Category picker — only when query is empty and picker is open */}
        {showPicker && !query && (
          <div className="smap-picker" role="listbox" aria-label="Destination categories">
            {!activeCat ? (
              /* ── Category grid ── */
              <div className="smap-cat-grid">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    className="smap-cat-btn"
                    onClick={() => setActiveCat(cat.key)}
                    aria-label={cat.label}
                  >
                    <span className="smap-cat-icon">{cat.icon}</span>
                    <span className="smap-cat-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              /* ── Location list inside a category ── */
              <div className="smap-cat-list">
                <button
                  className="smap-cat-back"
                  onClick={() => setActiveCat(null)}
                  aria-label="Back to categories"
                >
                  <IconBack />
                  <span>All Categories</span>
                </button>
                <p className="smap-cat-heading">
                  {CATEGORIES.find(c => c.key === activeCat)?.label}
                </p>
                {CATEGORIES.find(c => c.key === activeCat)?.ids.map(locId => {
                  const loc = LOCATIONS.find(l => l.id === locId)
                  if (!loc) return null
                  return (
                    <button
                      key={loc.id}
                      className="smap-cat-item"
                      onClick={() => pickResult(loc)}
                    >
                      <span className="smap-cat-item-name">{loc.name}</span>
                      {loc.accessible && (
                        <span className="smap-cat-item-access">Accessible</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Map canvas ── */}
      <div className="smap-canvas-wrap">
        <svg
          viewBox={viewBoxStr}
          className="smap-svg"
          role="img"
          aria-label="Central Junction indoor station floor plan"
        >

          {/* ════════════════════════════════════════
              STATION SHELL
          ════════════════════════════════════════ */}
          {/* Outer ground */}
          <rect x="0" y="0" width="900" height="620" fill="#d8d2c8"/>
          {/* Station floor */}
          <rect x="10" y="10" width="880" height="600" fill="#f4f2ec" stroke="#555" strokeWidth="2.5" rx="3"/>


          {/* ════════════════════════════════════════
              CONCOURSE LEVEL (y: 12–204)
          ════════════════════════════════════════ */}
          <rect x="12" y="12" width="876" height="192" fill="#e2eaf5" stroke="#8aa0b8" strokeWidth="1.5"/>
          <text x="450" y="23" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#4a6a8a" letterSpacing="2">
            CONCOURSE LEVEL
          </text>

          {/* ── Exit A ── */}
          <g className="smap-hit" onClick={() => handleSelect('exit-a')} role="button" aria-label="Exit A">
            <rect x="12" y="12" width="75" height="65" fill={selected?.id === 'exit-a' ? '#CC2027' : '#1a3a5c'} rx="2"/>
            <text x="49" y="37" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">EXIT</text>
            <text x="49" y="52" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">A</text>
            {/* door gap */}
            <rect x="36" y="77" width="26" height="4" fill="none" stroke="#1a3a5c" strokeWidth="1.5"/>
          </g>

          {/* ── Exit B ── */}
          <g className="smap-hit" onClick={() => handleSelect('exit-b')} role="button" aria-label="Exit B">
            <rect x="820" y="12" width="68" height="65" fill={selected?.id === 'exit-b' ? '#CC2027' : '#1a3a5c'} rx="2"/>
            <text x="854" y="37" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">EXIT</text>
            <text x="854" y="52" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">B</text>
          </g>

          {/* ── Ticket Counter ── */}
          <g className="smap-hit" onClick={() => handleSelect('ticket-counter')} role="button" aria-label="Ticket Counter">
            <rect x="95" y="22" width="144" height="82" rx="3"
                  fill={selected?.id === 'ticket-counter' ? '#fde8e8' : '#fff'}
                  stroke={selected?.id === 'ticket-counter' ? '#CC2027' : '#b8c8d8'} strokeWidth={selected?.id === 'ticket-counter' ? 2 : 1}/>
            {/* ticket graphic */}
            <rect x="118" y="38" width="98" height="40" rx="2" fill="none" stroke="#CC2027" strokeWidth="1.5"/>
            <line x1="148" y1="38" x2="148" y2="78" stroke="#CC2027" strokeWidth="1" strokeDasharray="3 3"/>
            <rect x="152" y="42" width="58" height="6" rx="1" fill="#f0c8c8"/>
            <rect x="152" y="53" width="42" height="6" rx="1" fill="#f0c8c8"/>
            <text x="167" y="94" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1a3a5c">TICKET COUNTER</text>
          </g>

          {/* ── Information Desk ── */}
          <g className="smap-hit" onClick={() => handleSelect('info-desk')} role="button" aria-label="Information Desk">
            <rect x="247" y="22" width="116" height="82" rx="3"
                  fill={selected?.id === 'info-desk' ? '#fde8e8' : '#fff'}
                  stroke={selected?.id === 'info-desk' ? '#CC2027' : '#b8c8d8'} strokeWidth={selected?.id === 'info-desk' ? 2 : 1}/>
            <circle cx="305" cy="52" r="20" fill="none" stroke="#1a3a5c" strokeWidth="2"/>
            <text x="305" y="45" textAnchor="middle" fontSize="20" fontWeight="900" fill="#1a3a5c">i</text>
            <text x="305" y="94" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1a3a5c">INFO DESK</text>
          </g>

          {/* ── Waiting Area ── */}
          <g className="smap-hit" onClick={() => handleSelect('waiting-area')} role="button" aria-label="Waiting Area">
            <rect x="371" y="22" width="164" height="82" rx="3"
                  fill={selected?.id === 'waiting-area' ? '#fde8e8' : '#fff8e1'}
                  stroke={selected?.id === 'waiting-area' ? '#CC2027' : '#e2a820'} strokeWidth="1.5"/>
            {/* seat icons */}
            {[0, 1, 2].map(i => (
              <g key={i} transform={`translate(${402 + i * 40}, 38)`}>
                <rect x="-12" y="0" width="24" height="9" rx="3" fill="#f59e0b" opacity="0.6"/>
                <rect x="-14" y="9" width="28" height="32" rx="3" fill="#f59e0b" opacity="0.35"/>
              </g>
            ))}
            <text x="453" y="94" textAnchor="middle" fontSize="9" fontWeight="700" fill="#92400e">WAITING AREA</text>
          </g>

          {/* ── Help & Porter Desk ── */}
          <g className="smap-hit" onClick={() => handleSelect('help-desk')} role="button" aria-label="Help and Porter Desk">
            <rect x="543" y="22" width="156" height="82" rx="3"
                  fill={selected?.id === 'help-desk' ? '#fde8e8' : '#fffbe6'}
                  stroke={selected?.id === 'help-desk' ? '#CC2027' : '#e2a820'} strokeWidth="1.5"/>
            <text x="621" y="50" textAnchor="middle" fontSize="10" fontWeight="800" fill="#92400e">HELP &amp;</text>
            <text x="621" y="65" textAnchor="middle" fontSize="10" fontWeight="700" fill="#92400e">PORTER DESK</text>
            <circle cx="621" cy="86" r="1" fill="#e2a820"/>
            {/* help symbol */}
            <circle cx="621" cy="78" r="7" fill="none" stroke="#e2a820" strokeWidth="1.5"/>
            <text x="621" y="82" textAnchor="middle" fontSize="10" fontWeight="800" fill="#e2a820">?</text>
          </g>

          {/* ── Station Staff Point ── */}
          <g className="smap-hit" onClick={() => handleSelect('staff-point')} role="button" aria-label="Station Staff Point">
            <rect x="713" y="22" width="99" height="82" rx="3"
                  fill={selected?.id === 'staff-point' ? '#fde8e8' : '#fff'}
                  stroke={selected?.id === 'staff-point' ? '#CC2027' : '#b8c8d8'} strokeWidth="1"/>
            <text x="762" y="50" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1a3a5c">STATION</text>
            <text x="762" y="63" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1a3a5c">STAFF</text>
            <text x="762" y="76" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1a3a5c">POINT</text>
            <rect x="744" y="82" width="36" height="10" rx="2" fill="#CC2027" opacity="0.8"/>
            <text x="762" y="91" textAnchor="middle" fontSize="7.5" fill="#fff" fontWeight="700">24 HRS</text>
          </g>

          {/* ── Accessible Toilet ── */}
          <g className="smap-hit" onClick={() => handleSelect('accessible-toilet')} role="button" aria-label="Accessible Toilet">
            <rect x="95" y="112" width="100" height="70" rx="3"
                  fill={selected?.id === 'accessible-toilet' ? '#fde8e8' : '#f0e8ff'}
                  stroke={selected?.id === 'accessible-toilet' ? '#CC2027' : '#9333ea'} strokeWidth="1.5"/>
            <text x="145" y="140" textAnchor="middle" fontSize="22" fill="#7e22ce">♿</text>
            <text x="145" y="156" textAnchor="middle" fontSize="8" fontWeight="700" fill="#7e22ce">ACCESSIBLE</text>
            <text x="145" y="168" textAnchor="middle" fontSize="8" fontWeight="700" fill="#7e22ce">WC</text>
          </g>

          {/* ── Normal Toilet ── */}
          <g className="smap-hit" onClick={() => handleSelect('normal-toilet')} role="button" aria-label="Toilet">
            <rect x="203" y="112" width="88" height="70" rx="3"
                  fill={selected?.id === 'normal-toilet' ? '#fde8e8' : '#f5f5f5'}
                  stroke={selected?.id === 'normal-toilet' ? '#CC2027' : '#aaa'} strokeWidth="1.5"/>
            <text x="247" y="148" textAnchor="middle" fontSize="16" fontWeight="800" fill="#555">WC</text>
            <text x="247" y="164" textAnchor="middle" fontSize="8" fontWeight="600" fill="#777">TOILET</text>
          </g>

          {/* ── Elevator ── */}
          <g className="smap-hit" onClick={() => handleSelect('elevator')} role="button" aria-label="Elevator">
            <rect x="299" y="112" width="86" height="70" rx="3"
                  fill={selected?.id === 'elevator' ? '#fde8e8' : '#dbeafe'}
                  stroke={selected?.id === 'elevator' ? '#CC2027' : '#3b82f6'} strokeWidth="1.5"/>
            <text x="342" y="140" textAnchor="middle" fontSize="20" fill="#1d4ed8">⇅</text>
            <text x="342" y="156" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#1d4ed8">ELEVATOR</text>
            <text x="342" y="170" textAnchor="middle" fontSize="9" fill="#3b82f6">♿</text>
          </g>

          {/* ── Stairs ── */}
          <g className="smap-hit" onClick={() => handleSelect('stairs')} role="button" aria-label="Stairs">
            <rect x="393" y="112" width="70" height="70" rx="3"
                  fill={selected?.id === 'stairs' ? '#fde8e8' : '#f5f5f5'}
                  stroke={selected?.id === 'stairs' ? '#CC2027' : '#999'} strokeWidth="1.5"/>
            {[0,1,2,3].map(i => (
              <rect key={i} x={402 + i * 8} y={130 + (3-i) * 7} width="20" height="7" rx="1" fill="#888"/>
            ))}
            <text x="428" y="172" textAnchor="middle" fontSize="8" fontWeight="600" fill="#555">STAIRS</text>
          </g>

          {/* ── Escalator ── */}
          <g className="smap-hit" onClick={() => handleSelect('escalator')} role="button" aria-label="Escalator">
            <rect x="471" y="112" width="80" height="70" rx="3"
                  fill={selected?.id === 'escalator' ? '#fde8e8' : '#dcfce7'}
                  stroke={selected?.id === 'escalator' ? '#CC2027' : '#16a34a'} strokeWidth="1.5"/>
            <text x="511" y="140" textAnchor="middle" fontSize="20" fill="#15803d">⇅</text>
            <text x="511" y="156" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#15803d">ESCALATOR</text>
            <text x="511" y="170" textAnchor="middle" fontSize="9" fill="#16a34a">♿</text>
          </g>

          {/* ── Main Entrance ── */}
          <g className="smap-hit" onClick={() => handleSelect('main-entrance')} role="button" aria-label="Main Entrance">
            <rect x="557" y="116" width="182" height="72" rx="3"
                  fill={selected?.id === 'main-entrance' ? '#991b1b' : '#CC2027'} opacity="0.92"/>
            <text x="648" y="148" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">MAIN ENTRANCE</text>
            <text x="648" y="164" textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.85)">♿ Step-free access</text>
            {/* door symbols */}
            <rect x="616" y="182" width="20" height="5" rx="1" fill="#fff" opacity="0.5"/>
            <rect x="646" y="182" width="20" height="5" rx="1" fill="#fff" opacity="0.5"/>
          </g>

          {/* Connector dashes from elevator/stairs/escalator to corridor */}
          {[342, 428, 511].map(cx => (
            <line key={cx} x1={cx} y1="182" x2={cx} y2="204"
                  stroke="#8a9ab0" strokeWidth="2" strokeDasharray="3 2"/>
          ))}


          {/* ════════════════════════════════════════
              PLATFORM ACCESS CORRIDOR (y: 204–222)
          ════════════════════════════════════════ */}
          <rect x="12" y="204" width="876" height="18" fill="#c8ccd8" stroke="#999" strokeWidth="1"/>
          <text x="450" y="216" textAnchor="middle" fontSize="7" fontWeight="600"
                fill="#555" letterSpacing="2">PLATFORM ACCESS CORRIDOR</text>


          {/* ════════════════════════════════════════
              PLATFORM ZONE BACKGROUND (y: 222–560)
          ════════════════════════════════════════ */}
          <rect x="12" y="222" width="876" height="338" fill="#c8cac0"/>

          {/* Left cross-corridor connecting all platforms */}
          <rect x="12" y="222" width="76" height="338" fill="#d8dcd4" stroke="#999" strokeWidth="1"/>
          <text x="50" y="400" textAnchor="middle" fontSize="7.5" fontWeight="700"
                fill="#666" transform="rotate(-90, 50, 400)" letterSpacing="3">
            PLATFORM ACCESS
          </text>

          {/* Right open end (track extension indicator) */}
          <rect x="888" y="222" width="12" height="338" fill="#b8b8b8" stroke="#999" strokeWidth="1"/>


          {/* ════════════════════════════════════════
              TRACKS
          ════════════════════════════════════════ */}
          {TRACK_STRIPS.map((t, i) => (
            <g key={i}>
              {/* Track ballast (gravel) */}
              <rect x="88" y={t.y} width="800" height={t.h} fill="#7a7a78"/>
              {/* Rail 1 (top rail) */}
              <rect x="88" y={t.y + 2} width="800" height="2.5" fill="#505050"/>
              {/* Rail 2 (bottom rail) */}
              <rect x="88" y={t.y + t.h - 4.5} width="800" height="2.5" fill="#505050"/>
              {/* Sleepers every 22 px */}
              {Array.from({ length: 37 }, (_, j) => (
                <rect key={j}
                  x={88 + j * 22} y={t.y + 0.5}
                  width="3" height={t.h - 1}
                  fill="#6a6050" opacity="0.55"/>
              ))}
            </g>
          ))}


          {/* ════════════════════════════════════════
              PLATFORMS
          ════════════════════════════════════════ */}
          {PLATFORM_STRIPS.map(p => {
            const isSelected = selected?.id === p.id
            const isDest     = destId === p.id
            return (
              <g key={p.id}
                 className="smap-hit"
                 onClick={() => handleSelect(p.id)}
                 role="button"
                 aria-label={`Platform ${p.number}`}>

                {/* Platform surface */}
                <rect x="88" y={p.y} width="800" height={p.h}
                      fill={isSelected ? '#fde8e8' : isDest ? '#dcfce7' : '#f0f4ff'}
                      stroke={isSelected ? '#CC2027' : '#7a9ab8'}
                      strokeWidth={isSelected ? 2.5 : 1}/>

                {/* Platform edge warning strips (yellow) */}
                <rect x="88" y={p.y} width="800" height="4" fill="#f5c518" opacity="0.75"/>
                <rect x="88" y={p.y + p.h - 4} width="800" height="4" fill="#f5c518" opacity="0.75"/>

                {/* Platform number — large, left side */}
                <text x="108" y={p.y + p.h / 2 + 5}
                      fontSize="13" fontWeight="800"
                      fill={isSelected ? '#CC2027' : '#1a3a5c'}>
                  Platform {p.number}
                </text>

                {/* Coach divider lines + labels */}
                {COACH_LABELS.map((coach, ci) => {
                  const cx = 120 + ci * 70 + 35
                  return (
                    <g key={coach}>
                      <line x1={cx} y1={p.y + 4} x2={cx} y2={p.y + p.h - 4}
                            stroke="#b0b8cc" strokeWidth="0.75" strokeDasharray="2 5"/>
                      <text x={cx} y={p.y + p.h / 2 + 4}
                            textAnchor="middle" fontSize="8" fill="#aab0c0">
                        {coach}
                      </text>
                    </g>
                  )
                })}

                {/* Destination badge */}
                {isDest && (
                  <>
                    <rect x="800" y={p.y + 5} width="60" height="20" rx="3" fill="#16a34a"/>
                    <text x="830" y={p.y + 19} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#fff">
                      DEST.
                    </text>
                  </>
                )}
              </g>
            )
          })}

          {/* Platform connector dashes from left corridor */}
          {PLATFORM_STRIPS.map(p => (
            <line key={p.id + '-c'}
                  x1="88" y1={p.y + p.h / 2}
                  x2="68" y2={p.y + p.h / 2}
                  stroke="#CC2027" strokeWidth="2" strokeDasharray="4 3"/>
          ))}


          {/* ════════════════════════════════════════
              STATION END / SERVICE AREA (y: 540–610)
          ════════════════════════════════════════ */}
          <rect x="12" y="540" width="876" height="68" fill="#dedad2" stroke="#999" strokeWidth="1"/>
          {/* Buffer stops */}
          {PLATFORM_STRIPS.map(p => (
            <rect key={p.id + '-buf'}
                  x="878" y={p.y} width="10" height={p.h}
                  fill="#CC2027" rx="1"/>
          ))}
          <text x="450" y="576" textAnchor="middle" fontSize="8" fill="#888" letterSpacing="1">
            ← TRACKS CONTINUE BEYOND STATION →
          </text>


          {/* ════════════════════════════════════════
              DESTINATION MARKER
          ════════════════════════════════════════ */}
          {destLoc && (
            <g>
              <circle cx={destLoc.x} cy={destLoc.y} r="14" fill="#16a34a" opacity="0.9"/>
              <text x={destLoc.x} y={destLoc.y + 5}
                    textAnchor="middle" fontSize="14" fill="#fff" fontWeight="900">★</text>
            </g>
          )}


          {/* ════════════════════════════════════════
              YOU ARE HERE — Platform 2, Coach B4
          ════════════════════════════════════════ */}
          <g>
            {/* Pulse ring */}
            <circle cx={CURRENT_LOCATION.x} cy={CURRENT_LOCATION.y} r="14" fill="#2563eb" opacity="0.18">
              <animate attributeName="r" values="10;22;10" dur="2.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.22;0.04;0.22" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            {/* Blue dot */}
            <circle cx={CURRENT_LOCATION.x} cy={CURRENT_LOCATION.y} r="10" fill="#2563eb"/>
            <circle cx={CURRENT_LOCATION.x} cy={CURRENT_LOCATION.y} r="4"  fill="#fff"/>
            {/* Label */}
            <rect x={CURRENT_LOCATION.x - 56} y={CURRENT_LOCATION.y - 34}
                  width="112" height="17" rx="3" fill="#1e3a8a" opacity="0.92"/>
            <text x={CURRENT_LOCATION.x} y={CURRENT_LOCATION.y - 22}
                  textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#fff">
              YOU ARE HERE
            </text>
            <rect x={CURRENT_LOCATION.x - 54} y={CURRENT_LOCATION.y - 16}
                  width="108" height="13" rx="2" fill="#fff" opacity="0.88"/>
            <text x={CURRENT_LOCATION.x} y={CURRENT_LOCATION.y - 6}
                  textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#1e3a8a">
              {CURRENT_LOCATION.label}
            </text>
          </g>

          {/* ════════════════════════════════════════
              SELECTED LOCATION RING (non-platform)
          ════════════════════════════════════════ */}
          {selected && !PLATFORM_IDS.has(selected.id) && (
            <circle cx={selected.x} cy={selected.y} r="20"
                    fill="none" stroke="#CC2027" strokeWidth="3"
                    strokeDasharray="6 3" opacity="0.85"/>
          )}

        </svg>

        {/* ── Map controls ── */}
        <div className="smap-controls" role="group" aria-label="Map controls">
          <button className="smap-ctrl" onClick={zoomIn}  aria-label="Zoom in"  title="Zoom in">+</button>
          <button className="smap-ctrl" onClick={zoomOut} aria-label="Zoom out" title="Zoom out">−</button>
          <button className="smap-ctrl smap-ctrl--sm" onClick={recenter} aria-label="Recenter" title="Recenter on current location">⊙</button>
          <button className="smap-ctrl smap-ctrl--sm" onClick={resetMap} aria-label="Reset map" title="Reset to full view">↺</button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="smap-legend" aria-label="Map legend">
        <div className="smap-legend-item">
          <span className="smap-legend-dot smap-legend-dot--here"/>
          <span>You are here</span>
        </div>
        <div className="smap-legend-item">
          <span className="smap-legend-sym smap-legend-sym--dest">★</span>
          <span>Destination</span>
        </div>
        <div className="smap-legend-item">
          <span className="smap-legend-sym">⇅</span>
          <span>Elevator / Escalator</span>
        </div>
        <div className="smap-legend-item">
          <span className="smap-legend-sym">WC</span>
          <span>Toilet</span>
        </div>
        <div className="smap-legend-item">
          <span className="smap-legend-sym">♿</span>
          <span>Accessible</span>
        </div>
      </div>

      {/* ── Location info panel ── */}
      {selected && (
        <div className="smap-panel" role="region" aria-label="Location information">
          <div className="smap-panel-row">
            <div className="smap-panel-info">
              <p className="smap-panel-type">{TYPE_LABELS[selected.type] || selected.type}</p>
              <h3 className="smap-panel-name">{selected.name}</h3>
              {selected.accessible && (
                <span className="smap-panel-access">♿ Wheelchair accessible</span>
              )}
            </div>
            <button className="smap-panel-close" onClick={() => setSelected(null)} aria-label="Close panel">
              <IconClose />
            </button>
          </div>
          <p className="smap-panel-desc">{selected.description}</p>
          <div className="smap-panel-actions">
            <button
              className="smap-btn-dest"
              onClick={() => { setDestId(selected.id); setSelected(null) }}
            >
              Set as Destination
            </button>
            {destId === selected.id && (
              <button
                className="smap-btn-clear"
                onClick={() => { setDestId(null); setSelected(null) }}
              >
                Clear Destination
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Destination summary card ── */}
      {destId && !selected && (
        <div className="smap-dest-card" role="region" aria-label="Destination summary">
          <p className="smap-dest-card-heading">Destination</p>
          <h3 className="smap-dest-card-name">{destLoc?.name}</h3>
          <p className="smap-dest-card-type">
            {TYPE_LABELS[destLoc?.type] || destLoc?.type}
          </p>
          {destLoc?.accessible && (
            <p className="smap-dest-row-access">♿ Wheelchair accessible</p>
          )}
          <div className="smap-dest-actions">
            <button
              className="smap-btn-dest-clear"
              onClick={clearDest}
              aria-label="Clear destination"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

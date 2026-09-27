import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { STATION_META, CURRENT_LOCATION, LOCATIONS } from '../data/stationData'
import './Accessibility.css'

// ── Assistance categories ──────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'wheelchair',
    label: 'Wheelchair Access',
    desc: 'Find lifts, accessible toilets and step-free areas.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="4" r="1.5"/>
        <path d="M9 17a4 4 0 108 0 4 4 0 00-8 0z"/>
        <path d="M12 12v-3h3l2 5h2"/>
        <path d="M9 12H7"/>
      </svg>
    ),
  },
  {
    id: 'elderly',
    label: 'Elderly Assistance',
    desc: 'Get simple directions and nearby assistance.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="4" r="2"/>
        <path d="M12 6v5l-3 8M12 11l3 8M9 11h6"/>
        <path d="M17 21l1-3"/>
      </svg>
    ),
  },
  {
    id: 'visual',
    label: 'Visual Assistance',
    desc: 'Use larger text and voice guidance.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
  {
    id: 'hearing',
    label: 'Hearing Assistance',
    desc: 'Use clear visual instructions and station information.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M3 18v-6a9 9 0 0118 0v6"/>
        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
      </svg>
    ),
  },
]

// ── Accessible facilities from existing data ──────────────────────────────
const ACCESSIBLE_FACILITIES = LOCATIONS.filter(
  l => l.accessible && ['elevator','toilet-accessible','help','entrance'].includes(l.type)
)

// ── Elderly quick links ───────────────────────────────────────────────────
const ELDERLY_OPTIONS = [
  { label: 'Find a Platform',  searchQ: 'platform' },
  { label: 'Find a Toilet',    searchQ: 'toilet' },
  { label: 'Find an Exit',     searchQ: 'exit' },
  { label: 'Find a Lift',      searchQ: 'lift' },
  { label: 'Ask for Help',     path: '/voice' },
]

// ── Type label lookup ─────────────────────────────────────────────────────
const TYPE_LABELS = {
  elevator: 'Elevator',
  'toilet-accessible': 'Accessible Toilet',
  help: 'Help Desk',
  entrance: 'Main Entrance',
}

// ── Views ─────────────────────────────────────────────────────────────────
const VIEW_MAIN     = 'main'
const VIEW_DETAIL   = 'detail'
const VIEW_SETTINGS = 'settings'

// ── Icon helpers ──────────────────────────────────────────────────────────
const IconBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

// ══════════════════════════════════════════════════════════════════════════
export default function Accessibility() {
  const navigate = useNavigate()
  const [view, setView]       = useState(VIEW_MAIN)
  const [catId, setCatId]     = useState(null)

  // ── Accessibility settings (local state for prototype) ──────────────────
  const [largeText, setLargeText]         = useState(false)
  const [highContrast, setHighContrast]   = useState(false)
  const [voiceGuidance, setVoiceGuidance] = useState(false)
  const [visualInstr, setVisualInstr]     = useState(false)
  const [showAlerts, setShowAlerts]       = useState(false)

  // ── Navigation ─────────────────────────────────────────────────────────
  const openCategory = useCallback((id) => {
    setCatId(id)
    setView(VIEW_DETAIL)
  }, [])

  const goBack = useCallback(() => {
    setView(VIEW_MAIN)
    setCatId(null)
  }, [])

  // ── Derived ──────────────────────────────────────────────────────────────
  const catInfo = CATEGORIES.find(c => c.id === catId)

  // Dynamic root class for accessibility overrides
  const rootClass = [
    'acc-page',
    largeText    ? 'acc-page--large-text' : '',
    highContrast ? 'acc-page--high-contrast' : '',
  ].filter(Boolean).join(' ')

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className={rootClass}>

      {/* ── Header ── */}
      <div className="acc-header">
        {view !== VIEW_MAIN && (
          <button className="acc-header-back" onClick={goBack} aria-label="Back">
            <IconBack />
          </button>
        )}
        <div className="acc-header-text">
          <h1 className="acc-header-title">{view === VIEW_MAIN ? 'Accessibility' : 'Accessibility Assistance'}</h1>
          {view === VIEW_MAIN && (
            <p className="acc-header-sub">Choose what kind of assistance you need.</p>
          )}
        </div>
        {view === VIEW_MAIN && (
          <button
            className="acc-settings-btn"
            onClick={() => setView(VIEW_SETTINGS)}
            aria-label="Accessibility settings"
          >
            Settings
          </button>
        )}
      </div>

      <div className="acc-body">

        {/* ═══════════════════════════════════════════
            MAIN — Category selection
        ═══════════════════════════════════════════ */}
        {view === VIEW_MAIN && (
          <div className="acc-categories">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className="acc-cat-btn"
                onClick={() => openCategory(cat.id)}
                aria-label={cat.label}
              >
                <span className="acc-cat-icon">{cat.icon}</span>
                <div className="acc-cat-text">
                  <span className="acc-cat-label">{cat.label}</span>
                  <span className="acc-cat-desc">{cat.desc}</span>
                </div>
              </button>
            ))}
          </div>
        )}


        {/* ═══════════════════════════════════════════
            WHEELCHAIR ACCESS
        ═══════════════════════════════════════════ */}
        {view === VIEW_DETAIL && catId === 'wheelchair' && (
          <div className="acc-detail">
            <div className="acc-detail-header">
              <span className="acc-detail-icon">{catInfo.icon}</span>
              <h2 className="acc-detail-title">Accessible Facilities</h2>
            </div>

            <p className="acc-detail-hint">
              Step-free and wheelchair-accessible facilities at {STATION_META.name}.
            </p>

            <div className="acc-facility-list">
              {ACCESSIBLE_FACILITIES.map(loc => (
                <button
                  key={loc.id}
                  className="acc-facility-item"
                  onClick={() => navigate('/map', { state: { destinationId: loc.id } })}
                  aria-label={`${loc.name} — view on map`}
                >
                  <div className="acc-facility-info">
                    <span className="acc-facility-name">{loc.name}</span>
                    <span className="acc-facility-type">
                      {TYPE_LABELS[loc.type] || loc.type}
                    </span>
                  </div>
                  <span className="acc-facility-badge">View on Map</span>
                </button>
              ))}
            </div>
          </div>
        )}


        {/* ═══════════════════════════════════════════
            ELDERLY ASSISTANCE
        ═══════════════════════════════════════════ */}
        {view === VIEW_DETAIL && catId === 'elderly' && (
          <div className="acc-detail">
            <div className="acc-detail-header">
              <span className="acc-detail-icon">{catInfo.icon}</span>
              <h2 className="acc-detail-title">Simple Navigation</h2>
            </div>

            <p className="acc-detail-hint">
              Tap what you are looking for. We will help you find it.
            </p>

            {/* Location context */}
            <div className="acc-loc-card">
              <p className="acc-loc-station">{STATION_META.name} ({STATION_META.code})</p>
              <p className="acc-loc-platform">You are at: {CURRENT_LOCATION.label}</p>
            </div>

            <div className="acc-elderly-list">
              {ELDERLY_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  className="acc-elderly-btn"
                  onClick={() => opt.path
                    ? navigate(opt.path)
                    : navigate(`/map`)
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}


        {/* ═══════════════════════════════════════════
            VISUAL ASSISTANCE
        ═══════════════════════════════════════════ */}
        {view === VIEW_DETAIL && catId === 'visual' && (
          <div className="acc-detail">
            <div className="acc-detail-header">
              <span className="acc-detail-icon">{catInfo.icon}</span>
              <h2 className="acc-detail-title">Visual Assistance</h2>
            </div>

            <p className="acc-detail-hint">
              Adjust the display to make it easier to read.
            </p>

            <div className="acc-toggle-list">
              <label className="acc-toggle-row">
                <div className="acc-toggle-info">
                  <span className="acc-toggle-label">Large Text</span>
                  <span className="acc-toggle-desc">Make all text bigger</span>
                </div>
                <input
                  type="checkbox"
                  className="acc-toggle-input"
                  checked={largeText}
                  onChange={() => setLargeText(v => !v)}
                />
                <span className={`acc-toggle-switch ${largeText ? 'acc-toggle-switch--on' : ''}`} />
              </label>

              <label className="acc-toggle-row">
                <div className="acc-toggle-info">
                  <span className="acc-toggle-label">High Contrast</span>
                  <span className="acc-toggle-desc">Make colours bolder and text clearer</span>
                </div>
                <input
                  type="checkbox"
                  className="acc-toggle-input"
                  checked={highContrast}
                  onChange={() => setHighContrast(v => !v)}
                />
                <span className={`acc-toggle-switch ${highContrast ? 'acc-toggle-switch--on' : ''}`} />
              </label>

              <label className="acc-toggle-row">
                <div className="acc-toggle-info">
                  <span className="acc-toggle-label">Voice Guidance</span>
                  <span className="acc-toggle-desc">Read directions aloud (prototype)</span>
                </div>
                <input
                  type="checkbox"
                  className="acc-toggle-input"
                  checked={voiceGuidance}
                  onChange={() => setVoiceGuidance(v => !v)}
                />
                <span className={`acc-toggle-switch ${voiceGuidance ? 'acc-toggle-switch--on' : ''}`} />
              </label>
            </div>

            {(largeText || highContrast || voiceGuidance) && (
              <div className="acc-active-note" role="status">
                Settings applied to this page. In the full app these would apply everywhere.
              </div>
            )}
          </div>
        )}


        {/* ═══════════════════════════════════════════
            HEARING ASSISTANCE
        ═══════════════════════════════════════════ */}
        {view === VIEW_DETAIL && catId === 'hearing' && (
          <div className="acc-detail">
            <div className="acc-detail-header">
              <span className="acc-detail-icon">{catInfo.icon}</span>
              <h2 className="acc-detail-title">Hearing Assistance</h2>
            </div>

            <p className="acc-detail-hint">
              All important information will be shown on screen instead of audio.
            </p>

            <div className="acc-toggle-list">
              <label className="acc-toggle-row">
                <div className="acc-toggle-info">
                  <span className="acc-toggle-label">Visual Instructions</span>
                  <span className="acc-toggle-desc">Show all navigation steps on screen</span>
                </div>
                <input
                  type="checkbox"
                  className="acc-toggle-input"
                  checked={visualInstr}
                  onChange={() => setVisualInstr(v => !v)}
                />
                <span className={`acc-toggle-switch ${visualInstr ? 'acc-toggle-switch--on' : ''}`} />
              </label>

              <label className="acc-toggle-row">
                <div className="acc-toggle-info">
                  <span className="acc-toggle-label">Show Important Alerts</span>
                  <span className="acc-toggle-desc">Display platform and train alerts visually</span>
                </div>
                <input
                  type="checkbox"
                  className="acc-toggle-input"
                  checked={showAlerts}
                  onChange={() => setShowAlerts(v => !v)}
                />
                <span className={`acc-toggle-switch ${showAlerts ? 'acc-toggle-switch--on' : ''}`} />
              </label>
            </div>

            {(visualInstr || showAlerts) && (
              <div className="acc-active-note" role="status">
                Hearing assistance preferences saved for this session.
              </div>
            )}
          </div>
        )}


        {/* ═══════════════════════════════════════════
            SETTINGS
        ═══════════════════════════════════════════ */}
        {view === VIEW_SETTINGS && (
          <div className="acc-detail">
            <h2 className="acc-detail-title">Accessibility Settings</h2>

            <p className="acc-detail-hint">
              Adjust these settings to improve your experience at the station.
            </p>

            <div className="acc-toggle-list">
              <label className="acc-toggle-row">
                <div className="acc-toggle-info">
                  <span className="acc-toggle-label">Large Text</span>
                  <span className="acc-toggle-desc">Make all text bigger</span>
                </div>
                <input
                  type="checkbox"
                  className="acc-toggle-input"
                  checked={largeText}
                  onChange={() => setLargeText(v => !v)}
                />
                <span className={`acc-toggle-switch ${largeText ? 'acc-toggle-switch--on' : ''}`} />
              </label>

              <label className="acc-toggle-row">
                <div className="acc-toggle-info">
                  <span className="acc-toggle-label">High Contrast</span>
                  <span className="acc-toggle-desc">Make colours bolder and text clearer</span>
                </div>
                <input
                  type="checkbox"
                  className="acc-toggle-input"
                  checked={highContrast}
                  onChange={() => setHighContrast(v => !v)}
                />
                <span className={`acc-toggle-switch ${highContrast ? 'acc-toggle-switch--on' : ''}`} />
              </label>

              <label className="acc-toggle-row">
                <div className="acc-toggle-info">
                  <span className="acc-toggle-label">Voice Guidance</span>
                  <span className="acc-toggle-desc">Read directions aloud (prototype)</span>
                </div>
                <input
                  type="checkbox"
                  className="acc-toggle-input"
                  checked={voiceGuidance}
                  onChange={() => setVoiceGuidance(v => !v)}
                />
                <span className={`acc-toggle-switch ${voiceGuidance ? 'acc-toggle-switch--on' : ''}`} />
              </label>
            </div>

            <button className="acc-done-btn" onClick={goBack}>
              Done
            </button>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import './Home.css'

/* ── Inline SVG icons ─────────────────────────── */
const IconLocation = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
)

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const IconMic = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
    <path d="M19 10v2a7 7 0 01-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)

const IconTrain = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="3" width="16" height="14" rx="3"/>
    <circle cx="8.5" cy="14" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="15.5" cy="14" r="1.5" fill="currentColor" stroke="none"/>
    <line x1="4" y1="9" x2="20" y2="9"/>
    <line x1="12" y1="3" x2="12" y2="9"/>
    <path d="M8 20l-2 2M16 20l2 2"/>
  </svg>
)

const IconToilet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="4" r="1.5"/>
    <circle cx="15" cy="4" r="1.5"/>
    <path d="M7 8h3l1 5H7l-2 4h10l-2-4h-2l1-5h3"/>
  </svg>
)

const IconLift = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="2" width="14" height="20" rx="2"/>
    <path d="M9 10l3-3 3 3"/>
    <path d="M9 14l3 3 3-3"/>
  </svg>
)

const IconExit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 8l4 4-4 4"/>
    <path d="M18 12H8"/>
    <path d="M10 4H5a1 1 0 00-1 1v14a1 1 0 001 1h5"/>
  </svg>
)

const IconHelp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const IconEmergency = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

const IconAccessibility = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="4" r="1.5"/>
    <path d="M6 9h12M9 9v10M15 9v6l2 4"/>
  </svg>
)

const IconProfile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

const IconClear = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

/* ── Common places data ───────────────────────── */
const COMMON_PLACES = [
  { id: 'platforms', label: 'Platforms',   Icon: IconTrain,  path: '/search?q=platform'  },
  { id: 'toilets',   label: 'Toilets',     Icon: IconToilet, path: '/search?q=toilet'    },
  { id: 'lifts',     label: 'Lifts',       Icon: IconLift,   path: '/search?q=lift'      },
  { id: 'exits',     label: 'Exits',       Icon: IconExit,   path: '/search?q=exit'      },
]

/* ═══════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate()

  const [query, setQuery]           = useState('')
  const [voiceActive, setVoiceActive] = useState(false)
  const [showLocation, setShowLocation] = useState(false)
  const inputRef = useRef(null)

  /* ── voice toggle (UI only – no real speech API yet) ── */
  function handleVoiceToggle() {
    if (voiceActive) {
      setVoiceActive(false)
    } else {
      setVoiceActive(true)
      // Auto-dismiss after 3 s to show it's simulation only
      setTimeout(() => setVoiceActive(false), 3000)
    }
  }

  /* ── search submit ── */
  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="home">

      {/* ══════════ 1. HEADER ══════════ */}
      <header className="home-header">
        <div className="home-header__brand">
          {/* Train logo mark */}
          <div className="home-header__logo" aria-hidden="true">
            <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
              <rect width="28" height="28" rx="5" fill="#CC2027"/>
              <rect x="4" y="7" width="20" height="12" rx="2.5" stroke="#fff" strokeWidth="1.8" fill="none"/>
              <circle cx="8.5" cy="16.5" r="2" fill="#fff"/>
              <circle cx="19.5" cy="16.5" r="2" fill="#fff"/>
              <line x1="4" y1="12" x2="24" y2="12" stroke="#fff" strokeWidth="1.8"/>
              <line x1="14" y1="7" x2="14" y2="12" stroke="#fff" strokeWidth="1.8"/>
            </svg>
          </div>
          <div>
            <span className="home-header__name">RailAssist</span>
            <span className="home-header__station">Central Junction (CJN)</span>
          </div>
        </div>
        <div className="home-header__actions">
          <button className="home-header__btn" aria-label="Accessibility settings">
            <IconAccessibility />
          </button>
          <button className="home-header__btn home-header__btn--filled" aria-label="Profile">
            <IconProfile />
          </button>
        </div>
      </header>

      {/* ══════════ SCROLLABLE BODY ══════════ */}
      <div className="home-body">

        {/* ══════════ 2. CURRENT LOCATION ══════════ */}
        <section className="home-location" aria-label="Your current location">
          <div className="home-location__icon" aria-hidden="true">
            <IconLocation />
          </div>
          <div className="home-location__text">
            <p className="home-location__title">You are at Central Junction</p>
            <p className="home-location__detail">Current location: Platform 2</p>
          </div>
          <button
            className="home-location__change"
            onClick={() => setShowLocation(v => !v)}
            aria-expanded={showLocation}
          >
            Change
          </button>
        </section>

        {/* Change-location callout (simulated) */}
        {showLocation && (
          <div className="home-location__callout" role="status">
            Location simulation: tap a platform on the map to update your position.
            <button className="home-location__callout-close" onClick={() => setShowLocation(false)} aria-label="Dismiss">
              <IconClear />
            </button>
          </div>
        )}

        {/* ══════════ 3. MAIN HEADING ══════════ */}
        <section className="home-main-heading" aria-label="Main navigation prompt">
          <h1 className="home-main-heading__h1">Where do you need help?</h1>
          <p className="home-main-heading__sub">Find a place inside the station</p>
        </section>

        {/* ══════════ 4. SEARCH ══════════ */}
        <section className="home-search-section" aria-label="Search for a destination">
          <form onSubmit={handleSearch} role="search">
            <div className="home-search__box">
              <span className="home-search__icon" aria-hidden="true"><IconSearch /></span>
              <input
                ref={inputRef}
                className="home-search__input"
                type="search"
                inputMode="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for a platform, toilet, lift or exit"
                aria-label="Search destination"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  className="home-search__clear"
                  onClick={() => { setQuery(''); inputRef.current?.focus() }}
                  aria-label="Clear search"
                >
                  <IconClear />
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ══════════ 5. VOICE BUTTON ══════════ */}
        <section className="home-voice-section" aria-label="Voice assistance">
          <button
            className={`home-voice__btn${voiceActive ? ' home-voice__btn--active' : ''}`}
            onClick={handleVoiceToggle}
            aria-pressed={voiceActive}
            aria-label={voiceActive ? 'Stop voice input' : 'Start voice input'}
          >
            <span className={`home-voice__mic${voiceActive ? ' home-voice__mic--pulse' : ''}`} aria-hidden="true">
              <IconMic />
            </span>
            <span className="home-voice__text-group">
              <span className="home-voice__label">
                {voiceActive ? 'Listening…' : 'Speak your request'}
              </span>
              {!voiceActive && (
                <span className="home-voice__hint">
                  Example: Take me to the accessible toilet
                </span>
              )}
            </span>
          </button>
        </section>

        {/* ══════════ 6. COMMON PLACES ══════════ */}
        <section className="home-places-section" aria-label="Common places">
          <h2 className="home-section__heading">Common places</h2>
          <div className="home-places__grid" role="list">
            {COMMON_PLACES.map(({ id, label, Icon, path }) => (
              <button
                key={id}
                className="home-place__card"
                onClick={() => navigate(path)}
                aria-label={label}
                role="listitem"
              >
                <span className="home-place__icon" aria-hidden="true"><Icon /></span>
                <span className="home-place__label">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ══════════ 7. HELP ══════════ */}
        <section className="home-help-section" aria-label="Get help from staff">
          <div className="home-help__text">
            <h2 className="home-help__heading">Need help?</h2>
            <p className="home-help__desc">Get assistance from station staff.</p>
          </div>
          <button
            className="home-help__btn"
            onClick={() => navigate('/voice')}
            aria-label="Ask for help from staff"
          >
            <IconHelp />
            Ask for Help
          </button>
        </section>

        {/* ══════════ 8. EMERGENCY ══════════ */}
        <section className="home-emergency-section" aria-label="Emergency help">
          <button
            className="home-emergency__btn"
            onClick={() => navigate('/emergency')}
            aria-label="Emergency help"
          >
            <IconEmergency />
            Emergency Help
          </button>
        </section>

        {/* Bottom spacing so content isn't hidden behind nav */}
        <div className="home-bottom-spacer" aria-hidden="true" />
      </div>

      {/* ══════════ 9. BOTTOM NAVIGATION ══════════ */}
      <BottomNav />
    </div>
  )
}

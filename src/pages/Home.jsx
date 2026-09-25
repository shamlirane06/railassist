import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import './Home.css'

/* ── Mock data ── */
const STATION = { name: 'Central Junction', code: 'CJN' }

const ADVISORY = {
  text: 'Elevator 2B operational  •  Battery car …',
}

const CURRENT_LOCATION = {
  fix: 'LIVE PRECISION FIX',
  platform: 'Platform 2',
  detail: 'Near Coach B4 & Escalator 2B  •  Central Junction (CJN)',
}

const FACILITIES = [
  {
    id: 1,
    label: 'Accessible Toilet & WC',
    sub: 'Platform 2  •  Step-f…',
    distance: '45m',
    icon: 'accessible',
    bgColor: '#f5f0f5',
    iconColor: '#7c3aed',
    badge: null,
  },
  {
    id: 2,
    label: 'Lift to Bridge',
    sub: 'Elevator 2B  •  Right …',
    distance: '20m',
    icon: 'lift',
    bgColor: '#eef4fb',
    iconColor: '#1a4b8c',
    badge: null,
  },
  {
    id: 3,
    label: 'Help & Porter Desk',
    sub: '',
    distance: '80m',
    icon: 'help',
    bgColor: '#fef3f2',
    iconColor: '#CC2027',
    badge: null,
  },
  {
    id: 4,
    label: 'Platforms 1 – 7',
    sub: '',
    distance: null,
    icon: 'platform',
    bgColor: '#eef4fb',
    iconColor: '#1a4b8c',
    badge: 'PF 1-7',
  },
]

/* ── Icon helpers ── */
function AccessibleIcon({ color }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="1.5" fill={color} stroke="none"/>
      <path d="M8 8h8l-1.5 5H9.5L8 8z"/>
      <path d="M9.5 13l-2 5"/>
      <path d="M14 13l1 3.5A4 4 0 1 1 10 19"/>
    </svg>
  )
}

function LiftIcon({ color }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <path d="M9 9l3-3 3 3"/>
      <path d="M9 15l3 3 3-3"/>
      <line x1="12" y1="6" x2="12" y2="18"/>
    </svg>
  )
}

function HelpDeskIcon({ color }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      <circle cx="19" cy="9" r="3" fill={color} fillOpacity=".15" stroke={color}/>
      <path d="M19 7v2M19 11h.01" strokeWidth="2.2"/>
    </svg>
  )
}

function PlatformIcon({ color }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="14" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="9" x2="9" y2="17"/>
      <path d="M6 21h12"/>
      <path d="M8 17l-2 4"/>
      <path d="M16 17l2 4"/>
    </svg>
  )
}

function FacilityIcon({ type, color }) {
  switch (type) {
    case 'accessible': return <AccessibleIcon color={color} />
    case 'lift':       return <LiftIcon color={color} />
    case 'help':       return <HelpDeskIcon color={color} />
    case 'platform':   return <PlatformIcon color={color} />
    default:           return null
  }
}

/* ═══════════════════════════════════════════
   HOME PAGE
════════════════════════════════════════════ */
export default function Home() {
  const [query, setQuery] = useState('')
  const [speakerOn, setSpeakerOn] = useState(false)

  return (
    <div className="home">
      {/* ── Top Header ── */}
      <header className="home__header">
        <div className="home__logo">
          <div className="home__logo-box">
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
              <rect width="32" height="32" rx="6" fill="#CC2027"/>
              <rect x="5" y="8" width="22" height="14" rx="3" stroke="#fff" strokeWidth="2" fill="none"/>
              <circle cx="9" cy="19" r="2.5" fill="#fff"/>
              <circle cx="23" cy="19" r="2.5" fill="#fff"/>
              <line x1="5" y1="15" x2="27" y2="15" stroke="#fff" strokeWidth="2"/>
              <line x1="16" y1="8" x2="16" y2="15" stroke="#fff" strokeWidth="2"/>
            </svg>
          </div>
          <div className="home__logo-text">
            <span className="home__logo-brand">RAILASSIST</span>
            <span className="home__logo-station">
              <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" style={{color:'var(--color-primary)', marginRight:2}}>
                <path d="M8 1a5 5 0 100 10A5 5 0 008 1zm0 1.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zM8 6a2 2 0 100 4A2 2 0 008 6z"/>
                <path d="M8 11v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {STATION.name} ({STATION.code})
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft:2}}>
                <path d="M4 6l4 4 4-4"/>
              </svg>
            </span>
          </div>
        </div>
        <div className="home__header-actions">
          <button className="home__icon-btn" aria-label="Accessibility settings">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="4" r="2"/>
              <path d="M5 9h14M9 9v12M15 9v12" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="home__icon-btn home__icon-btn--avatar" aria-label="Profile">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Station Advisory Card ── */}
      <div className="home__advisory">
        <div className="home__advisory-inner">
          <div className="home__advisory-left">
            <div className="home__advisory-icon-wrap">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M3 11l4-4 4 4 4-7 3 7"/>
                <path d="M3 19h18" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="home__advisory-title">STATION ADVISORY</p>
              <p className="home__advisory-text">{ADVISORY.text}</p>
            </div>
          </div>
          <button
            className={`home__advisory-speaker${speakerOn ? ' home__advisory-speaker--on' : ''}`}
            onClick={() => setSpeakerOn(s => !s)}
            aria-label="Toggle audio advisory"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              {speakerOn
                ? <><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/></>
                : <path d="M23 9l-6 6M17 9l6 6"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="home__body">

        {/* Current Location Card */}
        <div className="home__location-card">
          <div className="home__location-top">
            <span className="home__live-badge">
              <span className="home__live-dot" />
              {CURRENT_LOCATION.fix}
            </span>
            <button className="home__change-station">Change Station</button>
          </div>
          <div className="home__location-main">
            <div className="home__location-arrow">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
            <div>
              <h2 className="home__location-platform">{CURRENT_LOCATION.platform}</h2>
              <p className="home__location-detail">{CURRENT_LOCATION.detail}</p>
            </div>
          </div>
        </div>

        {/* Destination Search */}
        <div className="home__dest-section">
          <div className="home__dest-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Where do you need help going?</span>
          </div>

          <div className="home__search-wrap">
            <svg className="home__search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="home__search-input"
              type="text"
              placeholder="e.g. Platform 5, Washroom, Lift, Exi"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button className="home__search-clear" onClick={() => setQuery('')} aria-label="Clear">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </button>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="home__quick-actions">
            <button className="home__quick-btn">
              <div className="home__quick-icon home__quick-icon--navy">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>
              <span>Speak Goal</span>
            </button>

            <button className="home__quick-btn">
              <div className="home__quick-icon home__quick-icon--navy">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <circle cx="12" cy="10" r="3"/>
                  <path d="M7 18h10"/>
                </svg>
              </div>
              <span>Snap Sign</span>
            </button>

            <button className="home__quick-btn">
              <div className="home__quick-icon home__quick-icon--navy">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="3" y1="15" x2="21" y2="15"/>
                  <line x1="9" y1="9" x2="9" y2="21"/>
                </svg>
              </div>
              <span>Station Directory</span>
            </button>
          </div>
        </div>

        {/* Station Facilities */}
        <div className="home__facilities">
          <div className="home__facilities-header">
            <h3>Station Facilities</h3>
            <span className="home__vicinity-badge">P2 Vicinity</span>
          </div>

          <div className="home__facilities-grid">
            {FACILITIES.map(fac => (
              <button key={fac.id} className="home__facility-card">
                <div className="home__facility-top">
                  <div
                    className="home__facility-icon-wrap"
                    style={{ background: fac.bgColor }}
                  >
                    <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FacilityIcon type={fac.icon} color={fac.iconColor} />
                    </span>
                  </div>
                  <div className="home__facility-meta">
                    {fac.badge
                      ? <span className="home__facility-badge">{fac.badge}</span>
                      : fac.distance && <span className="home__facility-distance">{fac.distance}</span>
                    }
                  </div>
                </div>
                <p className="home__facility-label">{fac.label}</p>
                {fac.sub && <p className="home__facility-sub">{fac.sub}</p>}
              </button>
            ))}
          </div>
        </div>

        {/* Spacer for bottom nav */}
        <div style={{ height: 16 }} />
      </div>

      <BottomNav />
    </div>
  )
}

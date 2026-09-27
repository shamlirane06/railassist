import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { STATION_META, CURRENT_LOCATION, LOCATIONS, HELP_POINTS } from '../data/stationData'
import './HelpPoints.css'

// ── Help type options ──────────────────────────────────────────────────────
const HELP_TYPES = [
  { id: 'directions',  label: 'Directions',            desc: 'Help finding your way around the station' },
  { id: 'elderly',     label: 'Elderly Assistance',     desc: 'Support for elderly passengers' },
  { id: 'wheelchair',  label: 'Wheelchair Assistance',  desc: 'Accessible route and mobility help' },
  { id: 'lost-item',   label: 'Lost Item',              desc: 'Report or find a lost item' },
  { id: 'porter',      label: 'Porter / Luggage Help',  desc: 'Help carrying or moving luggage' },
  { id: 'other',       label: 'Other',                  desc: 'Any other assistance' },
]

// ── Location choices (from existing data) ──────────────────────────────────
const LOCATION_CHOICES = LOCATIONS.filter(l =>
  ['platform','entrance','facility','help','information'].includes(l.type) ||
  l.id === 'waiting-area' || l.id === 'ticket-counter'
).map(l => ({ id: l.id, label: l.name }))

// ── Flow steps ─────────────────────────────────────────────────────────────
const STEP_HOME     = 'home'
const STEP_TYPE     = 'type'
const STEP_LOCATION = 'location'
const STEP_SUMMARY  = 'summary'
const STEP_CONFIRM  = 'confirm'
const STEP_SENT     = 'sent'
const STEP_POINTS   = 'points'
const STEP_POINT_DETAIL = 'point-detail'

// ── SVG icons ──────────────────────────────────────────────────────────────
const IconBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconHelp = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
  </svg>
)
const IconLocation = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
)
const IconQR = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="17" y="17" width="4" height="4"/>
    <line x1="14" y1="14" x2="14" y2="17"/><line x1="14" y1="14" x2="17" y2="14"/>
  </svg>
)
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

// ══════════════════════════════════════════════════════════════════════════
export default function VoiceRequest() {
  const navigate = useNavigate()

  const [step, setStep]         = useState(STEP_HOME)
  const [helpType, setHelpType] = useState(null)
  const [locId, setLocId]       = useState(null)
  const [details, setDetails]   = useState('')
  const [status, setStatus]     = useState('sent')  // 'sent' | 'assigned'
  const [qrMsg, setQrMsg]       = useState(false)
  const [selectedHP, setHP]     = useState(null)     // help point detail

  // Active request tracking
  const [activeReq, setActiveReq] = useState(null) // { type, location, status }

  // ── Helpers ────────────────────────────────────────────────────────────
  const stationStr = `${STATION_META.name} (${STATION_META.code})`
  const typeLabel  = HELP_TYPES.find(t => t.id === helpType)?.label || ''
  const locLabel   = locId === 'current'
    ? CURRENT_LOCATION.label
    : LOCATIONS.find(l => l.id === locId)?.name || ''

  const statusLabels = {
    sent:     'Request Sent',
    assigned: 'Staff Assigned',
  }

  // ── Actions ────────────────────────────────────────────────────────────
  const selectType = useCallback((id) => {
    setHelpType(id)
    setStep(STEP_LOCATION)
  }, [])

  const selectLocation = useCallback((id) => {
    setLocId(id)
    setStep(STEP_SUMMARY)
  }, [])

  const goConfirm = useCallback(() => setStep(STEP_CONFIRM), [])

  const sendRequest = useCallback(() => {
    setStatus('sent')
    setStep(STEP_SENT)
    setActiveReq({ type: typeLabel, location: locLabel, status: 'sent' })

    // Simulate staff assignment after 3s
    setTimeout(() => {
      setStatus('assigned')
      setActiveReq(prev => prev ? { ...prev, status: 'assigned' } : null)
    }, 3000)
  }, [typeLabel, locLabel])

  const cancelRequest = useCallback(() => {
    setActiveReq(null)
    resetFlow()
  }, [])

  const resetFlow = useCallback(() => {
    setStep(STEP_HOME)
    setHelpType(null)
    setLocId(null)
    setDetails('')
    setStatus('sent')
    setHP(null)
  }, [])

  const openHelpPoints = useCallback(() => setStep(STEP_POINTS), [])

  const openHelpPoint = useCallback((hp) => {
    setHP(hp)
    setStep(STEP_POINT_DETAIL)
  }, [])

  const startFromHP = useCallback((hp) => {
    // Pre-set the location from the help point, then go to type selection
    setLocId(hp.locId)
    setStep(STEP_TYPE)
  }, [])

  const goBack = useCallback(() => {
    if (step === STEP_TYPE) setStep(STEP_HOME)
    else if (step === STEP_LOCATION) setStep(STEP_TYPE)
    else if (step === STEP_SUMMARY) setStep(STEP_LOCATION)
    else if (step === STEP_CONFIRM) setStep(STEP_SUMMARY)
    else if (step === STEP_POINTS) setStep(STEP_HOME)
    else if (step === STEP_POINT_DETAIL) setStep(STEP_POINTS)
    else setStep(STEP_HOME)
  }, [step])

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="help-page">

      {/* ── Header ── */}
      <div className="help-header">
        {step !== STEP_HOME && step !== STEP_SENT && (
          <button className="help-header-back" onClick={goBack} aria-label="Back">
            <IconBack />
          </button>
        )}
        <div className="help-header-text">
          <h1 className="help-header-title">
            {step === STEP_HOME   ? 'Need Help?' :
             step === STEP_TYPE   ? 'Ask for Help' :
             step === STEP_LOCATION ? 'Where Are You?' :
             step === STEP_SUMMARY  ? 'Help Request' :
             step === STEP_CONFIRM  ? 'Confirm Request' :
             step === STEP_SENT     ? 'Help Request Sent' :
             step === STEP_POINTS   ? 'Help Points' :
             step === STEP_POINT_DETAIL ? 'Help Point' :
             'Help'}
          </h1>
          {step === STEP_HOME && (
            <p className="help-header-sub">Get assistance from station staff.</p>
          )}
        </div>
      </div>

      <div className="help-body">

        {/* ═══════════════════════════════════════
            HOME — Main menu
        ═══════════════════════════════════════ */}
        {step === STEP_HOME && (
          <div className="help-home">

            {/* Active request card */}
            {activeReq && (
              <div className="help-active-card" role="status">
                <p className="help-active-heading">Active Help Request</p>
                <p className="help-active-type">{activeReq.type}</p>
                <p className="help-active-loc">{activeReq.location}</p>
                <div className="help-active-status-row">
                  <span className={`help-status-badge help-status--${activeReq.status}`}>
                    {statusLabels[activeReq.status]}
                  </span>
                </div>
                {activeReq.status === 'assigned' && (
                  <p className="help-active-note">Station staff are responding to your request.</p>
                )}
                <button className="help-active-cancel" onClick={cancelRequest}>
                  Cancel Request
                </button>
              </div>
            )}

            {/* Primary actions */}
            <button className="help-primary-btn" onClick={() => setStep(STEP_TYPE)}>
              <IconHelp />
              <span>Ask for Help</span>
            </button>

            <button className="help-secondary-btn" onClick={openHelpPoints}>
              <IconLocation />
              <span>Find a Help Point</span>
            </button>

            {/* QR section */}
            <div className="help-qr-section">
              <p className="help-qr-text">
                At a physical station Help Point, scan the QR code to quickly identify your location.
              </p>
              <button
                className="help-qr-btn"
                onClick={() => setQrMsg(true)}
              >
                <IconQR />
                <span>Scan Help Point QR</span>
              </button>
              {qrMsg && (
                <div className="help-qr-msg" role="status">
                  QR scanning will be available in the next version.
                  <button className="help-qr-dismiss" onClick={() => setQrMsg(false)}>OK</button>
                </div>
              )}
            </div>
          </div>
        )}


        {/* ═══════════════════════════════════════
            STEP — Select help type
        ═══════════════════════════════════════ */}
        {step === STEP_TYPE && (
          <div className="help-type-list">
            <p className="help-step-label">What do you need help with?</p>
            {HELP_TYPES.map(t => (
              <button
                key={t.id}
                className="help-type-btn"
                onClick={() => selectType(t.id)}
              >
                <span className="help-type-name">{t.label}</span>
                <span className="help-type-desc">{t.desc}</span>
              </button>
            ))}
          </div>
        )}


        {/* ═══════════════════════════════════════
            STEP — Select location
        ═══════════════════════════════════════ */}
        {step === STEP_LOCATION && (
          <div className="help-loc-list">
            <p className="help-step-label">Where are you?</p>

            <button
              className="help-loc-btn help-loc-btn--current"
              onClick={() => selectLocation('current')}
            >
              <span className="help-loc-dot" />
              <div>
                <span className="help-loc-name">Use Current Location</span>
                <span className="help-loc-sub">{CURRENT_LOCATION.label}</span>
              </div>
            </button>

            {LOCATION_CHOICES.map(loc => (
              <button
                key={loc.id}
                className={`help-loc-btn ${locId === loc.id ? 'help-loc-btn--selected' : ''}`}
                onClick={() => selectLocation(loc.id)}
              >
                <span className="help-loc-name">{loc.label}</span>
              </button>
            ))}
          </div>
        )}


        {/* ═══════════════════════════════════════
            STEP — Summary
        ═══════════════════════════════════════ */}
        {step === STEP_SUMMARY && (
          <div className="help-summary">
            <div className="help-summary-card">
              <div className="help-summary-row">
                <span className="help-summary-label">Help Needed</span>
                <span className="help-summary-value">{typeLabel}</span>
              </div>
              <div className="help-summary-row">
                <span className="help-summary-label">Location</span>
                <span className="help-summary-value">{locLabel}</span>
              </div>
              <div className="help-summary-row">
                <span className="help-summary-label">Station</span>
                <span className="help-summary-value">{stationStr}</span>
              </div>
            </div>

            <div className="help-section">
              <p className="help-section-title">Additional details</p>
              <textarea
                className="help-textarea"
                rows="3"
                maxLength={400}
                placeholder="Tell staff anything they should know..."
                value={details}
                onChange={e => setDetails(e.target.value)}
                aria-label="Additional details"
              />
            </div>

            <button className="help-btn-primary" onClick={goConfirm}>
              Request Assistance
            </button>
            <button className="help-btn-secondary" onClick={resetFlow}>
              Cancel
            </button>
          </div>
        )}


        {/* ═══════════════════════════════════════
            STEP — Confirm
        ═══════════════════════════════════════ */}
        {step === STEP_CONFIRM && (
          <div className="help-confirm">
            <h2 className="help-confirm-title">Send Help Request?</h2>
            <div className="help-summary-card">
              <div className="help-summary-row">
                <span className="help-summary-label">Help Needed</span>
                <span className="help-summary-value">{typeLabel}</span>
              </div>
              <div className="help-summary-row">
                <span className="help-summary-label">Location</span>
                <span className="help-summary-value">{locLabel}</span>
              </div>
              <div className="help-summary-row">
                <span className="help-summary-label">Station</span>
                <span className="help-summary-value">{stationStr}</span>
              </div>
              {details.trim() && (
                <div className="help-summary-row">
                  <span className="help-summary-label">Details</span>
                  <span className="help-summary-value">{details}</span>
                </div>
              )}
            </div>
            <button className="help-btn-primary" onClick={sendRequest}>
              Send Request
            </button>
            <button className="help-btn-secondary" onClick={() => setStep(STEP_SUMMARY)}>
              Cancel
            </button>
          </div>
        )}


        {/* ═══════════════════════════════════════
            STEP — Sent / success
        ═══════════════════════════════════════ */}
        {step === STEP_SENT && (
          <div className="help-sent">
            <div className="help-sent-check"><IconCheck /></div>
            <h2 className="help-sent-title">Help Request Sent</h2>
            <p className="help-sent-sub">
              Your request has been shared with station assistance staff.
            </p>

            <div className={`help-status-badge help-status--${status}`}>
              {statusLabels[status]}
            </div>

            <div className="help-summary-card">
              <div className="help-summary-row">
                <span className="help-summary-label">Request Type</span>
                <span className="help-summary-value">{typeLabel}</span>
              </div>
              <div className="help-summary-row">
                <span className="help-summary-label">Location</span>
                <span className="help-summary-value">{locLabel}</span>
              </div>
              <div className="help-summary-row">
                <span className="help-summary-label">Status</span>
                <span className={`help-summary-value help-val--${status}`}>
                  {statusLabels[status]}
                </span>
              </div>
            </div>

            {status === 'assigned' && (
              <p className="help-staff-note">
                Station staff are responding to your request.
              </p>
            )}

            <p className="help-proto-note">
              This is a prototype simulation. No real staff have been contacted.
            </p>

            <button className="help-btn-primary" onClick={() => navigate('/')}>
              Back to Home
            </button>
            <button className="help-btn-secondary" onClick={resetFlow}>
              New Request
            </button>
          </div>
        )}


        {/* ═══════════════════════════════════════
            Help Points list
        ═══════════════════════════════════════ */}
        {step === STEP_POINTS && (
          <div className="help-points-list">
            <p className="help-step-label">Station help points</p>
            {HELP_POINTS.map(hp => (
              <button
                key={hp.id}
                className="help-point-btn"
                onClick={() => openHelpPoint(hp)}
              >
                <div className="help-point-info">
                  <span className="help-point-name">{hp.name}</span>
                  <span className="help-point-loc">
                    {LOCATIONS.find(location => location.id === hp.locId)?.name}
                  </span>
                </div>
                <span className="help-point-arrow">›</span>
              </button>
            ))}
          </div>
        )}


        {/* ═══════════════════════════════════════
            Help Point detail
        ═══════════════════════════════════════ */}
        {step === STEP_POINT_DETAIL && selectedHP && (
          <div className="help-point-detail">
            <h2 className="help-detail-name">{selectedHP.name}</h2>
            <div className="help-summary-card">
              <div className="help-summary-row">
                <span className="help-summary-label">Location</span>
                <span className="help-summary-value">{selectedHP.location}</span>
              </div>
              <div className="help-summary-row">
                <span className="help-summary-label">Station</span>
                <span className="help-summary-value">{stationStr}</span>
              </div>
            </div>
            <button className="help-btn-primary" onClick={() => startFromHP(selectedHP)}>
              Ask for Help
            </button>
            <button className="help-btn-secondary" onClick={() => navigate('/map')}>
              View on Map
            </button>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}

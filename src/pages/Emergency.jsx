import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { STATION_META, CURRENT_LOCATION } from '../data/stationData'
import './Emergency.css'

// ── Emergency type options ─────────────────────────────────────────────────
const EMERGENCY_TYPES = [
  {
    id: 'medical',
    label: 'Medical Emergency',
    desc: 'Injury, illness, or someone has collapsed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 2v20M2 12h20"/>
        <rect x="4" y="4" width="16" height="16" rx="2"/>
      </svg>
    ),
  },
  {
    id: 'lost',
    label: 'Lost / Confused',
    desc: 'Cannot find your way or platform',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
      </svg>
    ),
  },
  {
    id: 'unsafe',
    label: 'Unsafe Situation',
    desc: 'Suspicious activity or feeling unsafe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'someone',
    label: 'Someone Needs Help',
    desc: 'Another person needs assistance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    id: 'other',
    label: 'Other',
    desc: 'Any other assistance needed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
]

// ── Flow steps ─────────────────────────────────────────────────────────────
const STEP_SELECT   = 'select'
const STEP_DETAILS  = 'details'
const STEP_CONFIRM  = 'confirm'
const STEP_SENT     = 'sent'

// ══════════════════════════════════════════════════════════════════════════
export default function Emergency() {
  const navigate = useNavigate()
  const [step, setStep]           = useState(STEP_SELECT)
  const [type, setType]           = useState(null)
  const [description, setDesc]    = useState('')
  const [photo, setPhoto]         = useState(null)     // File object
  const [photoPreview, setPreview]= useState(null)     // data URL
  const [staffStatus, setStaff]   = useState('sent')   // 'sent' | 'responding' | 'arriving'
  const fileRef = useRef(null)

  // ── Photo handlers ───────────────────────────────────────────────────────
  const handlePhoto = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }, [])

  const removePhoto = useCallback(() => {
    setPhoto(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }, [])

  // ── Send request (simulated) ─────────────────────────────────────────────
  const sendRequest = useCallback(() => {
    setStep(STEP_SENT)
    setStaff('sent')

    // Simulate staff acknowledgement
    const t1 = setTimeout(() => setStaff('responding'), 3000)
    const t2 = setTimeout(() => setStaff('arriving'), 7000)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    // no-op; timeouts run in sendRequest's scope
  }, [])

  // ── Reset flow ───────────────────────────────────────────────────────────
  const resetFlow = useCallback(() => {
    setStep(STEP_SELECT)
    setType(null)
    setDesc('')
    removePhoto()
    setStaff('sent')
  }, [removePhoto])

  // ── Derived ──────────────────────────────────────────────────────────────
  const typeInfo   = EMERGENCY_TYPES.find(t => t.id === type)
  const shortLoc   = 'Platform 2'   // derived from CURRENT_LOCATION
  const stationStr = `${STATION_META.name} (${STATION_META.code})`

  // ── Status badge helpers ─────────────────────────────────────────────────
  const statusLabel = {
    sent:       'Help Requested',
    responding: 'Staff Responding',
    arriving:   'Help is On the Way',
  }
  const statusClass = {
    sent:       'sos-status--sent',
    responding: 'sos-status--responding',
    arriving:   'sos-status--arriving',
  }

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="sos-page">

      {/* ── Header ── */}
      <div className="sos-header">
        <h1 className="sos-header-title">Emergency Help</h1>
        {step === STEP_SELECT && (
          <p className="sos-header-sub">Tell us what kind of help you need.</p>
        )}
      </div>

      <div className="sos-body">

        {/* ═══════════════════════════════════════════
            STEP 1 — Select emergency type
        ═══════════════════════════════════════════ */}
        {step === STEP_SELECT && (
          <div className="sos-types">
            {EMERGENCY_TYPES.map(t => (
              <button
                key={t.id}
                className="sos-type-btn"
                onClick={() => { setType(t.id); setStep(STEP_DETAILS) }}
                aria-label={t.label}
              >
                <span className="sos-type-icon">{t.icon}</span>
                <div className="sos-type-text">
                  <span className="sos-type-label">{t.label}</span>
                  <span className="sos-type-desc">{t.desc}</span>
                </div>
              </button>
            ))}
          </div>
        )}


        {/* ═══════════════════════════════════════════
            STEP 2 — Details (location, photo, description)
        ═══════════════════════════════════════════ */}
        {step === STEP_DETAILS && typeInfo && (
          <div className="sos-details">

            {/* Selected type */}
            <div className="sos-selected-type">
              <span className="sos-selected-icon">{typeInfo.icon}</span>
              <h2 className="sos-selected-label">{typeInfo.label}</h2>
            </div>

            <p className="sos-detail-hint">
              Share your current location so station staff can find you.
            </p>

            {/* Location card */}
            <div className="sos-location-card">
              <p className="sos-loc-station">{stationStr}</p>
              <div className="sos-loc-row">
                <span className="sos-loc-dot" />
                <div>
                  <p className="sos-loc-label">Current Location</p>
                  <p className="sos-loc-value">{shortLoc}</p>
                </div>
              </div>
            </div>

            {/* Photo (optional) */}
            <div className="sos-section">
              <p className="sos-section-title">Add a photo</p>
              <p className="sos-section-hint">Photo is optional</p>
              {photoPreview ? (
                <div className="sos-photo-preview">
                  <img src={photoPreview} alt="Attached" className="sos-photo-img" />
                  <button className="sos-photo-remove" onClick={removePhoto} aria-label="Remove photo">
                    Remove
                  </button>
                </div>
              ) : (
                <button className="sos-photo-btn" onClick={() => fileRef.current?.click()}>
                  Take / Upload Photo
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sos-file-input"
                onChange={handlePhoto}
                aria-label="Select photo"
              />
            </div>

            {/* Description (optional) */}
            <div className="sos-section">
              <p className="sos-section-title">Describe what happened</p>
              <textarea
                className="sos-textarea"
                rows="3"
                maxLength={500}
                placeholder="Tell station staff what you need help with..."
                value={description}
                onChange={e => setDesc(e.target.value)}
                aria-label="Describe the situation"
              />
            </div>

            {/* Action buttons */}
            <div className="sos-actions">
              <button className="sos-btn-primary" onClick={() => setStep(STEP_CONFIRM)}>
                Send Help Request
              </button>
              <button className="sos-btn-secondary" onClick={resetFlow}>
                Cancel
              </button>
            </div>
          </div>
        )}


        {/* ═══════════════════════════════════════════
            STEP 3 — Confirm before sending
        ═══════════════════════════════════════════ */}
        {step === STEP_CONFIRM && typeInfo && (
          <div className="sos-confirm">
            <div className="sos-confirm-box">
              <h2 className="sos-confirm-title">
                Are you sure you want to send this help request?
              </h2>

              <div className="sos-confirm-summary">
                <div className="sos-confirm-row">
                  <span className="sos-confirm-label">Emergency Type</span>
                  <span className="sos-confirm-value">{typeInfo.label}</span>
                </div>
                <div className="sos-confirm-row">
                  <span className="sos-confirm-label">Location</span>
                  <span className="sos-confirm-value">{shortLoc}</span>
                </div>
                <div className="sos-confirm-row">
                  <span className="sos-confirm-label">Station</span>
                  <span className="sos-confirm-value">{stationStr}</span>
                </div>
                {description.trim() && (
                  <div className="sos-confirm-row">
                    <span className="sos-confirm-label">Description</span>
                    <span className="sos-confirm-value">{description}</span>
                  </div>
                )}
                {photo && (
                  <div className="sos-confirm-row">
                    <span className="sos-confirm-label">Photo</span>
                    <span className="sos-confirm-value">1 photo attached</span>
                  </div>
                )}
              </div>

              <div className="sos-actions">
                <button className="sos-btn-primary sos-btn-primary--confirm" onClick={sendRequest}>
                  Send Request
                </button>
                <button className="sos-btn-secondary" onClick={() => setStep(STEP_DETAILS)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ═══════════════════════════════════════════
            STEP 4 — Help request sent
        ═══════════════════════════════════════════ */}
        {step === STEP_SENT && typeInfo && (
          <div className="sos-sent">

            {/* Checkmark */}
            <div className="sos-sent-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 className="sos-sent-title">Help Request Sent</h2>
            <p className="sos-sent-sub">Station staff have been notified.</p>

            {/* Status badge */}
            <div className={`sos-status-badge ${statusClass[staffStatus]}`}>
              {statusLabel[staffStatus]}
            </div>

            {/* Summary */}
            <div className="sos-sent-summary">
              <div className="sos-confirm-row">
                <span className="sos-confirm-label">Emergency Type</span>
                <span className="sos-confirm-value">{typeInfo.label}</span>
              </div>
              <div className="sos-confirm-row">
                <span className="sos-confirm-label">Location</span>
                <span className="sos-confirm-value">{shortLoc}</span>
              </div>
              <div className="sos-confirm-row">
                <span className="sos-confirm-label">Station</span>
                <span className="sos-confirm-value">{stationStr}</span>
              </div>
              <div className="sos-confirm-row">
                <span className="sos-confirm-label">Status</span>
                <span className={`sos-confirm-value sos-confirm-value--status ${statusClass[staffStatus]}`}>
                  {statusLabel[staffStatus]}
                </span>
              </div>
            </div>

            {staffStatus === 'arriving' && (
              <p className="sos-staff-note">
                Your location has been shared with station staff.
              </p>
            )}

            <p className="sos-proto-note">
              This is a prototype simulation. No real emergency services have been contacted.
            </p>

            <div className="sos-actions">
              <button className="sos-btn-primary" onClick={() => navigate('/')}>
                Back to Home
              </button>
              <button className="sos-btn-secondary" onClick={resetFlow}>
                New Request
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

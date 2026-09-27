import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import ScreenHeader from '../components/ScreenHeader'
import ListRow from '../components/ListRow'
import SummaryList from '../components/SummaryList'
import Icon from '../components/Icon'
import { STATION_META, CURRENT_LOCATION } from '../data/stationData'
import './Emergency.css'

const EMERGENCY_TYPES = [
  { id: 'medical', label: 'Medical emergency', desc: 'Injury, illness or someone has collapsed', icon: 'medical' },
  { id: 'unsafe', label: 'Unsafe situation', desc: 'Suspicious activity or feeling unsafe', icon: 'alert' },
  { id: 'someone', label: 'Someone needs help', desc: 'Another person needs assistance', icon: 'users' },
  { id: 'lost', label: 'Lost or confused', desc: 'Cannot find your way or platform', icon: 'compass' },
  { id: 'other', label: 'Other', desc: 'Any other urgent assistance', icon: 'more' },
]

const TITLES = {
  select: 'Emergency help',
  details: 'Add details',
  confirm: 'Confirm request',
  sent: 'Demo complete',
}

const BACK_STEP = { details: 'select', confirm: 'details' }

function CallCard() {
  return (
    <div className="sos-call">
      <div className="card-head">
        <span className="tile-icon tile-icon--danger" aria-hidden="true"><Icon name="phone" size={22} /></span>
        <div>
          <p className="card__title">In immediate danger?</p>
          <p className="card__text">Call emergency services now.</p>
        </div>
      </div>
      <div className="actions actions--row sos-call__actions">
        <a className="btn btn--danger btn--sm" href="tel:112">Call 112</a>
        <a className="btn btn--secondary btn--sm" href="tel:139">Rail 139</a>
      </div>
    </div>
  )
}

function LocationCard() {
  return (
    <div className="sos-location">
      <span className="sos-location__dot" aria-hidden="true" />
      <div className="list-row__body">
        <span className="sos-location__label">Your location</span>
        <span className="list-row__title">{CURRENT_LOCATION.label}</span>
        <span className="sos-location__station">{STATION_META.name} ({STATION_META.code})</span>
      </div>
    </div>
  )
}

export default function Emergency() {
  const navigate = useNavigate()
  const [step, setStep] = useState('select')
  const [typeId, setTypeId] = useState(null)
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url) }, [photo])

  const typeInfo = EMERGENCY_TYPES.find(t => t.id === typeId)
  const stationStr = `${STATION_META.name} (${STATION_META.code})`

  const handlePhoto = event => {
    const file = event.target.files?.[0]
    if (file) setPhoto({ name: file.name, url: URL.createObjectURL(file) })
  }

  const removePhoto = () => {
    setPhoto(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const resetFlow = () => {
    setStep('select')
    setTypeId(null)
    setDescription('')
    removePhoto()
  }

  const selectType = id => { setTypeId(id); setStep('details') }

  const summaryItems = [
    { label: 'Emergency', value: typeInfo?.label },
    { label: 'Location', value: CURRENT_LOCATION.label },
    { label: 'Station', value: stationStr },
  ]

  return (
    <div className="screen">
      <ScreenHeader
        title={TITLES[step]}
        subtitle={step === 'select' ? 'Tell us what is happening.' : undefined}
        onBack={BACK_STEP[step] ? () => setStep(BACK_STEP[step]) : undefined}
      />

      <main className="screen__body">
        {step === 'select' && (
          <>
            <CallCard />
            <section className="section" aria-labelledby="sos-types">
              <h2 id="sos-types" className="section__title" style={{ marginBottom: 12 }}>Choose an emergency type</h2>
              <div className="list-group">
                {EMERGENCY_TYPES.map(type => (
                  <ListRow
                    key={type.id}
                    icon={type.icon}
                    tone="danger"
                    title={type.label}
                    description={type.desc}
                    onClick={() => selectType(type.id)}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {step === 'details' && typeInfo && (
          <>
            <div className="card sos-selected">
              <span className="tile-icon tile-icon--danger" aria-hidden="true"><Icon name={typeInfo.icon} size={22} /></span>
              <div className="list-row__body">
                <span className="sos-location__label">Emergency type</span>
                <span className="card__title">{typeInfo.label}</span>
              </div>
              <button type="button" className="text-link" onClick={() => setStep('select')}>Change</button>
            </div>

            <div className="section">
              <LocationCard />
            </div>

            <div className="section">
              <p className="field-label">Photo <span className="field-label__hint">(optional)</span></p>
              {photo ? (
                <div className="sos-photo">
                  <img src={photo.url} alt="Attached to your emergency request" className="sos-photo__img" />
                  <button type="button" className="btn btn--secondary btn--sm" onClick={removePhoto}>
                    <Icon name="close" size={18} /> Remove photo
                  </button>
                </div>
              ) : (
                <button type="button" className="sos-upload" onClick={() => fileRef.current?.click()}>
                  <Icon name="camera" size={22} />
                  <span>Take or upload a photo</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                tabIndex={-1}
                onChange={handlePhoto}
                aria-label="Select photo"
              />
            </div>

            <div className="section">
              <label htmlFor="sos-desc" className="field-label">
                What is happening? <span className="field-label__hint">(optional)</span>
              </label>
              <textarea
                id="sos-desc"
                className="textarea"
                rows="3"
                maxLength={500}
                placeholder="Add any details that can help staff..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <p className="sos-count">{description.length}/500</p>
            </div>

            <div className="actions">
              <button type="button" className="btn btn--danger btn--block" onClick={() => setStep('confirm')}>
                <Icon name="siren" size={20} /> Continue
              </button>
              <button type="button" className="btn btn--secondary btn--block" onClick={resetFlow}>Cancel</button>
            </div>
          </>
        )}

        {step === 'confirm' && typeInfo && (
          <>
            <p className="section__hint">Prototype only: this will not notify station staff or emergency services.</p>
            <SummaryList
              items={[
                ...summaryItems,
                description.trim() && { label: 'Details', value: description },
                photo && { label: 'Photo', value: '1 photo attached' },
              ]}
            />
            <div className="actions">
              <button type="button" className="btn btn--danger btn--block" onClick={() => setStep('sent')}>
                <Icon name="siren" size={20} /> Record demo request
              </button>
              <button type="button" className="btn btn--secondary btn--block" onClick={() => setStep('details')}>Go back</button>
            </div>
          </>
        )}

        {step === 'sent' && typeInfo && (
          <>
            <div className="status-hero" role="status">
              <span className="status-hero__icon" aria-hidden="true"><Icon name="check" size={32} strokeWidth={2.6} /></span>
              <p className="status-hero__title">Prototype request recorded</p>
              <p className="status-hero__text">No station staff or emergency services were contacted.</p>
            </div>
            <div className="section">
              <SummaryList items={[...summaryItems, { label: 'Status', value: 'Demo only', tone: 'success' }]} />
            </div>
            <p className="proto-note">This prototype does not contact emergency services or station staff.</p>
            <div className="actions">
              <button type="button" className="btn btn--dark btn--block" onClick={() => navigate('/')}>Back to Home</button>
              <button type="button" className="btn btn--secondary btn--block" onClick={resetFlow}>New request</button>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

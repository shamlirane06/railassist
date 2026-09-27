import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import ScreenHeader from '../components/ScreenHeader'
import ListRow from '../components/ListRow'
import SummaryList from '../components/SummaryList'
import Icon from '../components/Icon'
import { STATION_META, CURRENT_LOCATION, LOCATIONS, HELP_POINTS } from '../data/stationData'
import './VoiceRequest.css'

const HELP_TYPES = [
  { id: 'directions', label: 'Directions', desc: 'Help finding your way around the station', icon: 'directions', tone: 'blue' },
  { id: 'elderly', label: 'Elderly Assistance', desc: 'Support for elderly passengers', icon: 'elderly', tone: 'green' },
  { id: 'wheelchair', label: 'Wheelchair Assistance', desc: 'Accessible route and mobility help', icon: 'accessibility', tone: 'blue' },
  { id: 'lost-item', label: 'Lost Item', desc: 'Report or find a lost item', icon: 'package', tone: 'neutral' },
  { id: 'porter', label: 'Porter / Luggage Help', desc: 'Help carrying or moving luggage', icon: 'luggage', tone: 'neutral' },
  { id: 'other', label: 'Other', desc: 'Any other assistance', icon: 'more', tone: 'neutral' },
]

const LOCATION_CHOICES = LOCATIONS.filter(l =>
  ['platform', 'entrance', 'facility', 'help', 'information'].includes(l.type) ||
  l.id === 'waiting-area' || l.id === 'ticket-counter',
)

const TITLES = {
  home: 'Need help?',
  type: 'Ask for help',
  location: 'Where are you?',
  summary: 'Help request',
  confirm: 'Confirm request',
  sent: 'Request sent',
  points: 'Help points',
  'point-detail': 'Help point',
}

const BACK_STEP = { type: 'home', location: 'type', summary: 'location', confirm: 'summary', points: 'home', 'point-detail': 'points' }

const formatHelpPointName = name => name.replace(/(\d+)$/, number => number.padStart(2, '0'))
const locationName = id => LOCATIONS.find(location => location.id === id)?.name

function TypeList({ onSelect }) {
  return (
    <div className="list-group">
      {HELP_TYPES.map(type => (
        <ListRow key={type.id} icon={type.icon} tone={type.tone} title={type.label} description={type.desc} onClick={() => onSelect(type.id)} />
      ))}
    </div>
  )
}

export default function VoiceRequest() {
  const navigate = useNavigate()
  const [step, setStep] = useState('home')
  const [helpType, setHelpType] = useState(null)
  const [locId, setLocId] = useState(null)
  const [details, setDetails] = useState('')
  const [qrMsg, setQrMsg] = useState(false)
  const [selectedHP, setHP] = useState(null)
  const [activeReq, setActiveReq] = useState(null)

  const stationStr = `${STATION_META.name} (${STATION_META.code})`
  const typeLabel = HELP_TYPES.find(t => t.id === helpType)?.label || ''
  const locLabel = locId === 'current' ? CURRENT_LOCATION.label : locationName(locId) || ''

  const requestItems = [
    { label: 'Help needed', value: typeLabel },
    { label: 'Location', value: locLabel },
    { label: 'Station', value: stationStr },
  ]

  const selectType = id => { setHelpType(id); setStep('location') }
  const selectLocation = id => { setLocId(id); setStep('summary') }

  const resetFlow = () => {
    setStep('home')
    setHelpType(null)
    setLocId(null)
    setDetails('')
    setHP(null)
  }

  const sendRequest = () => {
    setActiveReq({ type: typeLabel, location: locLabel })
    setStep('sent')
  }

  const cancelRequest = () => { setActiveReq(null); resetFlow() }

  return (
    <div className="screen">
      <ScreenHeader
        title={TITLES[step]}
        subtitle={step === 'home' ? 'How can we assist you?' : undefined}
        onBack={BACK_STEP[step] ? () => setStep(BACK_STEP[step]) : undefined}
      />

      <main className="screen__body">
        {step === 'home' && (
          <>
            {activeReq && (
              <div className="card help-active" role="status">
                <div className="card-head">
                  <span className="tile-icon tile-icon--green" aria-hidden="true"><Icon name="check" size={22} /></span>
                  <div>
                    <p className="help-active__eyebrow">Active help request</p>
                    <p className="card__title">{activeReq.type}</p>
                  </div>
                </div>
                <p className="help-active__loc"><Icon name="pin" size={16} /> {activeReq.location}</p>
                <span className="badge badge--success"><span className="badge__dot" aria-hidden="true" /> Assistance requested</span>
                <p className="help-note">Prototype request recorded. No real staff have been contacted.</p>
                <button type="button" className="btn btn--secondary btn--sm btn--block" onClick={cancelRequest}>Cancel request</button>
              </div>
            )}

            <section className={activeReq ? 'section' : undefined} aria-labelledby="help-types">
              <h2 id="help-types" className="section__title" style={{ marginBottom: 12 }}>What do you need help with?</h2>
              <TypeList onSelect={selectType} />
            </section>

            <section className="section" aria-label="Help points">
              <div className="list-group">
                <ListRow icon="pin" tone="green" title="Find a Help Point" description={`${HELP_POINTS.length} points across the station`} onClick={() => setStep('points')} />
                <ListRow icon="qr" tone="neutral" title="Scan Help Point QR" description="Identify your location instantly" onClick={() => setQrMsg(true)} />
              </div>
              {qrMsg && (
                <div className="notice notice--info" role="status" style={{ marginTop: 12 }}>
                  <Icon name="info" size={20} />
                  <p className="notice__body">QR scanning will be available in the next version.</p>
                  <button type="button" className="notice__close" onClick={() => setQrMsg(false)} aria-label="Dismiss">
                    <Icon name="close" size={18} />
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {step === 'type' && (
          <>
            <p className="section__hint">Choose the kind of assistance you need.</p>
            <TypeList onSelect={selectType} />
          </>
        )}

        {step === 'location' && (
          <>
            <button type="button" className="help-current" onClick={() => selectLocation('current')}>
              <span className="help-current__dot" aria-hidden="true" />
              <span className="list-row__body">
                <span className="list-row__title">Use current location</span>
                <span className="help-current__sub">{CURRENT_LOCATION.label}</span>
              </span>
              <Icon name="chevronRight" size={20} />
            </button>
            <h2 className="section__title section" style={{ marginBottom: 12 }}>Or choose a place</h2>
            <div className="list-group">
              {LOCATION_CHOICES.map(loc => (
                <ListRow key={loc.id} icon="pin" tone={locId === loc.id ? 'red' : 'neutral'} title={loc.name} onClick={() => selectLocation(loc.id)} />
              ))}
            </div>
          </>
        )}

        {step === 'summary' && (
          <>
            <SummaryList items={requestItems} />
            <div className="section">
              <label htmlFor="help-details" className="section__title">Additional details</label>
              <textarea
                id="help-details"
                className="textarea"
                rows="4"
                maxLength={400}
                placeholder="Tell staff anything they should know..."
                value={details}
                onChange={e => setDetails(e.target.value)}
              />
              <p className="help-count">{details.length}/400</p>
            </div>
            <div className="actions actions--row">
              <button type="button" className="btn btn--secondary" onClick={resetFlow}>Cancel</button>
              <button type="button" className="btn btn--dark" onClick={() => setStep('confirm')}>Next</button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <p className="section__hint">Please review your request before sending it to station staff.</p>
            <SummaryList items={[...requestItems, details.trim() && { label: 'Details', value: details }]} />
            <div className="actions">
              <button type="button" className="btn btn--dark btn--block" onClick={sendRequest}>
                <Icon name="check" size={20} /> Send request
              </button>
              <button type="button" className="btn btn--secondary btn--block" onClick={() => setStep('summary')}>Cancel</button>
            </div>
          </>
        )}

        {step === 'sent' && (
          <>
            <div className="status-hero">
              <span className="status-hero__icon" aria-hidden="true"><Icon name="check" size={32} strokeWidth={2.6} /></span>
              <p className="status-hero__title">Help request sent</p>
              <p className="status-hero__text">Your request has been recorded.</p>
            </div>
            <SummaryList
              items={[
                { label: 'Request type', value: typeLabel },
                { label: 'Location', value: locLabel },
                { label: 'Status', value: 'Assistance requested', tone: 'success' },
              ]}
            />
            <p className="help-note">This is a prototype simulation. No real staff have been contacted.</p>
            <div className="actions">
              <button type="button" className="btn btn--dark btn--block" onClick={() => navigate('/')}>Back to Home</button>
              <button type="button" className="btn btn--secondary btn--block" onClick={resetFlow}>New request</button>
            </div>
          </>
        )}

        {step === 'points' && (
          <>
            <p className="section__hint">Help Points are staffed intercoms placed around {STATION_META.name}.</p>
            <div className="list-group">
              {HELP_POINTS.map(hp => (
                <ListRow
                  key={hp.id}
                  icon="help"
                  tone="green"
                  title={formatHelpPointName(hp.name)}
                  description={locationName(hp.locId)}
                  onClick={() => { setHP(hp); setStep('point-detail') }}
                />
              ))}
            </div>
          </>
        )}

        {step === 'point-detail' && selectedHP && (
          <>
            <div className="status-hero">
              <span className="status-hero__icon status-hero__icon--muted" aria-hidden="true"><Icon name="help" size={30} /></span>
              <p className="status-hero__title">{formatHelpPointName(selectedHP.name)}</p>
            </div>
            <SummaryList
              items={[
                { label: 'Location', value: locationName(selectedHP.locId) },
                { label: 'Station', value: stationStr },
              ]}
            />
            <div className="actions">
              <button type="button" className="btn btn--dark btn--block" onClick={() => { setLocId(selectedHP.locId); setStep('type') }}>
                <Icon name="help" size={20} /> Ask for help
              </button>
              <button type="button" className="btn btn--secondary btn--block" onClick={() => navigate('/map', { state: { destinationId: selectedHP.locId } })}>
                <Icon name="map" size={20} /> View on map
              </button>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

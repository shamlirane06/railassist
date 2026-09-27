import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import ScreenHeader from '../components/ScreenHeader'
import ListRow from '../components/ListRow'
import DestinationRow from '../components/DestinationRow'
import Toggle from '../components/Toggle'
import Icon from '../components/Icon'
import { useAccessibilitySettings } from '../context/AccessibilitySettings'
import { STATION_META, CURRENT_LOCATION, LOCATIONS } from '../data/stationData'
import './Accessibility.css'

const CATEGORIES = [
  { id: 'wheelchair', label: 'Wheelchair access', desc: 'Lifts, accessible toilets and step-free areas', icon: 'accessibility', tone: 'blue' },
  { id: 'elderly', label: 'Elderly assistance', desc: 'Simple directions and nearby help', icon: 'elderly', tone: 'green' },
  { id: 'visual', label: 'Visual assistance', desc: 'Larger text, contrast and voice guidance', icon: 'eye', tone: 'navy' },
  { id: 'hearing', label: 'Hearing assistance', desc: 'Clear visual instructions and alerts', icon: 'ear', tone: 'neutral' },
]

const ACCESSIBLE_FACILITIES = LOCATIONS.filter(
  l => l.accessible && ['elevator', 'toilet-accessible', 'help', 'entrance'].includes(l.type),
)

const ELDERLY_OPTIONS = [
  { label: 'Find a platform', icon: 'train', tone: 'red', query: 'Platform' },
  { label: 'Find a toilet', icon: 'toilet', tone: 'blue', query: 'Toilet' },
  { label: 'Find a lift', icon: 'lift', tone: 'green', query: 'Lift' },
  { label: 'Find an exit', icon: 'exit', tone: 'navy', query: 'Exit' },
  { label: 'Ask staff for help', icon: 'help', tone: 'green', path: '/voice' },
]

const DETAIL_TITLES = {
  wheelchair: 'Wheelchair access',
  elderly: 'Elderly assistance',
  visual: 'Visual assistance',
  hearing: 'Hearing assistance',
  settings: 'Display settings',
}

function DisplaySettings() {
  const { largeText, setLargeText, highContrast, setHighContrast, voiceGuidance, setVoiceGuidance } = useAccessibilitySettings()
  return (
    <div className="list-group">
      <Toggle icon="text" label="Large text" description="Make all text bigger" checked={largeText} onChange={setLargeText} />
      <Toggle icon="contrast" label="High contrast" description="Bolder colours and clearer text" checked={highContrast} onChange={setHighContrast} />
      <Toggle icon="volume" label="Voice guidance" description="Read directions aloud (prototype)" checked={voiceGuidance} onChange={setVoiceGuidance} />
    </div>
  )
}

export default function Accessibility() {
  const navigate = useNavigate()
  const { largeText, highContrast, voiceGuidance } = useAccessibilitySettings()
  const [view, setView] = useState('main')
  const [visualInstructions, setVisualInstructions] = useState(false)
  const [visualAlerts, setVisualAlerts] = useState(false)

  const activeCount = [largeText, highContrast, voiceGuidance].filter(Boolean).length

  function goBack() {
    if (view !== 'main') setView('main')
    else if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/')
  }

  return (
    <div className="screen">
      <ScreenHeader
        title={view === 'main' ? 'Accessibility' : DETAIL_TITLES[view]}
        subtitle={view === 'main' ? 'Choose the support you need.' : undefined}
        onBack={goBack}
        backLabel={view === 'main' ? 'Back to previous screen' : 'Back to Accessibility'}
      />

      <main className="screen__body">
        {view === 'main' && (
          <>
            <div className="list-group">
              {CATEGORIES.map(cat => (
                <ListRow key={cat.id} icon={cat.icon} tone={cat.tone} title={cat.label} description={cat.desc} onClick={() => setView(cat.id)} />
              ))}
            </div>

            <section className="section" aria-label="Display settings">
              <div className="list-group">
                <ListRow
                  icon="layers"
                  tone="neutral"
                  title="Display settings"
                  description="Text size, contrast and voice"
                  meta={activeCount > 0 ? `${activeCount} on` : undefined}
                  onClick={() => setView('settings')}
                />
              </div>
            </section>
          </>
        )}

        {view === 'wheelchair' && (
          <>
            <p className="section__hint">Step-free facilities at {STATION_META.name}. Tap one to see it on the map.</p>
            <div className="list-group">
              {ACCESSIBLE_FACILITIES.map(location => (
                <DestinationRow key={location.id} location={location} onClick={() => navigate('/map', { state: { destinationId: location.id } })} />
              ))}
            </div>
            <div className="notice notice--info acc-notice">
              <Icon name="info" size={20} />
              <p className="notice__body">Need someone to meet you? Staff can provide wheelchair assistance.</p>
            </div>
            <div className="actions">
              <button type="button" className="btn btn--dark btn--block" onClick={() => navigate('/voice')}>
                <Icon name="help" size={20} /> Request wheelchair help
              </button>
            </div>
          </>
        )}

        {view === 'elderly' && (
          <>
            <div className="acc-here">
              <span className="acc-here__dot" aria-hidden="true" />
              <div className="list-row__body">
                <span className="acc-here__label">You are here</span>
                <span className="list-row__title">{CURRENT_LOCATION.label}</span>
              </div>
            </div>
            <h2 className="section__title section" style={{ marginBottom: 12 }}>What are you looking for?</h2>
            <div className="list-group">
              {ELDERLY_OPTIONS.map(option => (
                <ListRow
                  key={option.label}
                  icon={option.icon}
                  tone={option.tone}
                  title={option.label}
                  onClick={() => navigate(option.path ?? `/search?q=${encodeURIComponent(option.query)}`)}
                />
              ))}
            </div>
          </>
        )}

        {(view === 'visual' || view === 'settings') && (
          <>
            <p className="section__hint">These settings apply across the whole app.</p>
            <DisplaySettings />
            {view === 'settings' && (
              <div className="actions">
                <button type="button" className="btn btn--dark btn--block" onClick={() => setView('main')}>Done</button>
              </div>
            )}
          </>
        )}

        {view === 'hearing' && (
          <>
            <p className="section__hint">Important information will be shown on screen instead of audio.</p>
            <div className="list-group">
              <Toggle icon="eye" label="Visual instructions" description="Show every navigation step on screen" checked={visualInstructions} onChange={setVisualInstructions} />
              <Toggle icon="alert" label="Visual alerts" description="Show platform and train alerts on screen" checked={visualAlerts} onChange={setVisualAlerts} />
            </div>
            {(visualInstructions || visualAlerts) && (
              <div className="notice notice--info acc-notice" role="status">
                <Icon name="check" size={20} />
                <p className="notice__body">Hearing preferences saved for this session.</p>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

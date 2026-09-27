import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import DestinationRow from '../components/DestinationRow'
import ScreenHeader from '../components/ScreenHeader'
import Icon from '../components/Icon'
import StationMapCanvas from '../components/map/StationMapCanvas'
import { CURRENT_LOCATION, LOCATIONS, STATION_META } from '../data/stationData'
import './Home.css'

const COMMON_PLACES = [
  { id: 'platforms', label: 'Platforms', singular: 'platform', icon: 'train', tone: 'red', matches: l => l.type === 'platform' },
  { id: 'toilets', label: 'Toilets', singular: 'toilet', icon: 'toilet', tone: 'blue', matches: l => l.type === 'toilet' || l.type === 'toilet-accessible' },
  { id: 'lifts', label: 'Lifts', singular: 'lift', icon: 'lift', tone: 'blue', matches: l => l.type === 'elevator' },
  { id: 'exits', label: 'Exits', singular: 'station exit', icon: 'exit', tone: 'navy', matches: l => l.type === 'exit' || l.type === 'entrance' },
  { id: 'help', label: 'Help desk', singular: 'help point', icon: 'help', tone: 'green', matches: l => l.type === 'help' || l.type === 'information' },
  { id: 'facilities', label: 'Facilities', singular: 'facility', icon: 'building', tone: 'neutral', matches: l => ['facility', 'escalator', 'stairs'].includes(l.type) },
]

const PREVIEW_VIEWBOX = '150 200 330 190'

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [voiceActive, setVoiceActive] = useState(false)
  const [showLocation, setShowLocation] = useState(false)
  const [commonCategory, setCommonCategory] = useState(null)
  const inputRef = useRef(null)

  const activeCategory = COMMON_PLACES.find(category => category.id === commonCategory)
  const openDestination = id => navigate('/map', { state: { destinationId: id } })

  function handleVoiceToggle() {
    if (voiceActive) {
      setVoiceActive(false)
      return
    }
    setVoiceActive(true)
    setTimeout(() => setVoiceActive(false), 3000)
  }

  function handleSearch(event) {
    event.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  if (activeCategory) {
    const destinations = LOCATIONS.filter(activeCategory.matches)
    return (
      <div className="screen">
        <ScreenHeader
          title={activeCategory.label}
          subtitle={`${STATION_META.name} (${STATION_META.code})`}
          onBack={() => setCommonCategory(null)}
          backLabel="Back to Home"
        />
        <main className="screen__body">
          <p className="section__hint">Choose a {activeCategory.singular} to see it on the station map.</p>
          <div className="list-group">
            {destinations.map(location => (
              <DestinationRow key={location.id} location={location} onClick={() => openDestination(location.id)} />
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="screen">
      <header className="home-top">
        <div className="home-top__text">
          <h1 className="home-top__title">Hello, traveller</h1>
          <button type="button" className="home-top__station" onClick={() => setShowLocation(v => !v)} aria-expanded={showLocation}>
            <span className="home-top__station-dot" aria-hidden="true"><Icon name="pin" size={12} strokeWidth={2.6} /></span>
            {STATION_META.name}, {STATION_META.code}
            <Icon name="chevronRight" size={16} className="home-top__chev" />
          </button>
        </div>
        <button type="button" className="icon-btn" aria-label="Accessibility settings" onClick={() => navigate('/accessibility')}>
          <Icon name="accessibility" size={22} />
        </button>
      </header>

      <main className="screen__body">
        {showLocation && (
          <div className="notice notice--info home-callout" role="status">
            <Icon name="info" size={20} />
            <p className="notice__body">Location simulation: tap a platform on the station map to update your position.</p>
            <button type="button" className="notice__close" onClick={() => setShowLocation(false)} aria-label="Dismiss">
              <Icon name="close" size={18} />
            </button>
          </div>
        )}

        <form onSubmit={handleSearch} role="search" className="home-search">
          <label className="search-field">
            <Icon name="search" size={20} />
            <span className="sr-only">Search destination</span>
            <input
              ref={inputRef}
              className="search-field__input"
              type="search"
              inputMode="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search platform, toilet, lift or exit"
              autoComplete="off"
            />
            {query && (
              <button type="button" className="search-field__btn" onClick={() => { setQuery(''); inputRef.current?.focus() }} aria-label="Clear search">
                <Icon name="close" size={18} />
              </button>
            )}
            <button
              type="button"
              className={`search-field__btn home-search__mic${voiceActive ? ' is-active' : ''}`}
              onClick={handleVoiceToggle}
              aria-pressed={voiceActive}
              aria-label={voiceActive ? 'Stop voice input' : 'Start voice input'}
            >
              <Icon name="mic" size={20} />
            </button>
          </label>
          {voiceActive && <p className="home-search__status" role="status">Listening… Voice input is a prototype.</p>}
        </form>

        <section className="section" aria-labelledby="places-title">
          <h2 id="places-title" className="sr-only">Common places</h2>
          <div className="home-places">
            {COMMON_PLACES.map(place => (
              <button key={place.id} type="button" className="home-place" onClick={() => setCommonCategory(place.id)}>
                <span className={`tile-icon tile-icon--${place.tone}`} aria-hidden="true"><Icon name={place.icon} size={22} /></span>
                <span className="home-place__label">{place.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="section home-where" aria-label="Your position">
          <div className="home-where__card">
            <span className="home-where__eyebrow">You are on</span>
            <strong className="home-where__big">{CURRENT_LOCATION.platformId.replace('platform-', 'P')}</strong>
            <span className="home-where__small">{CURRENT_LOCATION.label.split('— ')[1] || 'Coach B4'}</span>
          </div>
          <button type="button" className="home-where__map" onClick={() => navigate('/map')} aria-label="Open the station map">
            <StationMapCanvas viewBox={PREVIEW_VIEWBOX} interactive={false} preserveAspectRatio="xMidYMid slice" />
            <span className="home-where__map-chip"><Icon name="map" size={14} /> Open map</span>
          </button>
        </section>

        <section className="section" aria-labelledby="help-title">
          <div className="section__head">
            <h2 id="help-title" className="section__title">Need a hand?</h2>
            <button type="button" className="text-link" onClick={() => navigate('/voice')}>
              All options <Icon name="chevronRight" size={16} />
            </button>
          </div>
          <div className="card home-help">
            <div className="card-head">
              <span className="tile-icon tile-icon--green" aria-hidden="true"><Icon name="users" size={22} /></span>
              <div>
                <p className="card__title">Station staff assistance</p>
                <p className="home-help__status"><span className="badge__dot" aria-hidden="true" /> Staff available now</p>
              </div>
            </div>
            <div className="home-help__meta">
              <div>
                <span className="home-help__meta-label">Nearest point</span>
                <span className="home-help__meta-value"><Icon name="pin" size={16} /> Help Point 2</span>
              </div>
              <div>
                <span className="home-help__meta-label">Response</span>
                <span className="home-help__meta-value"><Icon name="clock" size={16} /> ~4 min</span>
              </div>
            </div>
          </div>
        </section>

        <div className="actions">
          <button type="button" className="btn btn--dark btn--block" onClick={() => navigate('/voice')}>
            <Icon name="help" size={20} /> Ask for help
          </button>
          <button type="button" className="btn btn--secondary btn--block home-sos" onClick={() => navigate('/emergency')}>
            <Icon name="siren" size={20} /> Emergency help
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import DestinationRow from '../components/DestinationRow'
import ScreenHeader from '../components/ScreenHeader'
import Icon from '../components/Icon'
import { LOCATIONS, STATION_META } from '../data/stationData'

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function matchesLocation(location, query) {
  const normalizedQuery = normalize(query)
  const searchableText = normalize([
    location.name,
    location.shortName,
    location.type.replaceAll('-', ' '),
    location.description,
  ].filter(Boolean).join(' '))

  return searchableText.includes(normalizedQuery) ||
    (normalizedQuery === 'lift' && location.type === 'elevator')
}

const QUICK_TERMS = ['Platform', 'Toilet', 'Lift', 'Exit', 'Help']

export default function DestinationSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q')?.trim() ?? ''
  const results = useMemo(
    () => query ? LOCATIONS.filter(location => matchesLocation(location, query)) : [],
    [query],
  )
  const popularDestinations = [
    LOCATIONS.find(location => location.type === 'platform'),
    LOCATIONS.find(location => location.type === 'toilet-accessible'),
    LOCATIONS.find(location => location.type === 'elevator'),
    LOCATIONS.find(location => location.type === 'exit'),
  ].filter(Boolean)

  const selectDestination = location => navigate('/map', { state: { destinationId: location.id } })

  function updateQuery(value) {
    const nextParams = new URLSearchParams(searchParams)
    if (value) nextParams.set('q', value)
    else nextParams.delete('q')
    setSearchParams(nextParams, { replace: true })
  }

  function goBack() {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/')
  }

  return (
    <div className="screen">
      <ScreenHeader
        title="Find a destination"
        subtitle={`${STATION_META.name} (${STATION_META.code})`}
        onBack={goBack}
        backLabel="Back to previous screen"
      />

      <main className="screen__body">
        <form role="search" onSubmit={event => event.preventDefault()}>
          <label className="search-field">
            <Icon name="search" size={20} />
            <span className="sr-only">Search destinations</span>
            <input
              className="search-field__input"
              type="search"
              value={searchParams.get('q') ?? ''}
              onChange={event => updateQuery(event.target.value)}
              placeholder="Search platform, toilet, lift or exit"
              autoComplete="off"
            />
            {query && (
              <button type="button" className="search-field__btn" onClick={() => updateQuery('')} aria-label="Clear search">
                <Icon name="close" size={18} />
              </button>
            )}
          </label>
        </form>

        <div className="chip-row" style={{ marginTop: 14 }}>
          {QUICK_TERMS.map(term => (
            <button key={term} type="button" className="chip" onClick={() => updateQuery(term)} aria-pressed={normalize(query) === normalize(term)}>
              {term}
            </button>
          ))}
        </div>

        {results.length > 0 ? (
          <section className="section" aria-label={`Results for ${query}`}>
            <div className="section__head">
              <h2 className="section__title">Destinations</h2>
              <span className="badge badge--neutral">{results.length} found</span>
            </div>
            <div className="list-group">
              {results.map(location => (
                <DestinationRow key={location.id} location={location} onClick={() => selectDestination(location)} />
              ))}
            </div>
          </section>
        ) : query ? (
          <section className="status-hero" role="status" style={{ marginTop: 24 }}>
            <span className="status-hero__icon status-hero__icon--muted" aria-hidden="true"><Icon name="search" size={30} /></span>
            <p className="status-hero__title">No destination found</p>
            <p className="status-hero__text">Try searching for a platform, toilet, lift or exit.</p>
          </section>
        ) : (
          <section className="section" aria-labelledby="popular-title">
            <h2 id="popular-title" className="section__title" style={{ marginBottom: 12 }}>Popular destinations</h2>
            <div className="list-group">
              {popularDestinations.map(location => (
                <DestinationRow key={location.id} location={location} onClick={() => selectDestination(location)} />
              ))}
            </div>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  )
}

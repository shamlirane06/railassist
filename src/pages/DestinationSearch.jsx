import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import DestinationRow from '../components/DestinationRow'
import { LOCATIONS, STATION_META } from '../data/stationData'
import './Placeholder.css'

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

  function selectDestination(location) {
    navigate('/map', { state: { destinationId: location.id } })
  }

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
    <div className="placeholder-page destination-search-page">
      <header className="destination-search__header">
        <button className="ra-back-button" onClick={goBack} aria-label="Back to previous screen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div>
          <h1>Destination Search</h1>
          <p>{STATION_META.name} ({STATION_META.code})</p>
        </div>
      </header>

      <main className="placeholder-page__body destination-search__body">
        <form className="destination-search__form" role="search" onSubmit={event => event.preventDefault()}>
          <div className="destination-search__field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              value={searchParams.get('q') ?? ''}
              onChange={event => updateQuery(event.target.value)}
              placeholder="Search platform, toilet, lift or exit"
              aria-label="Search destinations"
            />
            {query && (
              <button type="button" className="destination-search__clear" onClick={() => updateQuery('')} aria-label="Clear search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {results.length > 0 ? (
          <section className="destination-search__results" aria-label={`Results for ${query}`}>
            <h2 className="destination-search__section-title">Destinations</h2>
            {results.map(location => (
              <DestinationRow key={location.id} location={location} onClick={() => selectDestination(location)} />
            ))}
          </section>
        ) : query ? (
          <section className="destination-search__empty-state" role="status">
            <div className="destination-search__empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4M8 11h6" />
              </svg>
            </div>
            <p className="destination-search__empty">No destination found</p>
            <p>Try searching for a platform, toilet, lift or exit.</p>
          </section>
        ) : (
          <section className="destination-search__popular" aria-label="Popular destinations">
            <h2 className="destination-search__section-title">Popular destinations</h2>
            {popularDestinations.map(location => (
              <DestinationRow key={location.id} location={location} onClick={() => selectDestination(location)} />
            ))}
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  )
}

import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { LOCATIONS } from '../data/stationData'
import './Placeholder.css'

const TYPE_LABELS = {
  platform: 'Platform',
  'toilet-accessible': 'Accessible Facility',
  toilet: 'Toilet',
  exit: 'Exit',
  entrance: 'Entrance',
  elevator: 'Elevator',
  help: 'Help Desk',
  facility: 'Facility',
  information: 'Information Desk',
  escalator: 'Escalator',
  stairs: 'Stairs',
}

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

  if (searchableText.includes(normalizedQuery)) return true
  return normalizedQuery === 'lift' && location.type === 'elevator'
}

export default function DestinationSearch() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q')?.trim() ?? ''
  const results = useMemo(
    () => query ? LOCATIONS.filter(location => matchesLocation(location, query)) : [],
    [query],
  )

  function selectDestination(location) {
    navigate('/map', { state: { destinationId: location.id } })
  }

  return (
    <div className="placeholder-page">
      <div className="placeholder-page__body">
        <div className="placeholder-page__icon" aria-hidden="true">🔍</div>
        <h1>Destination Search</h1>
        {results.length > 0 ? (
          <div className="destination-search__results" aria-label={`Results for ${query}`}>
            {results.map(location => (
              <button
                className="destination-search__result"
                key={location.id}
                onClick={() => selectDestination(location)}
              >
                <span className="destination-search__name">{location.name}</span>
                <span className="destination-search__type">
                  {TYPE_LABELS[location.type] || location.type}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <>
            <p className="destination-search__empty">No destination found</p>
            <p>Try searching for a platform, toilet, lift or exit.</p>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

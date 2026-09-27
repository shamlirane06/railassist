import { useState, useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import Icon from '../components/Icon'
import StationMapCanvas from '../components/map/StationMapCanvas'
import { useMapCamera } from '../components/map/useMapCamera'
import { STATION_META, LOCATIONS, CURRENT_LOCATION } from '../data/stationData'
import { getLocationIcon, getLocationTone, getTypeLabel } from '../data/locationMeta'
import './StationMap.css'

const CATEGORIES = [
  { key: 'platforms', label: 'Platforms', icon: 'train', matches: l => l.type === 'platform' },
  { key: 'exits', label: 'Exits', icon: 'exit', matches: l => l.type === 'exit' || l.type === 'entrance' },
  { key: 'toilets', label: 'Toilets', icon: 'toilet', matches: l => l.type === 'toilet' || l.type === 'toilet-accessible' },
  { key: 'lifts', label: 'Lifts', icon: 'lift', matches: l => l.type === 'elevator' },
  { key: 'help', label: 'Help desk', icon: 'help', matches: l => l.type === 'help' },
  { key: 'facilities', label: 'Facilities', icon: 'building', matches: l => ['facility', 'information', 'escalator', 'stairs'].includes(l.type) },
]

const SEARCH_ALIASES = {
  elevator: ['lift', 'lifts'],
  'accessible-toilet': ['accessible', 'disabled'],
  'normal-toilet': ['washroom', 'bathroom', 'loo', 'restroom'],
  'main-entrance': ['entrance', 'gate', 'door'],
  'info-desk': ['information'],
  'help-desk': ['porter', 'assistance'],
  'staff-point': ['security', 'guard'],
}

function searchLocations(q) {
  const lower = q.trim().toLowerCase()
  if (!lower) return []
  return LOCATIONS.filter(l =>
    l.name.toLowerCase().includes(lower) ||
    (l.shortName || '').toLowerCase().includes(lower) ||
    l.type.toLowerCase().includes(lower) ||
    (l.description || '').toLowerCase().includes(lower) ||
    (SEARCH_ALIASES[l.id] || []).some(a => a.includes(lower) || lower.includes(a)),
  ).slice(0, 8)
}

function LocationResult({ location, onClick }) {
  return (
    <button type="button" className="smap-result" onClick={onClick}>
      <span className={`tile-icon tile-icon--${getLocationTone(location)}`} aria-hidden="true">
        <Icon name={getLocationIcon(location)} size={20} />
      </span>
      <span className="list-row__body">
        <span className="smap-result__title">{location.name}</span>
        <span className="smap-result__desc">{getTypeLabel(location)}{location.accessible ? ' · Step-free' : ''}</span>
      </span>
      <Icon name="chevronRight" size={18} className="list-row__chevron" />
    </button>
  )
}

export default function StationMap() {
  const routerLocation = useLocation()
  const navigate = useNavigate()
  const sheetRef = useRef(null)
  const camera = useMapCamera({ occluderRef: sheetRef, home: CURRENT_LOCATION })
  const { focus } = camera
  const [selected, setSelected] = useState(null)
  const [destId, setDestId] = useState(null)
  const [query, setQuery] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [activeCat, setActiveCat] = useState(null)

  const results = searchLocations(query)
  const destLoc = destId ? LOCATIONS.find(l => l.id === destId) : null
  const category = CATEGORIES.find(c => c.key === activeCat)

  const resetMap = () => { camera.overview(); setSelected(null) }
  const recenter = () => camera.focus(CURRENT_LOCATION)

  const handleSelect = useCallback(id => {
    const loc = LOCATIONS.find(l => l.id === id)
    setSelected(loc || null)
    setShowPicker(false)
    if (loc) focus(loc)
  }, [focus])

  const pickResult = useCallback(loc => {
    setQuery('')
    setShowPicker(false)
    setActiveCat(null)
    setDestId(loc.id)
    setSelected(null)
    focus(loc)
  }, [focus])

  useEffect(() => {
    const destinationId = routerLocation.state?.destinationId
    if (!destinationId) return
    const destination = LOCATIONS.find(item => item.id === destinationId)
    if (destination) pickResult(destination)
  }, [routerLocation.key, routerLocation.state, pickResult])

  const closeSearch = () => {
    setQuery('')
    setShowPicker(false)
    setActiveCat(null)
  }

  const clearDest = () => {
    setDestId(null)
    closeSearch()
  }

  const searchOpen = showPicker || query.length > 0
  const sheetLocation = selected || destLoc
  const sheetIsDestination = !selected && destLoc

  return (
    <div className="screen smap">
      <div className="smap-top">
        <div className="smap-top__title">
          <h1>{STATION_META.name}</h1>
          <span className="smap-top__code">{STATION_META.code}</span>
        </div>

        <div className={`smap-search${searchOpen ? ' is-open' : ''}`}>
          <label className="search-field">
            <Icon name="search" size={20} />
            <span className="sr-only">Search destination</span>
            <input
              className="search-field__input"
              type="search"
              placeholder="Search destination"
              value={query}
              onChange={event => { setQuery(event.target.value); setActiveCat(null) }}
              onFocus={() => setShowPicker(true)}
              autoComplete="off"
            />
            {searchOpen && (
              <button type="button" className="search-field__btn" onClick={closeSearch} aria-label="Close search">
                <Icon name="close" size={18} />
              </button>
            )}
          </label>

          {searchOpen && (
            <div className="smap-panel" role="region" aria-label="Destination options">
              {query ? (
                results.length > 0 ? (
                  results.map(loc => <LocationResult key={loc.id} location={loc} onClick={() => pickResult(loc)} />)
                ) : (
                  <p className="smap-panel__empty">{`No places match "${query}".`}</p>
                )
              ) : category ? (
                <>
                  <button type="button" className="smap-panel__back" onClick={() => setActiveCat(null)}>
                    <Icon name="chevronLeft" size={18} /> {category.label}
                  </button>
                  {LOCATIONS.filter(category.matches).map(loc => (
                    <LocationResult key={loc.id} location={loc} onClick={() => pickResult(loc)} />
                  ))}
                </>
              ) : (
                <>
                  <p className="smap-panel__label">Browse by type</p>
                  <div className="smap-cats">
                    {CATEGORIES.map(cat => (
                      <button key={cat.key} type="button" className="smap-cat" onClick={() => setActiveCat(cat.key)}>
                        <Icon name={cat.icon} size={20} />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="smap-stage" ref={camera.stageRef} {...camera.stageHandlers}>
        <StationMapCanvas
          viewBox={camera.viewBox}
          selectedId={selected?.id}
          destinationId={destId}
          onSelect={handleSelect}
          className={camera.ready ? '' : 'is-loading'}
          title={`${STATION_META.name} indoor station map. Drag to move, pinch or scroll to zoom, and select a location for details.`}
        />

        <div className="smap-controls" role="group" aria-label="Map controls">
          <div className="smap-zoom">
            <button type="button" className="smap-control" onClick={camera.zoomIn} disabled={!camera.canZoomIn} aria-label="Zoom in"><Icon name="plus" size={20} /></button>
            <span className="smap-zoom__divider" aria-hidden="true" />
            <button type="button" className="smap-control" onClick={camera.zoomOut} disabled={!camera.canZoomOut} aria-label="Zoom out"><Icon name="minus" size={20} /></button>
          </div>
          <button type="button" className="smap-control smap-control--solo" onClick={resetMap} aria-label="Show whole station"><Icon name="reset" size={20} /></button>
          <button type="button" className="smap-control smap-control--solo smap-control--locate" onClick={recenter} aria-label="Centre on my location"><Icon name="locate" size={20} /></button>
        </div>
      </div>

      <section className="smap-sheet" ref={sheetRef} aria-live="polite" aria-label="Location details">
        <span className="smap-sheet__grip" aria-hidden="true" />
        {sheetLocation ? (
          <>
            <div className="smap-sheet__head">
              <span className={`tile-icon tile-icon--${getLocationTone(sheetLocation)}`} aria-hidden="true">
                <Icon name={getLocationIcon(sheetLocation)} size={22} />
              </span>
              <div className="smap-sheet__text">
                <p className="smap-sheet__eyebrow">{sheetIsDestination ? 'Destination' : getTypeLabel(sheetLocation)}</p>
                <h2 className="smap-sheet__title">{sheetLocation.name}</h2>
              </div>
              <button
                type="button"
                className="icon-btn smap-sheet__close"
                onClick={sheetIsDestination ? clearDest : () => setSelected(null)}
                aria-label={sheetIsDestination ? 'Clear destination' : 'Close details'}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <p className="smap-sheet__desc">{sheetLocation.description}</p>
            <div className="chip-row smap-sheet__tags">
              <span className={`badge ${sheetLocation.accessible ? 'badge--success' : 'badge--neutral'}`}>
                <Icon name="accessibility" size={14} /> {sheetLocation.accessible ? 'Step-free access' : 'Not step-free'}
              </span>
              <span className="badge badge--neutral">{sheetLocation.level === 'both' ? 'All levels' : `${sheetLocation.level[0].toUpperCase()}${sheetLocation.level.slice(1)} level`}</span>
            </div>
            <div className="actions actions--row smap-sheet__actions">
              {sheetIsDestination ? (
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => focus(sheetLocation)}>
                  <Icon name="pin" size={18} /> Show on map
                </button>
              ) : (
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => pickResult(sheetLocation)}>
                  <Icon name="pin" size={18} /> Set destination
                </button>
              )}
              <button type="button" className="btn btn--dark btn--sm" onClick={() => navigate('/navigation', { state: { destinationId: sheetLocation.id } })}>
                <Icon name="navigation" size={18} /> Directions
              </button>
            </div>
          </>
        ) : (
          <div className="smap-sheet__idle">
            <span className="smap-sheet__dot" aria-hidden="true" />
            <div className="smap-sheet__text">
              <p className="smap-sheet__eyebrow">You are here</p>
              <p className="smap-sheet__title">{CURRENT_LOCATION.label}</p>
            </div>
            <button type="button" className="btn btn--dark btn--sm smap-sheet__go" onClick={() => setShowPicker(true)}>
              <Icon name="search" size={16} /> Go to
            </button>
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  )
}

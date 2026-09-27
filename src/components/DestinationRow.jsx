import ChevronRight from './ChevronRight'

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

export default function DestinationRow({ location, onClick }) {
  const icon = location.type === 'platform'
    ? <><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 9h16M12 3v6M8 21l2-3m6 3-2-3"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/></>
    : location.type.includes('toilet')
      ? <><path d="M5 4h14v5H5zM7 9v8a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4V9"/><path d="M9 13h6"/></>
      : location.type === 'elevator'
        ? <><rect x="5" y="2" width="14" height="20" rx="2"/><path d="m9 9 3-3 3 3m-6 6 3 3 3-3"/></>
        : location.type === 'exit' || location.type === 'entrance'
          ? <><path d="M13 5h6v14h-6M4 12h11m-4-4 4 4-4 4"/></>
          : location.type === 'help' || location.type === 'information'
            ? <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1.1-1.5 2.5M12 17h.01"/></>
            : <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>
  return (
    <button className="destination-row" onClick={onClick}>
      <span className={`destination-row__icon destination-row__icon--${location.type}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </span>
      <span className="destination-row__copy">
        <span className="destination-row__name">{location.name}</span>
        <span className="destination-row__type">{TYPE_LABELS[location.type] || location.type}</span>
      </span>
      <span className="destination-row__chevron"><ChevronRight /></span>
    </button>
  )
}

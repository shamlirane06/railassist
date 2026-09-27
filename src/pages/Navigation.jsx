import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import ScreenHeader from '../components/ScreenHeader'
import SummaryList from '../components/SummaryList'
import Icon from '../components/Icon'
import { CURRENT_LOCATION, LOCATIONS } from '../data/stationData'

export default function Navigation() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const destination = LOCATIONS.find(location => location.id === state?.destinationId)

  return (
    <div className="screen">
      <ScreenHeader
        title="Directions"
        subtitle={destination ? `To ${destination.name}` : 'Indoor navigation'}
        onBack={() => navigate(-1)}
      />
      <main className="screen__body">
        <div className="status-hero">
          <span className="status-hero__icon status-hero__icon--muted" aria-hidden="true"><Icon name="compass" size={32} /></span>
          <p className="status-hero__title">Turn-by-turn coming soon</p>
          <p className="status-hero__text">Step-by-step indoor directions are being prepared for Central Junction.</p>
        </div>

        {destination && (
          <div className="section">
            <SummaryList
              items={[
                { label: 'From', value: CURRENT_LOCATION.label },
                { label: 'To', value: destination.name },
                { label: 'Step-free', value: destination.accessible ? 'Yes' : 'No', tone: destination.accessible ? 'success' : undefined },
              ]}
            />
          </div>
        )}

        <div className="actions">
          <button
            type="button"
            className="btn btn--dark btn--block"
            onClick={() => navigate('/map', destination ? { state: { destinationId: destination.id } } : undefined)}
          >
            <Icon name="map" size={20} /> View on station map
          </button>
          <button type="button" className="btn btn--secondary btn--block" onClick={() => navigate('/voice')}>
            <Icon name="help" size={20} /> Ask staff for directions
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import Icon from '../components/Icon'

export default function StaffDashboard() {
  const navigate = useNavigate()

  return (
    <div className="screen">
      <ScreenHeader title="Staff dashboard" subtitle="Prototype" onBack={() => navigate('/')} backLabel="Back to Home" />
      <main className="screen__body">
        <div className="status-hero">
          <span className="status-hero__icon status-hero__icon--muted" aria-hidden="true"><Icon name="users" size={32} /></span>
          <p className="status-hero__title">Staff Dashboard Prototype</p>
          <p className="status-hero__text">Future feature. Staff request management is not available yet.</p>
        </div>
      </main>
    </div>
  )
}

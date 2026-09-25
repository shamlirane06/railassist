import BottomNav from '../components/BottomNav'
import './Placeholder.css'

export default function Emergency() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page__body">
        <div className="placeholder-page__icon" style={{ fontSize: 56 }}>🆘</div>
        <h2 style={{ color: 'var(--color-primary)' }}>Emergency / SOS</h2>
        <p>Send an emergency request with your location.</p>
        <button className="placeholder-sos-btn">SEND HELP REQUEST</button>
      </div>
      <BottomNav />
    </div>
  )
}

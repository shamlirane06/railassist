import BottomNav from '../components/BottomNav'
import './Placeholder.css'

export default function VoiceRequest() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page__body">
        <div className="placeholder-page__icon">🎙️</div>
        <h2>Help Points</h2>
        <p>Voice and text assistance requests.</p>
      </div>
      <BottomNav />
    </div>
  )
}

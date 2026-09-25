import BottomNav from '../components/BottomNav'
import './Placeholder.css'

export default function Navigation() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page__body">
        <div className="placeholder-page__icon">🧭</div>
        <h2>Navigation</h2>
        <p>Turn-by-turn indoor navigation coming soon.</p>
      </div>
      <BottomNav />
    </div>
  )
}

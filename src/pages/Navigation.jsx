import BottomNav from '../components/BottomNav'
import './Placeholder.css'

export default function Navigation() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page__body">
        <div className="placeholder-page__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
          </svg>
        </div>
        <h2>Navigation</h2>
        <p>Turn-by-turn indoor navigation coming soon.</p>
      </div>
      <BottomNav />
    </div>
  )
}

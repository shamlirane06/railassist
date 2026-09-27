import './Placeholder.css'

export default function StaffDashboard() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page__body">
        <div className="placeholder-page__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M4.5 21a7.5 7.5 0 0 1 15 0M18 4l1.2 1.2L22 2.5" />
          </svg>
        </div>
        <h2>Staff Dashboard Prototype</h2>
        <p>Future feature. Staff request management is not available yet.</p>
      </div>
      {/* No bottom nav — staff view */}
    </div>
  )
}

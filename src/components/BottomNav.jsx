import { useNavigate, useLocation } from 'react-router-dom'
import Icon from './Icon'
import './BottomNav.css'

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: 'home' },
  { label: 'Map', path: '/map', icon: 'map' },
  { label: 'Help', path: '/voice', icon: 'help' },
  { label: 'SOS', path: '/emergency', icon: 'siren', isSOS: true },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(item => {
        const isActive = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path)

        return (
          <button
            key={item.path}
            type="button"
            className={`bottom-nav__item${isActive ? ' is-active' : ''}${item.isSOS ? ' bottom-nav__item--sos' : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="bottom-nav__icon"><Icon name={item.icon} size={22} /></span>
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

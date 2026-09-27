import { Outlet } from 'react-router-dom'
import { AccessibilityProvider } from '../context/AccessibilitySettings'
import './Layout.css'

export default function Layout() {
  return (
    <AccessibilityProvider>
      <div className="layout-root">
        <div className="app-frame">
          <Outlet />
        </div>
      </div>
    </AccessibilityProvider>
  )
}

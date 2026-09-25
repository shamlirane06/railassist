import { Outlet } from 'react-router-dom'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout-root">
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}

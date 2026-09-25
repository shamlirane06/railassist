import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import StationMap from './pages/StationMap'
import DestinationSearch from './pages/DestinationSearch'
import VoiceRequest from './pages/VoiceRequest'
import Navigation from './pages/Navigation'
import Emergency from './pages/Emergency'
import StaffDashboard from './pages/StaffDashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="map" element={<StationMap />} />
        <Route path="search" element={<DestinationSearch />} />
        <Route path="voice" element={<VoiceRequest />} />
        <Route path="navigation" element={<Navigation />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="staff" element={<StaffDashboard />} />
      </Route>
    </Routes>
  )
}

export default App

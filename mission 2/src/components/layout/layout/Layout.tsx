import { Navigate, Route, Routes } from 'react-router-dom'
import NavBar from '../nav/NavBar'
import Home from '../../pages/Home'
import History from '../../pages/History'
import About from '../../pages/About'

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <p className="eyebrow">React + TypeScript Weather</p>
          <h1>Israel Weather</h1>
          <p className="subtitle">Choose a city to see the current weather and search history.</p>
        </div>
        <NavBar />
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>Mission 2 - React weather app</p>
      </footer>
    </div>
  )
}

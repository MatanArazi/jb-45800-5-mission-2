import { NavLink } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        Home
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        History
      </NavLink>
      <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        About
      </NavLink>
    </nav>
  )
}

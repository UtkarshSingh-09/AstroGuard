import { NavLink } from 'react-router-dom'

const linkBase =
  'text-[15px] font-sans font-medium transition-colors focus:outline-none focus-visible:text-white focus-visible:underline underline-offset-4 decoration-accent-teal/60'

function navClass({ isActive }) {
  if (isActive) {
    return `${linkBase} text-accent-teal`
  }
  return `${linkBase} text-white/70 hover:text-white`
}

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/fire', label: 'FIRE Planner' },
  { to: '/tax', label: 'Tax Matrix' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  return (
    <nav
      className="absolute top-0 left-0 right-0 z-50 w-full flex flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 pointer-events-auto"
      style={{ fontSize: 16, paddingTop: 20, paddingBottom: 20 }}
      aria-label="Primary"
    >
      {links.map(({ to, label, end }) => (
        <NavLink key={to} to={to} end={end} className={navClass}>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

import { NavLink } from 'react-router-dom'
import { tabs } from '../tabs'

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Hlavná navigácia">
      {tabs.map(({ path, label, icon: Icon }) => (
        <NavLink key={path} to={path} className="bottom-nav__link">
          <span className="bottom-nav__icon">
            <Icon size={24} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

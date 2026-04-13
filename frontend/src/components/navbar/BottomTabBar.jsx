import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/dashboard', label: 'Home', symbol: '🏠' },
  { to: '/resources', label: 'Resources', symbol: '📚' },
  { to: '/my-bookings', label: 'Bookings', symbol: '📅' },
  { to: '/my-tickets', label: 'Tickets', symbol: '🎫' },
  { to: '/profile', label: 'Profile', symbol: '👤' },
];

export default function BottomTabBar() {
  return (
    <nav className="auth-bottom-tabs" aria-label="Dashboard mobile tabs">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `auth-bottom-tabs__item ${isActive ? 'is-active' : ''}`}
        >
          <span>{tab.symbol}</span>
          <small>{tab.label}</small>
        </NavLink>
      ))}
    </nav>
  );
}

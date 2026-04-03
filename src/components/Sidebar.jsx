import { NavLink } from 'react-router-dom';

function Sidebar({ links }) {
  return (
    <aside className="sidebar">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <span className="sidebar-icon">{link.icon}</span>
          <span className="sidebar-label">{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}

export default Sidebar;

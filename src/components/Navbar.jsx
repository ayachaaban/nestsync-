import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout, notifications = [], onMarkRead }) {
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleColors = {
    parent: '#C5B3D5',
    staff: '#B8A5C8',
    admin: '#F5D78E',
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate(`/${user.role}`)}>
        <span className="navbar-title">NestSync+</span>
      </div>
      <div className="navbar-user">
        {onMarkRead && (
          <div className="notif-wrapper">
            <button className="notif-bell" onClick={() => setShowNotifs(!showNotifs)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
            </button>
            {showNotifs && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <strong>Notifications</strong>
                  <span>{unreadCount} new</span>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <p className="notif-empty">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className={`notif-item ${n.read ? '' : 'unread'}`}
                        onClick={() => { if (onMarkRead) onMarkRead(n.id); }}
                      >
                        <span className="notif-icon">
                          {n.type === 'report' ? '📋' : n.type === 'supply' ? '📦' : n.type === 'media' ? '📸' : n.type === 'announcement' ? '📢' : n.type === 'reminder' ? '⏰' : '🔔'}
                        </span>
                        <div className="notif-content">
                          <strong>{n.title}</strong>
                          <p>{n.message}</p>
                          <span className="notif-time">{n.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <span className="navbar-role" style={{ background: roleColors[user.role] }}>
          {user.role}
        </span>
        <span className="navbar-name">{user.name}</span>
        <button className="btn btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

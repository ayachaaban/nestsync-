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
    parent: '#C5C9E0',
    staff: '#059669',
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate(`/${user.role}`)}>
        <span className="navbar-title">NestSync+</span>
      </div>
      <div className="navbar-user">
        {notifications.length > 0 && (
          <div className="notif-wrapper">
            <button className="notif-bell" onClick={() => setShowNotifs(!showNotifs)}>
              🔔
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
                          {n.type === 'report' ? '📋' : n.type === 'supply' ? '📦' : n.type === 'media' ? '📸' : n.type === 'announcement' ? '📢' : '🔔'}
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
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

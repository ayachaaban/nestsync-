import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ActivityCard from '../components/ActivityCard';
import EventCalendar from '../components/EventCalendar';
import StatsCard from '../components/StatsCard';
import GroupChat from '../components/GroupChat';
import ChildAvatar from '../components/ChildAvatar';
import { children, activities } from '../data/mockData';

function ParentHome({ user, notifications }) {
  const myChildren = children.filter((c) => user.childIds?.includes(c.id));
  const child = myChildren[0];
  const childActivities = activities.filter((a) => a.childId === child?.id);

  if (!child) return <div className="page-content"><p>No child linked to your account.</p></div>;

  const recentNotifs = notifications.filter((n) => !n.read).slice(0, 3);

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Welcome back, {user.name.split(' ')[0]}!</h2>
        <p>Here&apos;s how {child.name} is doing today</p>
      </div>

      {recentNotifs.length > 0 && (
        <div className="notif-banner">
          <span className="notif-banner-icon">🔔</span>
          <span>You have {recentNotifs.length} new notification{recentNotifs.length > 1 ? 's' : ''} — check the bell icon above.</span>
        </div>
      )}

      <div className="stats-row">
        <StatsCard icon="" label="Meals Today" value={childActivities.filter((a) => a.type === 'meal').length} color="#f59e0b" />
        <StatsCard icon="" label="Naps Today" value={childActivities.filter((a) => a.type === 'nap').length} color="#6366f1" />
        <StatsCard icon="🎨" label="Activities" value={childActivities.filter((a) => a.type === 'activity').length} color="#ec4899" />
        <StatsCard icon="📋" label="Health Notes" value={childActivities.filter((a) => a.type === 'health').length} color="#ef4444" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Today&apos;s Timeline</h3>
            <span className="badge badge-blue">Live</span>
          </div>
          <div className="activity-list">
            {childActivities.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        </div>

        <div className="card-stack">
          <div className="card child-profile-card">
            <div className="child-profile">
              <ChildAvatar avatar={child.avatar} name={child.name} size="lg" />
              <div>
                <h3>{child.name}</h3>
                <p>Age: {child.age} years | Group: {child.group}</p>
                <p>Blood Type: {child.bloodType} | Allergies: {child.allergies}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ParentGallery({ user, mediaUploads }) {
  const myChildren = children.filter((c) => user.childIds?.includes(c.id));
  const childPhotos = mediaUploads.filter((p) => myChildren.some((c) => c.id === p.childId));

  const handleDownload = (photo) => {
    const link = document.createElement('a');
    if (photo.url) {
      link.href = photo.url;
    } else {
      const blob = new Blob([`${photo.caption}\nDate: ${photo.date}\nBy: ${photo.uploadedBy}`], { type: 'text/plain' });
      link.href = URL.createObjectURL(blob);
    }
    link.download = `${photo.caption.replace(/\s+/g, '_')}.${photo.type === 'video' ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Photo & Video Gallery</h2>
        <p>Photos and moments from your child&apos;s day</p>
      </div>
      <div className="gallery-grid">
        {childPhotos.map((photo) => (
          <div key={photo.id} className="gallery-item">
            {photo.url && photo.type === 'photo' ? (
              <div className="gallery-image">
                <img src={photo.url} alt={photo.caption} />
                <span className="media-badge">Photo</span>
              </div>
            ) : photo.url && photo.type === 'video' ? (
              <div className="gallery-image">
                <video src={photo.url} controls />
                <span className="media-badge">Video</span>
              </div>
            ) : (
              <div className="gallery-placeholder">
                {photo.type === 'video' ? '🎬' : '📸'}
                <span className="media-badge">{photo.type === 'video' ? 'Video' : 'Photo'}</span>
              </div>
            )}
            <div className="gallery-info">
              <p>{photo.caption}</p>
              <div className="gallery-meta">
                <span>{photo.date} - by {photo.uploadedBy}</span>
                <button
                  className="btn-download"
                  onClick={() => handleDownload(photo)}
                  title={`Download ${photo.type}`}
                >
                  ⬇ Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ParentDailyReports({ user, dailyReports }) {
  const myChildren = children.filter((c) => user.childIds?.includes(c.id));
  const myReports = dailyReports.filter((r) => myChildren.some((c) => c.id === r.childId));

  const moodIcons = { happy: '', calm: '', tired: '', fussy: '', energetic: '' };
  const portionLabels = { full: '🟢 Full', half: '🟡 Half', none: '🔴 Didn\'t eat' };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Daily Reports</h2>
        <p>Reports from your child&apos;s teachers</p>
      </div>

      {myReports.length === 0 ? (
        <div className="card">
          <p className="empty-state">No daily reports yet. Your child&apos;s teacher will send reports here.</p>
        </div>
      ) : (
        <div className="reports-grid">
          {myReports.map((r) => (
            <div key={r.id} className="card daily-report-card">
              <div className="report-card-header">
                <div>
                  <h3>{r.childName}</h3>
                  <span className="note-date">{r.date} — by {r.staffName}</span>
                </div>
                <div className="report-mood-badge">
                  <span>{moodIcons[r.mood] || '😊'}</span>
                  <span>{r.mood}</span>
                </div>
              </div>
              <div className="report-card-body">
                {/* Meals */}
                <div className="report-section">
                  <strong>Meals</strong>
                  <div className="report-meals-row">
                    <span>Breakfast: {portionLabels[r.breakfast] || '—'}</span>
                    <span>Lunch: {portionLabels[r.lunch] || '—'}</span>
                    <span>Snack: {portionLabels[r.snack] || '—'}</span>
                  </div>
                </div>
                {/* Nap */}
                {(r.napFrom || r.napTo) && (
                  <div className="report-section">
                    <strong>Nap</strong>
                    <p>{r.napFrom && r.napTo ? `${r.napFrom} — ${r.napTo}` : r.napFrom || r.napTo}{r.napNotes ? ` · ${r.napNotes}` : ''}</p>
                  </div>
                )}
                {/* Diaper */}
                {r.diapers && r.diapers.length > 0 && (
                  <div className="report-section">
                    <strong>Diaper Changes ({r.diapers.length})</strong>
                    <div className="diaper-summary">
                      {r.diapers.map((d, i) => (
                        <span key={i} className={`diaper-tag ${d.type}`}>
                          {d.type === 'wet' ? '💧 Wet' : d.type === 'soiled' ? '💩 Soiled' : '💧💩 Both'}
                          {d.time ? ` at ${d.time}` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Items needed */}
                {r.itemsNeeded && r.itemsNeeded.length > 0 && (
                  <div className="report-section">
                    <strong>📦 Items Needed</strong>
                    <div className="supply-items-list">
                      {r.itemsNeeded.map((item, i) => (
                        <span key={i} className="supply-tag">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Notes */}
                {r.notes && (
                  <div className="report-section">
                    <strong>📝 Notes</strong>
                    <p>{r.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
];

function ParentSchedule({ weeklySchedule }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Weekly Schedule</h2>
        <p>Your child&apos;s class timetable for the week</p>
      </div>
      <div className="card">
        <div className="weekly-table-wrap">
          <table className="weekly-table readonly">
            <thead>
              <tr>
                <th className="wt-time-col">Time</th>
                {DAYS.map((d) => <th key={d.key}>{d.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {weeklySchedule.map((row, i) => (
                <tr key={i}>
                  <td className="wt-time-cell">{row.time}</td>
                  {DAYS.map((d) => (
                    <td key={d.key} className="wt-cell">
                      <span className="wt-cell-text">{row[d.key] || '—'}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ParentMenu({ weeklyMenu }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Weekly Menu</h2>
        <p>What your child eats during the week</p>
      </div>
      <div className="card">
        <div className="weekly-table-wrap">
          <table className="weekly-table menu-table readonly">
            <thead>
              <tr>
                <th className="wt-meal-col">Meal</th>
                <th className="wt-mealtime-col">Time</th>
                {DAYS.map((d) => <th key={d.key}>{d.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {weeklyMenu.map((row, i) => (
                <tr key={i}>
                  <td className="wt-meal-cell">{row.meal}</td>
                  <td className="wt-mealtime-cell">{row.time}</td>
                  {DAYS.map((d) => (
                    <td key={d.key} className="wt-cell">
                      <span className="wt-cell-text">{row[d.key] || '—'}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ParentCalendar({ calendarEvents }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Announcements</h2>
        <p>Events, meetings, days off, and important announcements</p>
      </div>
      <EventCalendar events={calendarEvents} />
    </div>
  );
}

function ParentDashboard({ user, onLogout, notifications, onMarkRead, dailyReports, calendarEvents, mediaUploads, weeklySchedule, weeklyMenu, chatMessages, onSendChat }) {
  const sidebarLinks = [
    { to: '/parent', icon: '', label: 'Dashboard' },
    { to: '/parent/daily-reports', icon: '', label: 'Daily Reports' },
    { to: '/parent/schedule', icon: '', label: 'Weekly Schedule' },
    { to: '/parent/menu', icon: '', label: 'Weekly Menu' },
    { to: '/parent/gallery', icon: '', label: 'Gallery' },
    { to: '/parent/group-chat', icon: '', label: 'Group Chat' },
    { to: '/parent/calendar', icon: '', label: 'Announcements' },
  ];

  return (
    <div className="app-layout">
      <Navbar user={user} onLogout={onLogout} notifications={notifications} onMarkRead={onMarkRead} />
      <div className="app-body">
        <Sidebar links={sidebarLinks} />
        <main className="main-content">
          <Routes>
            <Route index element={<ParentHome user={user} notifications={notifications} />} />
            <Route path="daily-reports" element={<ParentDailyReports user={user} dailyReports={dailyReports} />} />
            <Route path="schedule" element={<ParentSchedule weeklySchedule={weeklySchedule} />} />
            <Route path="menu" element={<ParentMenu weeklyMenu={weeklyMenu} />} />
            <Route path="gallery" element={<ParentGallery user={user} mediaUploads={mediaUploads} />} />
            <Route path="group-chat" element={<GroupChat user={user} messages={chatMessages} onSend={onSendChat} />} />
            <Route path="calendar" element={<ParentCalendar calendarEvents={calendarEvents} />} />
            <Route path="*" element={<Navigate to="/parent" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default ParentDashboard;

import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ActivityCard from '../components/ActivityCard';
import EventCalendar from '../components/EventCalendar';
import StatsCard from '../components/StatsCard';
import GroupChat from '../components/GroupChat';
import ChildAvatar from '../components/ChildAvatar';
function ParentHome({ user, notifications, allChildren, dailyReports, calendarEvents, mediaUploads, registeredUsers }) {
  const myChildren = (allChildren || []).filter((c) => user.childIds?.includes(c.id));
  const child = myChildren[0];

  if (!child) return <div className="page-content"><p>No child linked to your account.</p></div>;

  // Look up the teacher live, by matching the child's group against currently
  // registered staff. This way, if a staff member signs up after the parent did,
  // the parent immediately sees the real teacher's name instead of "Not yet assigned".
  const liveTeacher = (registeredUsers || []).find(
    (u) => u.role === 'staff' && u.group === child.group
  )?.name || 'Not yet assigned';

  // Live data tied to this child only
  const myReports = (dailyReports || []).filter((r) => r.childId === child.id);
  const latestReport = myReports[0];
  const myMedia = (mediaUploads || []).filter((m) => m.childId === child.id);
  const recentMedia = myMedia.slice(0, 4);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = (calendarEvents || [])
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const moodLabel = {
    happy: '😊 Happy',
    calm: '😌 Calm',
    tired: '😴 Tired',
    fussy: '😤 Fussy',
    energetic: '⚡ Energetic',
  };
  const portionLabel = { full: 'Full', half: 'Half', none: 'Skipped' };
  const eventIcon = { event: '🎉', meeting: '👥', health: '🏥', offday: '🏖️' };

  return (
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Welcome back, {user.name.split(' ')[0]}!</h2>
        <p>Here&apos;s the latest from {child.name}&apos;s day at NestSync+</p>
      </div>

      {unreadCount > 0 && (
        <div className="notif-banner">
          <span className="notif-banner-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </span>
          <span>You have {unreadCount} new notification{unreadCount > 1 ? 's' : ''} — check the bell icon above.</span>
        </div>
      )}

      <div className="stats-row">
        <StatsCard icon="" label="Daily Reports" value={myReports.length} color="#2b3a4e" />
        <StatsCard icon="" label="Photos & Videos" value={myMedia.length} color="#7FA99B" />
        <StatsCard icon="" label="Upcoming Events" value={upcomingEvents.length} color="#A8D5E2" />
        <StatsCard icon="" label="Unread Alerts" value={unreadCount} color="#F5D78E" />
      </div>

      <div className="dashboard-grid">
        {/* My Child profile */}
        <div className="card">
          <div className="card-header">
            <h3>My Child</h3>
          </div>
          <div className="dash-child-profile">
            <ChildAvatar avatar={child.avatar} name={child.name} size="lg" />
            <div className="dash-child-details">
              <h3>{child.name}</h3>
              <div className="dash-child-info-grid">
                <div className="dash-child-info-item">
                  <span className="dash-child-label">Age</span>
                  <span className="dash-child-value">{child.age} years</span>
                </div>
                <div className="dash-child-info-item">
                  <span className="dash-child-label">Group</span>
                  <span className="dash-child-value">{child.group}</span>
                </div>
                <div className="dash-child-info-item">
                  <span className="dash-child-label">Teacher</span>
                  <span className="dash-child-value">{liveTeacher}</span>
                </div>
                <div className="dash-child-info-item">
                  <span className="dash-child-label">Level</span>
                  <span className="dash-child-value">{child.level || '—'}</span>
                </div>
                <div className="dash-child-info-item">
                  <span className="dash-child-label">Blood Type</span>
                  <span className="dash-child-value">{child.bloodType || '—'}</span>
                </div>
                <div className="dash-child-info-item">
                  <span className="dash-child-label">Allergies</span>
                  <span className="dash-child-value">{child.allergies || 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Daily Report */}
        <div className="card">
          <div className="card-header">
            <h3>Latest Daily Report</h3>
          </div>
          <div className="dash-activity-list">
            {latestReport ? (
              <>
                <div className="dash-activity-item">
                  <div className="dash-activity-info">
                    <strong>Mood</strong>
                    <span>{moodLabel[latestReport.mood] || latestReport.mood}</span>
                  </div>
                  <span className="dash-activity-time">{latestReport.date}</span>
                </div>
                <div className="dash-activity-item">
                  <div className="dash-activity-info">
                    <strong>Meals</strong>
                    <span>
                      Breakfast: {portionLabel[latestReport.breakfast] || '—'} · Lunch: {portionLabel[latestReport.lunch] || '—'} · Snack: {portionLabel[latestReport.snack] || '—'}
                    </span>
                  </div>
                </div>
                {(latestReport.napFrom || latestReport.napTo) && (
                  <div className="dash-activity-item">
                    <div className="dash-activity-info">
                      <strong>Nap</strong>
                      <span>{latestReport.napFrom || '—'} — {latestReport.napTo || '—'}</span>
                    </div>
                  </div>
                )}
                {latestReport.itemsNeeded?.length > 0 && (
                  <div className="dash-activity-item">
                    <div className="dash-activity-info">
                      <strong>📦 Items Needed</strong>
                      <span>{latestReport.itemsNeeded.join(', ')}</span>
                    </div>
                  </div>
                )}
                <div className="dash-activity-item">
                  <div className="dash-activity-info">
                    <strong>Sent by</strong>
                    <span>{latestReport.staffName}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="empty-state">No daily reports yet. Your teacher will send the first one soon.</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Upcoming Announcements */}
        <div className="card">
          <div className="card-header">
            <h3>Upcoming Announcements</h3>
          </div>
          <div className="dash-activity-list">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((e) => (
                <div key={e.id} className="dash-activity-item">
                  <div className="dash-activity-info">
                    <strong>{eventIcon[e.type] || '📅'} {e.title}</strong>
                    <span>{e.description || ''}</span>
                  </div>
                  <span className="dash-activity-time">{e.date}{e.time ? ` · ${e.time}` : ''}</span>
                </div>
              ))
            ) : (
              <p className="empty-state">No upcoming announcements right now.</p>
            )}
          </div>
        </div>

        {/* Recent Photos & Videos */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Photos &amp; Videos</h3>
          </div>
          <div className="dash-activity-list">
            {recentMedia.length > 0 ? (
              recentMedia.map((m) => (
                <div key={m.id} className="dash-activity-item">
                  <div className="dash-activity-info">
                    <strong>{m.type === 'video' ? '🎬' : '📸'} {m.caption}</strong>
                    <span>by {m.uploadedBy}</span>
                  </div>
                  <span className="dash-activity-time">{m.date}</span>
                </div>
              ))
            ) : (
              <p className="empty-state">No photos or videos yet. Teachers will share moments from {child.name}&apos;s day here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentGallery({ user, mediaUploads, allChildren }) {
  const myChildren = (allChildren || []).filter((c) => user.childIds?.includes(c.id));
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
    <div className="page-content menu-page-bg">
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

function ParentDailyReports({ user, dailyReports, allChildren }) {
  const myChildren = (allChildren || []).filter((c) => user.childIds?.includes(c.id));
  const myReports = dailyReports.filter((r) => myChildren.some((c) => c.id === r.childId));

  const portionLabels = {
    full: <><span className="portion-dot">🟢</span> Full</>,
    half: <><span className="portion-dot">🟡</span> Half</>,
    none: <><span className="portion-dot">🔴</span> Didn&apos;t eat</>,
  };

  return (
    <div className="page-content menu-page-bg">
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
                    <strong>Items Needed</strong>
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
                    <strong>Notes</strong>
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
    <div className="page-content menu-page-bg">
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
    <div className="page-content menu-page-bg">
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
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Announcements</h2>
        <p>Events, meetings, days off, and important announcements</p>
      </div>
      <EventCalendar events={calendarEvents} />
    </div>
  );
}

function ParentDashboard({ user, onLogout, notifications, onMarkRead, dailyReports, calendarEvents, mediaUploads, weeklySchedule, weeklyMenu, chatMessages, onSendChat, allChildren, registeredUsers }) {
  const myChildren = (allChildren || []).filter((c) => user.childIds?.includes(c.id));
  const myGroup = myChildren[0]?.group || 'Bumble Bees';
  const groupMessages = chatMessages[myGroup] || [];

  // Scope notifications to this parent only:
  //  - Notifications without a childId are global (announcements, reminders) → keep
  //  - Notifications with a childId are only kept if the child belongs to this parent
  // This prevents a newly-signed-up parent from seeing another family's history.
  const myChildIds = new Set(myChildren.map((c) => c.id));
  const myNotifications = (notifications || []).filter(
    (n) => !n.childId || myChildIds.has(n.childId)
  );

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
      <Navbar user={user} onLogout={onLogout} notifications={myNotifications} onMarkRead={onMarkRead} />
      <div className="app-body">
        <Sidebar links={sidebarLinks} />
        <main className="main-content">
          <Routes>
            <Route index element={<ParentHome user={user} notifications={myNotifications} allChildren={allChildren} dailyReports={dailyReports} calendarEvents={calendarEvents} mediaUploads={mediaUploads} registeredUsers={registeredUsers} />} />
            <Route path="daily-reports" element={<ParentDailyReports user={user} dailyReports={dailyReports} allChildren={allChildren} />} />
            <Route path="schedule" element={<ParentSchedule weeklySchedule={weeklySchedule} />} />
            <Route path="menu" element={<ParentMenu weeklyMenu={weeklyMenu} />} />
            <Route path="gallery" element={<ParentGallery user={user} mediaUploads={mediaUploads} allChildren={allChildren} />} />
            <Route path="group-chat" element={<GroupChat user={user} messages={groupMessages} onSend={(msg) => onSendChat(myGroup, msg)} groupName={myGroup} />} />
            <Route path="calendar" element={<ParentCalendar calendarEvents={calendarEvents} />} />
            <Route path="*" element={<Navigate to="/parent" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default ParentDashboard;

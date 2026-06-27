import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import EventCalendar from '../components/EventCalendar';
import { usersApi } from '../api';

const GROUPS = ['Bumble Bees', 'Honey Bees', 'Busy Bees'];
const GROUP_LABELS = { 'Bumble Bees': 'Preschool', 'Honey Bees': 'KG1', 'Busy Bees': 'KG2' };
const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
];

/* ───────────────────── ADMIN HOME ───────────────────── */

function AdminHome({ registeredUsers, registeredChildren, dailyReports, calendarEvents, mediaUploads }) {
  const staff = registeredUsers.filter((u) => u.role === 'staff');
  const parents = registeredUsers.filter((u) => u.role === 'parent');
  const activeGroups = [...new Set(registeredChildren.map((c) => c.group))].length;

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = (calendarEvents || [])
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const recentReports = (dailyReports || []).slice(0, 5);
  const recentMedia = (mediaUploads || []).slice(0, 5);

  return (
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p>System overview for NestSync+</p>
      </div>

      <div className="stats-row">
        <StatsCard icon="" label="Total Children" value={registeredChildren.length} color="#2b3a4e" />
        <StatsCard icon="" label="Total Staff" value={staff.length} color="#7FA99B" />
        <StatsCard icon="" label="Total Parents" value={parents.length} color="#A8D5E2" />
        <StatsCard icon="" label="Active Groups" value={activeGroups} color="#F5D78E" />
      </div>

      <div className="dashboard-grid">
        {/* Staff by Group */}
        <div className="card">
          <div className="card-header"><h3>Staff by Group</h3></div>
          <div className="dash-activity-list">
            {GROUPS.map((g) => {
              const groupStaff = staff.filter((s) => s.group === g);
              return (
                <div key={g} className="dash-activity-item">
                  <div className="dash-activity-info">
                    <strong>{g} ({GROUP_LABELS[g]})</strong>
                    <span>{groupStaff.length > 0 ? groupStaff.map((s) => s.name).join(', ') : 'No staff assigned'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header"><h3>Recent Activity</h3></div>
          <div className="dash-activity-list">
            {recentReports.length > 0 ? recentReports.slice(0, 3).map((r) => (
              <div key={r.id} className="dash-activity-item">
                <div className="dash-activity-info">
                  <strong>Report: {r.childName}</strong>
                  <span>by {r.staffName}</span>
                </div>
                <span className="dash-activity-time">{r.date}</span>
              </div>
            )) : <p className="empty-state">No reports yet.</p>}
            {recentMedia.slice(0, 2).map((m) => (
              <div key={m.id} className="dash-activity-item">
                <div className="dash-activity-info">
                  <strong>{m.type === 'video' ? 'Video' : 'Photo'}: {m.caption}</strong>
                  <span>by {m.uploadedBy}</span>
                </div>
                <span className="dash-activity-time">{m.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Upcoming Announcements */}
        <div className="card">
          <div className="card-header"><h3>Upcoming Announcements</h3></div>
          <div className="dash-activity-list">
            {upcomingEvents.length > 0 ? upcomingEvents.map((e) => (
              <div key={e.id} className="dash-activity-item">
                <div className="dash-activity-info">
                  <strong>{e.title}</strong>
                  <span>{e.description || ''}</span>
                </div>
                <span className="dash-activity-time">{e.date}{e.time ? ` · ${e.time}` : ''}</span>
              </div>
            )) : <p className="empty-state">No upcoming announcements.</p>}
          </div>
        </div>

        {/* Children by Group */}
        <div className="card">
          <div className="card-header"><h3>Children by Group</h3></div>
          <div className="dash-activity-list">
            {GROUPS.map((g) => {
              const groupKids = registeredChildren.filter((c) => c.group === g);
              return (
                <div key={g} className="dash-activity-item">
                  <div className="dash-activity-info">
                    <strong>{g} ({GROUP_LABELS[g]})</strong>
                    <span>{groupKids.length} children</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── MANAGE STAFF ───────────────────── */

function AdminManageStaff({ registeredUsers, setRegisteredUsers }) {
  const staff = registeredUsers.filter((u) => u.role === 'staff');
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', group: '' });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const openAddForm = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', password: '', group: '' });
    setFormError('');
    setShowPassword(false);
    setShowForm(true);
  };

  const openEditForm = (s) => {
    setEditingStaff(s);
    setFormData({ name: s.name, email: s.email, password: s.password, group: s.group });
    setFormError('');
    setShowPassword(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStaff(null);
    setFormError('');
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) return setFormError('Name is required');
    if (!formData.email.trim()) return setFormError('Email is required');
    if (!formData.password || formData.password.length < 6) return setFormError('Password must be at least 6 characters');
    if (!formData.group) return setFormError('Please select a group');

    // Email uniqueness check (skip self when editing)
    const emailTaken = registeredUsers.some(
      (u) => u.email === formData.email && (!editingStaff || u.id !== editingStaff.id)
    );
    if (emailTaken) return setFormError('This email is already in use');
    if (formData.email === 'admin@nestsync.com') return setFormError('This email is reserved');

    try {
      if (editingStaff) {
        // UPDATE via API — saves to SQL Server
        const updated = await usersApi.update(editingStaff.id, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'staff',
          group: formData.group,
        });
        setRegisteredUsers((prev) =>
          prev.map((u) => (u.id === editingStaff.id ? updated : u))
        );
      } else {
        // CREATE via API — saves to SQL Server
        const created = await usersApi.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'staff',
          group: formData.group,
        });
        setRegisteredUsers((prev) => [...prev, created]);
      }
      closeForm();
    } catch (err) {
      setFormError(err.message || 'Could not save staff member');
    }
  };

  const handleDelete = async (id) => {
    try {
      await usersApi.delete(id);   // saves deletion to SQL Server
      setRegisteredUsers((prev) => prev.filter((u) => u.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message || 'Could not delete staff member');
    }
  };

  return (
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Manage Staff</h2>
        <p>Create, edit, and remove staff accounts</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Staff Accounts ({staff.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={openAddForm}>+ Add Staff</button>
        </div>

        {staff.length === 0 ? (
          <p className="empty-state">No staff accounts yet. Click &quot;+ Add Staff&quot; to create the first one.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Group</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td><span className="admin-group-badge">{s.group} ({GROUP_LABELS[s.group]})</span></td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-action-btn edit" onClick={() => openEditForm(s)} title="Edit">📝</button>
                        <button className="admin-action-btn delete" onClick={() => setConfirmDelete(s)} title="Delete">❌</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Staff Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingStaff ? 'Edit Staff Account' : 'Create Staff Account'}</h3>
              <button type="button" className="modal-close" onClick={closeForm}>×</button>
            </div>
            <form onSubmit={handleSubmit} autoComplete="off">
              {formError && <div className="login-error">{formError}</div>}
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Staff member's name" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Staff member's email" autoComplete="off" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="At least 6 characters" autoComplete="new-password" required />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Assigned Group</label>
                <select value={formData.group} onChange={(e) => setFormData({ ...formData, group: e.target.value })} required>
                  <option value="">Select group</option>
                  {GROUPS.map((g) => <option key={g} value={g}>{g} ({GROUP_LABELS[g]})</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingStaff ? 'Save Changes' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Staff Account</h3>
              <button type="button" className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <p className="confirm-text">
              Are you sure you want to delete <strong>{confirmDelete.name}</strong>&apos;s account ({confirmDelete.email})? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────── MANAGE PARENTS ───────────────────── */

function AdminManageParents({ registeredUsers, setRegisteredUsers, registeredChildren, setRegisteredChildren }) {
  const parents = registeredUsers.filter((u) => u.role === 'parent');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const getChildren = (parent) =>
    (registeredChildren || []).filter((c) => parent.childIds?.includes(c.id));

  const handleDelete = async (parent) => {
    try {
      // The API's DELETE /users/{id} automatically removes the parent's children too.
      await usersApi.delete(parent.id);
      const childIds = new Set(parent.childIds || []);
      setRegisteredChildren((prev) => prev.filter((c) => !childIds.has(c.id)));
      setRegisteredUsers((prev) => prev.filter((u) => u.id !== parent.id));
      setConfirmDelete(null);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message || 'Could not delete parent');
    }
  };

  return (
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Manage Parents</h2>
        <p>View all parent accounts and their children</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Parent Accounts ({parents.length})</h3>
        </div>

        {parents.length === 0 ? (
          <p className="empty-state">No parent accounts registered yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Parent Name</th>
                  <th>Email</th>
                  <th>Child</th>
                  <th>Group</th>
                  <th>Age</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parents.map((p) => {
                  const children = getChildren(p);
                  return children.length > 0 ? children.map((c, i) => (
                    <tr key={`${p.id}-${c.id}`}>
                      {i === 0 && <td rowSpan={children.length}>{p.name}</td>}
                      {i === 0 && <td rowSpan={children.length}>{p.email}</td>}
                      <td>{c.name}</td>
                      <td><span className="admin-group-badge">{c.group}</span></td>
                      <td>{c.age} yrs</td>
                      {i === 0 && (
                        <td rowSpan={children.length}>
                          <div className="admin-actions">
                            <button className="admin-action-btn delete" onClick={() => setConfirmDelete(p)} title="Delete">❌</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.email}</td>
                      <td colSpan={3}><span className="empty-state">No child linked</span></td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-action-btn delete" onClick={() => setConfirmDelete(p)} title="Delete">❌</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Parent Account</h3>
              <button type="button" className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <p className="confirm-text">
              Are you sure you want to delete <strong>{confirmDelete.name}</strong>&apos;s account? This will also remove their registered children. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────── ANNOUNCEMENTS ───────────────────── */

function AdminAnnouncements({ calendarEvents, onAddEvent, onEditEvent, onDeleteEvent }) {
  return (
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Announcements</h2>
        <p>Post and manage announcements for all groups</p>
      </div>
      <EventCalendar events={calendarEvents} editable onAddEvent={(e) => onAddEvent({ ...e, author: 'Admin' })} onEditEvent={onEditEvent} onDeleteEvent={onDeleteEvent} />
    </div>
  );
}

/* ───────────────────── SYSTEM OVERVIEW ───────────────────── */

function AdminSystemOverview({ user, dailyReports, mediaUploads, onAddMedia, onDeleteMedia, chatMessages, calendarEvents, onAddEvent, onEditEvent, onDeleteEvent, weeklySchedule, weeklyMenu, onUpdateSchedule, onUpdateMenu, registeredChildren }) {
  const [activeTab, setActiveTab] = useState('reports');

  const portionLabels = {
    full: <><span className="portion-dot">🟢</span> Full</>,
    half: <><span className="portion-dot">🟡</span> Half</>,
    none: <><span className="portion-dot">🔴</span> Didn&apos;t eat</>,
  };

  const tabs = [
    { key: 'reports', label: 'Daily Reports' },
    { key: 'media', label: 'Media' },
    { key: 'chat', label: 'Chat Logs' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'menu', label: 'Menu' },
  ];

  return (
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>System Overview</h2>
        <p>Manage all system data across groups</p>
      </div>

      <div className="admin-tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`admin-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Daily Reports — full parent-style view */}
      {activeTab === 'reports' && (
        <div className="card">
          <div className="card-header"><h3>All Daily Reports ({dailyReports.length})</h3></div>
          {dailyReports.length === 0 ? (
            <p className="empty-state">No daily reports in the system.</p>
          ) : (
            <div className="reports-grid">
              {dailyReports.map((r) => (
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
                    <div className="report-section">
                      <strong>Meals</strong>
                      <div className="report-meals-row">
                        <span>Breakfast: {portionLabels[r.breakfast] || '—'}</span>
                        <span>Lunch: {portionLabels[r.lunch] || '—'}</span>
                        <span>Snack: {portionLabels[r.snack] || '—'}</span>
                      </div>
                    </div>
                    {(r.napFrom || r.napTo) && (
                      <div className="report-section">
                        <strong>Nap</strong>
                        <p>{r.napFrom && r.napTo ? `${r.napFrom} — ${r.napTo}` : r.napFrom || r.napTo}{r.napNotes ? ` · ${r.napNotes}` : ''}</p>
                      </div>
                    )}
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
      )}

      {/* Media — with upload + delete */}
      {activeTab === 'media' && (
        <AdminMediaTab user={user} mediaUploads={mediaUploads} onAddMedia={onAddMedia} onDeleteMedia={onDeleteMedia} registeredChildren={registeredChildren} />
      )}

      {/* Chat Logs */}
      {activeTab === 'chat' && (
        <div className="admin-chat-logs">
          {GROUPS.map((group) => {
            const messages = chatMessages[group] || [];
            return (
              <div key={group} className="card">
                <div className="card-header">
                  <h3>{group} ({GROUP_LABELS[group]}) — {messages.length} messages</h3>
                </div>
                {messages.length === 0 ? (
                  <p className="empty-state">No messages in this group.</p>
                ) : (
                  <div className="admin-chat-list">
                    {messages.map((msg) => (
                      <div key={msg.id} className="admin-chat-msg">
                        <div className="admin-chat-sender">
                          <strong>{msg.sender}</strong>
                          <span className="admin-chat-role">{msg.role}</span>
                        </div>
                        <p className="admin-chat-text">{msg.text}</p>
                        {msg.media && <span className="admin-chat-media">Attachment: {msg.media.name || 'file'}</span>}
                        <span className="admin-chat-time">{msg.date} · {msg.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar — editable (add/edit/delete events) */}
      {activeTab === 'calendar' && (
        <EventCalendar events={calendarEvents} editable onAddEvent={(e) => onAddEvent({ ...e, author: 'Admin' })} onEditEvent={onEditEvent} onDeleteEvent={onDeleteEvent} />
      )}

      {/* Schedule — editable */}
      {activeTab === 'schedule' && (
        <AdminScheduleEditor weeklySchedule={weeklySchedule} onUpdateSchedule={onUpdateSchedule} />
      )}

      {/* Menu — editable */}
      {activeTab === 'menu' && (
        <AdminMenuEditor weeklyMenu={weeklyMenu} onUpdateMenu={onUpdateMenu} />
      )}
    </div>
  );
}

/* ───────────────── ADMIN: Media (upload + delete) ───────────────── */
function AdminMediaTab({ user, mediaUploads, onAddMedia, onDeleteMedia, registeredChildren }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState('');
  const [caption, setCaption] = useState('');
  const [mediaType, setMediaType] = useState('photo');
  const [preview, setPreview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type.startsWith('image/')) {
      setMediaType('photo');
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    } else if (f.type.startsWith('video/')) {
      setMediaType('video');
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caption.trim() || !selectedChild) return;
    const child = registeredChildren.find((c) => c.id === Number(selectedChild));
    onAddMedia({
      childId: Number(selectedChild),
      childName: child?.name || '',
      uploadedBy: user.name,
      caption,
      type: mediaType,
      url: preview || '',
    });
    setCaption('');
    setPreview(null);
    setSelectedChild('');
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>All Media ({mediaUploads.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Upload Media'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
          <div className="form-group">
            <label>Child</label>
            <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} required>
              <option value="">Select child</option>
              {registeredChildren.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.group})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Caption</label>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Playing with blocks" required />
          </div>
          <div className="form-group">
            <label>File</label>
            <input type="file" accept="image/*,video/*" onChange={handleFile} />
          </div>
          {preview && mediaType === 'photo' && <img src={preview} alt="preview" style={{ maxWidth: '200px', borderRadius: '8px' }} />}
          {preview && mediaType === 'video' && <video src={preview} controls style={{ maxWidth: '300px' }} />}
          <div style={{ marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary">Upload</button>
          </div>
        </form>
      )}

      {mediaUploads.length === 0 ? (
        <p className="empty-state">No media uploaded yet.</p>
      ) : (
        <div className="gallery-grid">
          {mediaUploads.map((m) => (
            <div key={m.id} className="gallery-item">
              {m.url && m.type === 'photo' ? (
                <div className="gallery-image">
                  <img src={m.url} alt={m.caption} />
                  <span className="media-badge">Photo</span>
                </div>
              ) : m.url && m.type === 'video' ? (
                <div className="gallery-image">
                  <video src={m.url} controls />
                  <span className="media-badge">Video</span>
                </div>
              ) : (
                <div className="gallery-placeholder">
                  {m.type === 'video' ? 'Video' : 'Photo'}
                  <span className="media-badge">{m.type === 'video' ? 'Video' : 'Photo'}</span>
                </div>
              )}
              <div className="gallery-info">
                <p>{m.caption}</p>
                <span>{m.date} — {m.childName} — by {m.uploadedBy}</span>
                <button className="btn btn-danger btn-sm" style={{ marginTop: '8px' }} onClick={() => setConfirmDelete(m)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Media</h3>
              <button type="button" className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <p className="confirm-text">Delete this {confirmDelete.type}? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { onDeleteMedia(confirmDelete.id); setConfirmDelete(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────── ADMIN: Schedule editor ───────────────── */
function AdminScheduleEditor({ weeklySchedule, onUpdateSchedule }) {
  const [schedule, setSchedule] = useState(weeklySchedule);
  const [editCell, setEditCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saved, setSaved] = useState(false);

  const startEdit = (rowIdx, dayKey) => { setEditCell({ rowIdx, dayKey }); setEditValue(schedule[rowIdx][dayKey]); };
  const saveEdit = () => { if (!editCell) return; setSchedule(schedule.map((row, i) => i === editCell.rowIdx ? { ...row, [editCell.dayKey]: editValue } : row)); setEditCell(null); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null); };
  const addRow = () => setSchedule([...schedule, { time: '', mon: '', tue: '', wed: '', thu: '', fri: '' }]);
  const removeRow = (idx) => setSchedule(schedule.filter((_, i) => i !== idx));
  const updateTime = (idx, val) => setSchedule(schedule.map((row, i) => i === idx ? { ...row, time: val } : row));
  const handleSave = () => { onUpdateSchedule(schedule); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Class Timetable</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {saved && <span className="badge badge-green">Saved!</span>}
          <button className="btn btn-save-schedule btn-sm" onClick={handleSave}>Save</button>
        </div>
      </div>
      <div className="weekly-table-wrap">
        <table className="weekly-table">
          <thead>
            <tr>
              <th className="wt-time-col">Time</th>
              {DAYS.map((d) => <th key={d.key}>{d.label}</th>)}
              <th className="wt-action-col"></th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="wt-time-cell">
                  <input type="text" className="wt-time-input" value={row.time} onChange={(e) => updateTime(rowIdx, e.target.value)} placeholder="e.g. 8:00 - 8:30" />
                </td>
                {DAYS.map((d) => (
                  <td key={d.key} className={`wt-cell ${editCell?.rowIdx === rowIdx && editCell?.dayKey === d.key ? 'editing' : ''}`} onClick={() => startEdit(rowIdx, d.key)}>
                    {editCell?.rowIdx === rowIdx && editCell?.dayKey === d.key ? (
                      <input className="wt-cell-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={handleKeyDown} autoFocus />
                    ) : (
                      <span className="wt-cell-text">{row[d.key] || <span className="wt-empty">—</span>}</span>
                    )}
                  </td>
                ))}
                <td className="wt-action-col">
                  <button className="wt-remove-btn" onClick={() => removeRow(rowIdx)} title="Remove row">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <button className="btn btn-outline btn-sm" onClick={addRow}>+ Add Time Slot</button>
      </div>
    </div>
  );
}

/* ───────────────── ADMIN: Menu editor ───────────────── */
function AdminMenuEditor({ weeklyMenu, onUpdateMenu }) {
  const [menu, setMenu] = useState(weeklyMenu);
  const [editCell, setEditCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saved, setSaved] = useState(false);

  const startEdit = (rowIdx, dayKey) => { setEditCell({ rowIdx, dayKey }); setEditValue(menu[rowIdx][dayKey]); };
  const saveEdit = () => { if (!editCell) return; setMenu(menu.map((row, i) => i === editCell.rowIdx ? { ...row, [editCell.dayKey]: editValue } : row)); setEditCell(null); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null); };
  const updateMealTime = (idx, val) => setMenu(menu.map((row, i) => i === idx ? { ...row, time: val } : row));
  const handleSave = () => { onUpdateMenu(menu); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Meal Plan</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {saved && <span className="badge badge-green">Saved!</span>}
          <button className="btn btn-save-menu btn-sm" onClick={handleSave}>Save</button>
        </div>
      </div>
      <div className="weekly-table-wrap">
        <table className="weekly-table menu-table">
          <thead>
            <tr>
              <th className="wt-meal-col">Meal</th>
              <th className="wt-mealtime-col">Time</th>
              {DAYS.map((d) => <th key={d.key}>{d.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {menu.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="wt-meal-cell">{row.meal}</td>
                <td className="wt-mealtime-cell">
                  <input type="text" className="wt-time-input" value={row.time} onChange={(e) => updateMealTime(rowIdx, e.target.value)} />
                </td>
                {DAYS.map((d) => (
                  <td key={d.key} className={`wt-cell ${editCell?.rowIdx === rowIdx && editCell?.dayKey === d.key ? 'editing' : ''}`} onClick={() => startEdit(rowIdx, d.key)}>
                    {editCell?.rowIdx === rowIdx && editCell?.dayKey === d.key ? (
                      <input className="wt-cell-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={handleKeyDown} autoFocus />
                    ) : (
                      <span className="wt-cell-text">{row[d.key] || <span className="wt-empty">—</span>}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────────── MAIN LAYOUT ───────────────────── */

function AdminDashboard({ user, onLogout, registeredUsers, setRegisteredUsers, registeredChildren, setRegisteredChildren, dailyReports, calendarEvents, onAddEvent, onEditEvent, onDeleteEvent, mediaUploads, onAddMedia, onDeleteMedia, chatMessages, weeklySchedule, weeklyMenu, onUpdateSchedule, onUpdateMenu, notifications }) {
  const sidebarLinks = [
    { to: '/admin', icon: '', label: 'Home' },
    { to: '/admin/manage-staff', icon: '', label: 'Manage Staff' },
    { to: '/admin/manage-parents', icon: '', label: 'Manage Parents' },
    { to: '/admin/announcements', icon: '', label: 'Announcements' },
    { to: '/admin/system-overview', icon: '', label: 'System Overview' },
  ];

  return (
    <div className="app-layout">
      <Navbar user={user} onLogout={onLogout} />
      <div className="app-body">
        <Sidebar links={sidebarLinks} />
        <main className="main-content">
          <Routes>
            <Route index element={<AdminHome registeredUsers={registeredUsers} registeredChildren={registeredChildren} dailyReports={dailyReports} calendarEvents={calendarEvents} mediaUploads={mediaUploads} />} />
            <Route path="manage-staff" element={<AdminManageStaff registeredUsers={registeredUsers} setRegisteredUsers={setRegisteredUsers} />} />
            <Route path="manage-parents" element={<AdminManageParents registeredUsers={registeredUsers} setRegisteredUsers={setRegisteredUsers} registeredChildren={registeredChildren} setRegisteredChildren={setRegisteredChildren} />} />
            <Route path="announcements" element={<AdminAnnouncements calendarEvents={calendarEvents} onAddEvent={onAddEvent} onEditEvent={onEditEvent} onDeleteEvent={onDeleteEvent} />} />
            <Route path="system-overview" element={<AdminSystemOverview user={user} dailyReports={dailyReports} mediaUploads={mediaUploads} onAddMedia={onAddMedia} onDeleteMedia={onDeleteMedia} chatMessages={chatMessages} calendarEvents={calendarEvents} onAddEvent={onAddEvent} onEditEvent={onEditEvent} onDeleteEvent={onDeleteEvent} weeklySchedule={weeklySchedule} weeklyMenu={weeklyMenu} onUpdateSchedule={onUpdateSchedule} onUpdateMenu={onUpdateMenu} registeredChildren={registeredChildren} />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;

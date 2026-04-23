import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import ChildSelector from '../components/ChildSelector';
import EventCalendar from '../components/EventCalendar';
import GroupChat from '../components/GroupChat';
import ChildAvatar from '../components/ChildAvatar';
import { resizeImageFile } from '../utils/image';
/* ───────────────────── DASHBOARD ───────────────────── */

function StaffHome({ user, groupChildren, dailyReports, mediaUploads, calendarEvents, weeklySchedule, weeklyMenu }) {
  const myReports = (dailyReports || []).filter((r) => r.staffName === user.name);
  const myMedia = (mediaUploads || []).filter((m) => m.uploadedBy === user.name);

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const validDays = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const rawKey = dayKeys[today.getDay()];
  const todayKey = validDays.includes(rawKey) ? rawKey : 'mon';
  const isWeekend = !validDays.includes(rawKey);
  const dayLabel = isWeekend ? 'Monday (weekend preview)' : dayNames[today.getDay()];

  const upcomingEvents = (calendarEvents || [])
    .filter((e) => e.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const recentReports = myReports.slice(0, 4);
  const childrenWithoutReportToday = groupChildren.filter(
    (c) => !myReports.some((r) => r.childId === c.id && r.date === todayIso)
  );

  const eventIcon = { event: '🎉', meeting: '👥', health: '🏥', offday: '🏖️' };

  return (
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Hello {user.name.split(' ')[0]} 👋</h2>
        <p>Today is {dayNames[today.getDay()]} — here&apos;s your {user.group || 'class'} overview</p>
      </div>

      {childrenWithoutReportToday.length > 0 && groupChildren.length > 0 && !isWeekend && (
        <div className="notif-banner">
          <span className="notif-banner-icon">📋</span>
          <span>
            {childrenWithoutReportToday.length} child{childrenWithoutReportToday.length > 1 ? 'ren' : ''} still need a daily report today.
          </span>
        </div>
      )}

      <div className="stats-row">
        <StatsCard icon="" label="My Group Children" value={groupChildren.length} color="#2b3a4e" />
        <StatsCard icon="" label="Reports Sent" value={myReports.length} color="#7FA99B" />
        <StatsCard icon="" label="Media Uploaded" value={myMedia.length} color="#A8D5E2" />
        <StatsCard icon="" label="Upcoming Events" value={upcomingEvents.length} color="#F5D78E" />
      </div>

      <div className="dashboard-grid">
        {/* My Group children list */}
        <div className="card">
          <div className="card-header">
            <h3>My Group — {user.group || '—'}</h3>
          </div>
          <div className="dash-activity-list">
            {groupChildren.length > 0 ? (
              groupChildren.map((c) => (
                <div key={c.id} className="dash-activity-item">
                  <ChildAvatar avatar={c.avatar} name={c.name} size="sm" />
                  <div className="dash-activity-info">
                    <strong>{c.name}</strong>
                    <span>
                      {c.age} years · {c.bloodType || '—'}
                      {c.allergies && c.allergies !== 'None' ? ` · ⚠ ${c.allergies}` : ''}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">No children in your group yet. They will appear here once parents sign them up.</p>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="card">
          <div className="card-header">
            <h3>Today&apos;s Schedule — {dayLabel}</h3>
          </div>
          <div className="dash-activity-list">
            {weeklySchedule && weeklySchedule.length > 0 ? (
              weeklySchedule.map((row, i) => (
                <div key={i} className="dash-activity-item">
                  <div className="dash-activity-info">
                    <strong>{row[todayKey] || '—'}</strong>
                    <span>{row.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">No schedule set up yet. Add one in Weekly Schedule.</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Today's Menu */}
        <div className="card">
          <div className="card-header">
            <h3>Today&apos;s Menu — {dayLabel}</h3>
          </div>
          <div className="dash-activity-list">
            {weeklyMenu && weeklyMenu.length > 0 ? (
              weeklyMenu.map((row, i) => (
                <div key={i} className="dash-activity-item">
                  <div className="dash-activity-info">
                    <strong>{row.meal}</strong>
                    <span>{row[todayKey] || '—'}</span>
                  </div>
                  <span className="dash-activity-time">{row.time}</span>
                </div>
              ))
            ) : (
              <p className="empty-state">No menu set up yet. Add one in Weekly Menu.</p>
            )}
          </div>
        </div>

        {/* My Recent Reports */}
        <div className="card">
          <div className="card-header">
            <h3>My Recent Daily Reports</h3>
          </div>
          <div className="dash-activity-list">
            {recentReports.length > 0 ? (
              recentReports.map((r) => (
                <div key={r.id} className="dash-activity-item">
                  <div className="dash-activity-info">
                    <strong>{r.childName}</strong>
                    <span>Mood: {r.mood}</span>
                  </div>
                  <span className="dash-activity-time">{r.date}</span>
                </div>
              ))
            ) : (
              <p className="empty-state">You haven&apos;t sent any reports yet. Head to Daily Report to send your first one.</p>
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
              <p className="empty-state">No upcoming announcements. Add one from the Announcements page.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── DAILY REPORT ──────────────── */

const PORTION_OPTIONS = [
  { value: 'full', label: 'Full', icon: '' },
  { value: 'half', label: 'Half', icon: '' },
  { value: 'none', label: 'Didn\'t eat', icon: '' },
];

function StaffDailyReport({ user, onAddReport, groupChildren }) {
  const children = groupChildren;
  const [selectedChild, setSelectedChild] = useState(children[0]?.id);
  const [sent, setSent] = useState(false);

  const [report, setReport] = useState({
    mood: 'happy',
    breakfast: 'full',
    lunch: 'full',
    snack: 'full',
    napFrom: '',
    napTo: '',
    napNotes: '',
    diapers: [
      { type: 'wet', time: '' },
      { type: 'wet', time: '' },
      { type: 'soiled', time: '' },
    ],
    itemsNeeded: [],
    customItem: '',
    notes: '',
  });

  const supplyItems = ['Diapers', 'Milk', 'Tissues', 'Wipes', 'Extra Clothes', 'Snacks', 'Formula', 'Sunscreen'];

  const toggleItem = (item) => {
    setReport((r) => ({
      ...r,
      itemsNeeded: r.itemsNeeded.includes(item) ? r.itemsNeeded.filter((i) => i !== item) : [...r.itemsNeeded, item],
    }));
  };

  const addCustomItem = () => {
    if (report.customItem.trim() && !report.itemsNeeded.includes(report.customItem.trim())) {
      setReport({ ...report, itemsNeeded: [...report.itemsNeeded, report.customItem.trim()], customItem: '' });
    }
  };

  const addDiaper = () => setReport({ ...report, diapers: [...report.diapers, { type: 'wet', time: '' }] });
  const removeDiaper = (idx) => setReport({ ...report, diapers: report.diapers.filter((_, i) => i !== idx) });
  const updateDiaper = (idx, field, val) => setReport({ ...report, diapers: report.diapers.map((d, i) => i === idx ? { ...d, [field]: val } : d) });

  const handleSubmit = (e) => {
    e.preventDefault();
    const child = children.find((c) => c.id === selectedChild);
    onAddReport({
      childId: selectedChild,
      childName: child?.name || '',
      staffName: user.name,
      ...report,
    });
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setReport({
      mood: 'happy', breakfast: 'full', lunch: 'full', snack: 'full',
      napFrom: '', napTo: '', napNotes: '',
      diapers: [{ type: 'wet', time: '' }],
      itemsNeeded: [], customItem: '', notes: '',
    });
  };

  return (
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Daily Report</h2>
        <p>Fill in the daily report for each child and send it to their parents</p>
      </div>

      <ChildSelector children={children} selectedId={selectedChild} onSelect={(id) => { setSelectedChild(id); setSent(false); }} />

      {sent && (
        <div className="notif-banner" style={{ marginBottom: '16px' }}>
          <span className="notif-banner-icon">✅</span>
          <span>Report sent successfully! The parent has been notified.</span>
        </div>
      )}

      <form className="report-form-grid" onSubmit={handleSubmit}>
        {/* Mood */}
        <div className="card report-section-card">
          <div className="card-header"><h3>Mood</h3></div>
          <div className="mood-selector" style={{ padding: '16px' }}>
            {[
              { value: 'happy', icon: '', label: 'Happy' },
              { value: 'calm', icon: '', label: 'Calm' },
              { value: 'tired', icon: '', label: 'Tired' },
              { value: 'fussy', icon: '', label: 'Fussy' },
              { value: 'energetic', icon: '', label: 'Energetic' },
            ].map((m) => (
              <button key={m.value} type="button" className={`mood-option ${report.mood === m.value ? 'active' : ''}`} onClick={() => setReport({ ...report, mood: m.value })}>
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Meals */}
        <div className="card report-section-card">
          <div className="card-header"><h3>Meals</h3></div>
          <div className="meals-grid">
            {[
              { key: 'breakfast', label: 'Breakfast' },
              { key: 'lunch', label: 'Lunch' },
              { key: 'snack', label: 'Snack' },
            ].map((meal) => (
              <div key={meal.key} className="meal-row">
                <span className="meal-label">{meal.label}</span>
                <div className="portion-options">
                  {PORTION_OPTIONS.map((p) => (
                    <button key={p.value} type="button" className={`portion-btn ${report[meal.key] === p.value ? 'active' : ''}`} onClick={() => setReport({ ...report, [meal.key]: p.value })}>
                      <span>{p.icon}</span> {p.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nap */}
        <div className="card report-section-card">
          <div className="card-header"><h3>Nap</h3></div>
          <div style={{ padding: '16px' }}>
            <div className="form-row">
              <div className="form-group">
                <label>From</label>
                <input type="time" value={report.napFrom} onChange={(e) => setReport({ ...report, napFrom: e.target.value })} />
              </div>
              <div className="form-group">
                <label>To</label>
                <input type="time" value={report.napTo} onChange={(e) => setReport({ ...report, napTo: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input type="text" value={report.napNotes} onChange={(e) => setReport({ ...report, napNotes: e.target.value })} placeholder="e.g. Slept well, woke up once..." />
            </div>
          </div>
        </div>

        {/* Diaper */}
        <div className="card report-section-card">
          <div className="card-header">
            <h3>Diaper Changes</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={addDiaper}>+ Add Change</button>
          </div>
          <div className="diaper-list">
            {report.diapers.map((d, idx) => (
              <div key={idx} className="diaper-row">
                <span className="diaper-num">#{idx + 1}</span>
                <div className="diaper-type-btns">
                  <button type="button" className={`diaper-type-btn ${d.type === 'wet' ? 'active wet' : ''}`} onClick={() => updateDiaper(idx, 'type', 'wet')}>
                    💧 Wet
                  </button>
                  <button type="button" className={`diaper-type-btn ${d.type === 'soiled' ? 'active soiled' : ''}`} onClick={() => updateDiaper(idx, 'type', 'soiled')}>
                    💩 Soiled
                  </button>
                  <button type="button" className={`diaper-type-btn ${d.type === 'both' ? 'active both' : ''}`} onClick={() => updateDiaper(idx, 'type', 'both')}>
                    💧💩 Both
                  </button>
                </div>
                <input type="time" className="diaper-time" value={d.time} onChange={(e) => updateDiaper(idx, 'time', e.target.value)} />
                <button type="button" className="wt-remove-btn" onClick={() => removeDiaper(idx)} title="Remove">✕</button>
              </div>
            ))}
            {report.diapers.length === 0 && <p className="empty-state">No diaper changes recorded</p>}
          </div>
        </div>

        {/* Items needed */}
        <div className="card report-section-card">
          <div className="card-header"><h3>Items Needed from Parents</h3></div>
          <div style={{ padding: '16px' }}>
            <div className="supply-items-grid">
              {supplyItems.map((item) => (
                <button key={item} type="button" className={`supply-item ${report.itemsNeeded.includes(item) ? 'selected' : ''}`} onClick={() => toggleItem(item)}>
                  {report.itemsNeeded.includes(item) ? '✓ ' : ''}{item}
                </button>
              ))}
            </div>
            <div className="custom-item-row" style={{ marginTop: '10px' }}>
              <input type="text" value={report.customItem} onChange={(e) => setReport({ ...report, customItem: e.target.value })} placeholder="Other item..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomItem(); } }} />
              <button type="button" className="btn btn-outline btn-sm" onClick={addCustomItem}>Add</button>
            </div>
            {report.itemsNeeded.length > 0 && (
              <div className="selected-summary" style={{ marginTop: '10px' }}><strong>Requested:</strong> {report.itemsNeeded.join(', ')}</div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="card report-section-card">
          <div className="card-header"><h3>Additional Notes</h3></div>
          <div style={{ padding: '16px' }}>
            <textarea value={report.notes} onChange={(e) => setReport({ ...report, notes: e.target.value })} placeholder="Anything else parents should know..." rows={3} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full" style={{ padding: '14px', fontSize: '16px' }}>
          Send Daily Report to Parent
        </button>
      </form>
    </div>
  );
}

/* ───────────────────── ATTENDANCE ───────────────────── */

function StaffAttendance({ groupChildren }) {
  const children = groupChildren;
  const [attendanceState, setAttendanceState] = useState(() => {
    return children.map((child) => ({
      childId: child.id,
      status: 'absent',
      checkIn: '',
      checkOut: '',
    }));
  });

  const updateAttendance = (childId, field, value) => {
    setAttendanceState((prev) => prev.map((a) => (a.childId === childId ? { ...a, [field]: value } : a)));
  };

  return (
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Attendance</h2>
        <p>Manage daily check-in and check-out</p>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Child</th><th>Group</th><th>Status</th><th>Check-in</th><th>Check-out</th></tr>
          </thead>
          <tbody>
            {children.map((child) => {
              const record = attendanceState.find((a) => a.childId === child.id);
              return (
                <tr key={child.id}>
                  <td><span className="table-child"><ChildAvatar avatar={child.avatar} name={child.name} size="sm" /> {child.name}</span></td>
                  <td>{child.group}</td>
                  <td>
                    <select className="table-select" value={record?.status} onChange={(e) => updateAttendance(child.id, 'status', e.target.value)}>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </td>
                  <td><input type="time" className="table-input" value={record?.checkIn} onChange={(e) => updateAttendance(child.id, 'checkIn', e.target.value)} /></td>
                  <td><input type="time" className="table-input" value={record?.checkOut} onChange={(e) => updateAttendance(child.id, 'checkOut', e.target.value)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────────── MEDIA UPLOAD ───────────────────── */

function StaffMedia({ user, onAddMedia, groupChildren }) {
  const children = groupChildren;
  const [selectedChild, setSelectedChild] = useState(children[0]?.id);
  const [mediaType, setMediaType] = useState('photo');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploaded, setUploaded] = useState([]);

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      setMediaType('photo');
      try {
        // Resize media photos a bit larger than avatars so they look good in the gallery.
        const dataUrl = await resizeImageFile(f, { maxEdge: 720, quality: 0.78 });
        setPreview(dataUrl);
      } catch {
        setPreview(null);
      }
    } else if (f.type.startsWith('video/')) {
      setMediaType('video');
      // Object URLs don't survive a reload, but they keep videos out of localStorage
      // (videos would blow the 5MB quota instantly).
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caption.trim()) return;
    const child = children.find((c) => c.id === selectedChild);
    const newMedia = { childId: selectedChild, childName: child?.name || '', uploadedBy: user.name, caption, type: mediaType, url: preview || '' };
    onAddMedia(newMedia);
    setUploaded([{ id: Date.now(), ...newMedia, date: '2026-04-01' }, ...uploaded]);
    setCaption('');
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Media</h2>
        <p>Upload photos and videos for children — parents get notified</p>
      </div>

      <ChildSelector children={children} selectedId={selectedChild} onSelect={setSelectedChild} />

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h3>Upload</h3></div>
          <form className="activity-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Choose File</label>
              <div className="file-upload-area">
                <input type="file" accept="image/*,video/*" onChange={handleFileChange} id="media-file" className="file-input-hidden" />
                <label htmlFor="media-file" className="file-upload-label">
                  {file ? <span>✅ {file.name}</span> : (
                    <>
                      <span className="upload-icon">📁</span>
                      <span>Click to choose a photo or video</span>
                      <span className="upload-hint">JPG, PNG, MP4, MOV</span>
                    </>
                  )}
                </label>
              </div>
            </div>
            {preview && (
              <div className="media-preview">
                {mediaType === 'photo' ? <img src={preview} alt="Preview" /> : <video src={preview} controls />}
              </div>
            )}
            <div className="form-group">
              <label>Type</label>
              <div className="request-type-selector">
                <button type="button" className={`request-type-option ${mediaType === 'photo' ? 'active' : ''}`} onClick={() => setMediaType('photo')}>📸 Photo</button>
                <button type="button" className={`request-type-option ${mediaType === 'video' ? 'active' : ''}`} onClick={() => setMediaType('video')}>🎬 Video</button>
              </div>
            </div>
            <div className="form-group">
              <label>Caption</label>
              <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Describe what's happening..." required />
            </div>
            <button type="submit" className="btn btn-primary">Upload & Notify Parent</button>
          </form>
        </div>

        <div className="card">
          <div className="card-header"><h3>Uploaded Today</h3></div>
          {uploaded.length === 0 ? (
            <p className="empty-state">No uploads yet</p>
          ) : (
            <div className="upload-list">
              {uploaded.map((m) => (
                <div key={m.id} className="upload-item">
                  <div className="upload-item-icon">{m.type === 'video' ? '🎬' : '📸'}</div>
                  <div className="upload-item-info">
                    <strong>{m.childName}</strong>
                    <p>{m.caption}</p>
                    <span className="note-date">{m.date}</span>
                  </div>
                  <span className="badge badge-green">Sent</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ───────────────────── WEEKLY SCHEDULE ───────────────────── */

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
];

function StaffSchedule({ weeklySchedule, onUpdateSchedule }) {
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
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Weekly Schedule</h2>
        <p>Set the class timetable — click any cell to edit</p>
      </div>
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
    </div>
  );
}

/* ───────────────────── WEEKLY MENU ───────────────────── */

function StaffMenu({ weeklyMenu, onUpdateMenu }) {
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
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Weekly Menu</h2>
        <p>Set the meal plan for each day — click any cell to edit</p>
      </div>
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
                    <input type="text" className="wt-time-input" value={row.time} onChange={(e) => updateMealTime(rowIdx, e.target.value)} placeholder="e.g. 9:30 AM" />
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
    </div>
  );
}

/* ───────────────────── CALENDAR ───────────────────── */

function StaffCalendar({ calendarEvents, onAddEvent, onEditEvent, onDeleteEvent }) {
  return (
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Announcements</h2>
        <p>Schedule events, meetings, days off, and health announcements</p>
      </div>
      <EventCalendar events={calendarEvents} editable onAddEvent={onAddEvent} onEditEvent={onEditEvent} onDeleteEvent={onDeleteEvent} />
    </div>
  );
}

/* ───────────────────── STAFF GROUP CHAT ───────────────────── */

const GROUPS = ['Bumble Bees', 'Honey Bees', 'Busy Bees'];
const GROUP_LABELS = { 'Bumble Bees': 'Preschool', 'Honey Bees': 'KG1', 'Busy Bees': 'KG2' };

function StaffGroupChat({ user, chatMessages, onSendChat }) {
  const [activeGroup, setActiveGroup] = useState(user.group || GROUPS[0]);
  const groupMessages = chatMessages[activeGroup] || [];

  return (
    <div className="page-content menu-page-bg">
      <div className="page-header">
        <h2>Group Chat</h2>
        <p>Chat with parents by class group</p>
      </div>
      <div className="group-tabs">
        {GROUPS.map((g) => (
          <button
            key={g}
            className={`group-tab ${activeGroup === g ? 'active' : ''}`}
            onClick={() => setActiveGroup(g)}
          >
            {g} <span className="group-tab-level">({GROUP_LABELS[g]})</span>
          </button>
        ))}
      </div>
      <GroupChat user={user} messages={groupMessages} onSend={(msg) => onSendChat(activeGroup, msg)} groupName={activeGroup} embedded />
    </div>
  );
}

/* ───────────────────── MAIN LAYOUT ───────────────────── */

function StaffDashboard({ user, onLogout, onAddReport, onAddEvent, onEditEvent, onDeleteEvent, onAddMedia, onUpdateSchedule, onUpdateMenu, calendarEvents, weeklySchedule, weeklyMenu, chatMessages, onSendChat, allChildren, dailyReports, mediaUploads }) {
  const groupChildren = (allChildren || []).filter((c) => !user.group || c.group === user.group);

  const sidebarLinks = [
    { to: '/staff', icon: '', label: 'Dashboard' },
    { to: '/staff/daily-report', icon: '', label: 'Daily Report' },
    { to: '/staff/schedule', icon: '', label: 'Weekly Schedule' },
    { to: '/staff/menu', icon: '', label: 'Weekly Menu' },
    { to: '/staff/attendance', icon: '', label: 'Attendance' },
    { to: '/staff/media', icon: '', label: 'Media' },
    { to: '/staff/calendar', icon: '', label: 'Announcements' },
    { to: '/staff/group-chat', icon: '', label: 'Group Chat' },
  ];

  return (
    <div className="app-layout">
      <Navbar user={user} onLogout={onLogout} />
      <div className="app-body">
        <Sidebar links={sidebarLinks} />
        <main className="main-content">
          <Routes>
            <Route index element={<StaffHome user={user} groupChildren={groupChildren} dailyReports={dailyReports} mediaUploads={mediaUploads} calendarEvents={calendarEvents} weeklySchedule={weeklySchedule} weeklyMenu={weeklyMenu} />} />
            <Route path="daily-report" element={<StaffDailyReport user={user} onAddReport={onAddReport} groupChildren={groupChildren} />} />
            <Route path="schedule" element={<StaffSchedule weeklySchedule={weeklySchedule} onUpdateSchedule={onUpdateSchedule} />} />
            <Route path="menu" element={<StaffMenu weeklyMenu={weeklyMenu} onUpdateMenu={onUpdateMenu} />} />
            <Route path="attendance" element={<StaffAttendance groupChildren={groupChildren} />} />
            <Route path="media" element={<StaffMedia user={user} onAddMedia={onAddMedia} groupChildren={groupChildren} />} />
            <Route path="calendar" element={<StaffCalendar calendarEvents={calendarEvents} onAddEvent={onAddEvent} onEditEvent={onEditEvent} onDeleteEvent={onDeleteEvent} />} />
            <Route path="group-chat" element={<StaffGroupChat user={user} chatMessages={chatMessages} onSendChat={onSendChat} />} />
            <Route path="*" element={<Navigate to="/staff" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default StaffDashboard;

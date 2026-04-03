import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import ChildSelector from '../components/ChildSelector';
import EventCalendar from '../components/EventCalendar';
import GroupChat from '../components/GroupChat';
import ChildAvatar from '../components/ChildAvatar';
import { children, activities, attendance } from '../data/mockData';

/* ───────────────────── DASHBOARD ───────────────────── */

function StaffHome() {
  const todayAttendance = attendance.filter((a) => a.date === '2026-04-01');
  const present = todayAttendance.filter((a) => a.status === 'present').length;
  const absent = todayAttendance.filter((a) => a.status === 'absent').length;

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Staff Dashboard</h2>
        <p>Overview of today&apos;s nursery activities</p>
      </div>

      <div className="stats-row">
        <StatsCard icon="" label="Total Children" value={children.length} color="#9cb89e" />
        <StatsCard icon="" label="Present Today" value={present} color="#9cb89e" />
        <StatsCard icon="" label="Absent Today" value={absent} color="#ef4444" />
        <StatsCard icon="" label="Activities Logged" value={activities.filter((a) => a.date === '2026-04-01').length} color="#f59e0b" />
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Attendance Today</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Child</th><th>Group</th><th>Status</th><th>Check-in</th><th>Check-out</th></tr>
          </thead>
          <tbody>
            {children.map((child) => {
              const record = todayAttendance.find((a) => a.childId === child.id);
              return (
                <tr key={child.id}>
                  <td><span className="table-child"><ChildAvatar avatar={child.avatar} name={child.name} size="sm" /> {child.name}</span></td>
                  <td>{child.group}</td>
                  <td>
                    <span className={`badge ${record?.status === 'present' ? 'badge-green' : 'badge-red'}`}>
                      {record?.status || 'N/A'}
                    </span>
                  </td>
                  <td>{record?.checkIn || '—'}</td>
                  <td>{record?.checkOut || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────── DAILY REPORT ──────────────── */

const PORTION_OPTIONS = [
  { value: 'full', label: 'Full', icon: '🟢' },
  { value: 'half', label: 'Half', icon: '🟡' },
  { value: 'none', label: 'Didn\'t eat', icon: '🔴' },
];

function StaffDailyReport({ user, onAddReport }) {
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
    <div className="page-content">
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

function StaffAttendance() {
  const [attendanceState, setAttendanceState] = useState(() => {
    return children.map((child) => {
      const record = attendance.find((a) => a.childId === child.id && a.date === '2026-04-01');
      return { childId: child.id, status: record?.status || 'absent', checkIn: record?.checkIn || '', checkOut: record?.checkOut || '' };
    });
  });

  const updateAttendance = (childId, field, value) => {
    setAttendanceState((prev) => prev.map((a) => (a.childId === childId ? { ...a, [field]: value } : a)));
  };

  return (
    <div className="page-content">
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

function StaffMedia({ user, onAddMedia }) {
  const [selectedChild, setSelectedChild] = useState(children[0]?.id);
  const [mediaType, setMediaType] = useState('photo');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploaded, setUploaded] = useState([]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      setMediaType('photo');
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else if (f.type.startsWith('video/')) {
      setMediaType('video');
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
    <div className="page-content">
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
    <div className="page-content">
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
    <div className="page-content">
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
    <div className="page-content">
      <div className="page-header">
        <h2>Announcements</h2>
        <p>Schedule events, meetings, days off, and health announcements</p>
      </div>
      <EventCalendar events={calendarEvents} editable onAddEvent={onAddEvent} onEditEvent={onEditEvent} onDeleteEvent={onDeleteEvent} />
    </div>
  );
}

/* ───────────────────── MAIN LAYOUT ───────────────────── */

function StaffDashboard({ user, onLogout, onAddReport, onAddEvent, onEditEvent, onDeleteEvent, onAddMedia, onUpdateSchedule, onUpdateMenu, calendarEvents, weeklySchedule, weeklyMenu, chatMessages, onSendChat }) {
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
            <Route index element={<StaffHome />} />
            <Route path="daily-report" element={<StaffDailyReport user={user} onAddReport={onAddReport} />} />
            <Route path="schedule" element={<StaffSchedule weeklySchedule={weeklySchedule} onUpdateSchedule={onUpdateSchedule} />} />
            <Route path="menu" element={<StaffMenu weeklyMenu={weeklyMenu} onUpdateMenu={onUpdateMenu} />} />
            <Route path="attendance" element={<StaffAttendance />} />
            <Route path="media" element={<StaffMedia user={user} onAddMedia={onAddMedia} />} />
            <Route path="calendar" element={<StaffCalendar calendarEvents={calendarEvents} onAddEvent={onAddEvent} onEditEvent={onEditEvent} onDeleteEvent={onDeleteEvent} />} />
            <Route path="group-chat" element={<GroupChat user={user} messages={chatMessages} onSend={onSendChat} />} />
            <Route path="*" element={<Navigate to="/staff" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default StaffDashboard;

import { useState } from 'react';

const typeStyles = {
  event: { color: '#C5B3D5', bg: '#C5B3D530', icon: '🎉', label: 'Event' },
  meeting: { color: '#C5B3D5', bg: '#C5B3D530', icon: '👥', label: 'Meeting' },
  health: { color: '#C5B3D5', bg: '#C5B3D530', icon: '🩺', label: 'Health' },
  offday: { color: '#C5B3D5', bg: '#C5B3D530', icon: '🚫', label: 'Day Off' },
};

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function EventCalendar({ events, editable, onAddEvent, onEditEvent, onDeleteEvent }) {
  const today = new Date(2026, 3, 2);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({ title: '', time: '', type: 'event', description: '' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const toDateStr = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const getEventsForDay = (day) => day ? events.filter((e) => e.date === toDateStr(day)) : [];
  const isToday = (day) => day && year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  const prevMonth = () => { if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1); setSelectedDate(null); setShowForm(false); setEditingEvent(null); };
  const nextMonth = () => { if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1); setSelectedDate(null); setShowForm(false); setEditingEvent(null); };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDate(today.getDate()); setShowForm(false); setEditingEvent(null); };

  const openAddForm = () => {
    setEditingEvent(null);
    setFormData({ title: '', time: '', type: 'event', description: '' });
    setShowForm(true);
  };

  const openEditForm = (event) => {
    setEditingEvent(event);
    setFormData({ title: event.title, time: event.time || '', type: event.type, description: event.description || '' });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !formData.title.trim()) return;
    const dateStr = toDateStr(selectedDate);
    if (editingEvent) {
      if (onEditEvent) onEditEvent(editingEvent.id, { ...formData, date: dateStr });
    } else {
      if (onAddEvent) onAddEvent({ ...formData, date: dateStr });
    }
    setFormData({ title: '', time: '', type: 'event', description: '' });
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleDelete = (eventId) => { if (onDeleteEvent) onDeleteEvent(eventId); setShowForm(false); setEditingEvent(null); };

  const totalThisMonth = events.filter((e) => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() === month; }).length;

  return (
    <div className="calendar-container">
      {/* Navigation */}
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMonth}>&larr;</button>
        <div className="cal-nav-center">
          <h3>{monthNames[month]} {year}</h3>
          <span className="cal-event-count">{totalThisMonth} announcement{totalThisMonth !== 1 ? 's' : ''}</span>
        </div>
        <button className="cal-nav-btn" onClick={nextMonth}>&rarr;</button>
      </div>

      {/* Grid */}
      <div className="calendar-grid">
        {dayNames.map((d) => <div key={d} className="calendar-day-name">{d}</div>)}
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          return (
            <div key={idx} className={`calendar-day ${day ? 'has-date' : ''} ${day === selectedDate ? 'selected' : ''} ${isToday(day) ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
              onClick={() => { if (day) { setSelectedDate(day); setShowForm(false); setEditingEvent(null); } }}>
              {day && (
                <>
                  <span className="day-number">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="day-previews">
                      {dayEvents.slice(0, 2).map((e) => {
                        const style = typeStyles[e.type] || typeStyles.event;
                        return (
                          <span key={e.id} className="day-preview-tag" style={{ background: style.bg, color: style.color }}>
                            {style.icon} {e.title.length > 10 ? e.title.slice(0, 10) + '…' : e.title}
                          </span>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span className="day-preview-more">+{dayEvents.length - 2} more</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected date panel */}
      {selectedDate && (
        <div className="calendar-events">
          <div className="calendar-events-header">
            <h4>{monthNames[month]} {selectedDate}, {year}</h4>
            {editable && !showForm && (
              <button className="btn btn-primary btn-sm" onClick={openAddForm}>+ Announcement</button>
            )}
          </div>

          {/* Form */}
          {showForm && editable && (
            <form className="calendar-add-form" onSubmit={handleSubmit}>
              <h5 className="cal-form-title">{editingEvent ? 'Edit Announcement' : 'New Announcement'}</h5>
              <div className="form-group">
                <label>Category</label>
                <div className="cal-type-selector">
                  {Object.entries(typeStyles).map(([key, style]) => (
                    <button key={key} type="button" className={`cal-type-btn ${formData.type === key ? 'active' : ''}`} style={formData.type === key ? { borderColor: '#F5D78E', background: '#F5D78E30', color: '#2b3a4e' } : {}} onClick={() => setFormData({ ...formData, type: key })}>
                      {style.icon} {style.label}
                    </button>
                  ))}
                </div>
              </div>
              {formData.type !== 'offday' && (
                <div className="form-group">
                  <label>Time (optional)</label>
                  <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                </div>
              )}
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Spring Festival, Parent Meeting..." required />
              </div>
              <div className="form-group">
                <label>Details</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description for parents..." rows={3} />
              </div>
              <div className="cal-form-actions">
                <button type="submit" className="btn btn-primary btn-sm">{editingEvent ? 'Save' : 'Publish'}</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingEvent(null); }}>Cancel</button>
              </div>
            </form>
          )}

          {/* Entries */}
          {selectedEvents.length === 0 && !showForm ? (
            <p className="no-events">No announcements for this day</p>
          ) : (
            selectedEvents.map((event) => {
              const style = typeStyles[event.type] || typeStyles.event;
              return (
                <div key={event.id} className="calendar-event-item" style={{ borderLeftColor: style.color }}>
                  <div className="cal-event-row">
                    <div className="cal-event-main">
                      <div className="cal-event-top">
                        <div className="event-badge" style={{ background: style.bg, color: style.color }}>
                          {style.icon} {style.label}
                        </div>
                        {event.time && <span className="cal-event-time">{event.time}</span>}
                      </div>
                      <strong>{event.title}</strong>
                      {event.description && <p className="cal-event-desc">{event.description}</p>}
                      {event.author && <span className="cal-announce-author">— {event.author}</span>}
                    </div>
                    {editable && (
                      <div className="cal-event-actions">
                        <button className="cal-action-btn edit" onClick={() => openEditForm(event)} title="Edit">📝</button>
                        <button className="cal-action-btn delete" onClick={() => handleDelete(event.id)} title="Delete">❌</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default EventCalendar;

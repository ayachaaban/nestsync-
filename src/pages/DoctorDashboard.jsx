import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import ChildSelector from '../components/ChildSelector';
import EventCalendar from '../components/EventCalendar';
import { children, medicalNotes, appointments, events } from '../data/mockData';

function DoctorHome({ user }) {
  const myAppointments = appointments.filter((a) => a.doctorId === user.id);
  const myNotes = medicalNotes.filter((n) => n.doctorName === user.name);

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Welcome, {user.name}</h2>
        <p>{user.specialty} — Healthcare Portal</p>
      </div>

      <div className="stats-row">
        <StatsCard icon="👶" label="Children in Care" value={children.length} color="#4f46e5" />
        <StatsCard icon="📅" label="Upcoming Appointments" value={myAppointments.length} color="#059669" />
        <StatsCard icon="📝" label="Medical Notes" value={myNotes.length} color="#f59e0b" />
        <StatsCard icon="🏥" label="Specialty" value={user.specialty} color="#dc2626" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>My Upcoming Appointments</h3>
          </div>
          {myAppointments.length === 0 ? (
            <p className="empty-state">No upcoming appointments</p>
          ) : (
            <div className="appointment-list">
              {myAppointments.map((apt) => {
                const child = children.find((c) => c.id === apt.childId);
                return (
                  <div key={apt.id} className="appointment-item">
                    <div className="appointment-date">
                      <span className="apt-day">{apt.date.split('-')[2]}</span>
                      <span className="apt-month">Apr</span>
                    </div>
                    <div className="appointment-info">
                      <strong>{child?.avatar} {child?.name}</strong>
                      <span>{apt.type} at {apt.time}</span>
                    </div>
                    <span className="badge badge-green">{apt.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Medical Notes</h3>
          </div>
          {myNotes.map((note) => {
            const child = children.find((c) => c.id === note.childId);
            return (
              <div key={note.id} className="medical-note">
                <div className="note-header">
                  <strong>{child?.avatar} {child?.name}</strong>
                  <span className="badge badge-purple">{note.type}</span>
                </div>
                <p>{note.note}</p>
                <span className="note-date">{note.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DoctorChildReports() {
  const [selectedChild, setSelectedChild] = useState(children[0]?.id);
  const child = children.find((c) => c.id === selectedChild);
  const childNotes = medicalNotes.filter((n) => n.childId === selectedChild);
  const childAppointments = appointments.filter((a) => a.childId === selectedChild);

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Child Reports</h2>
        <p>View detailed health reports for each child</p>
      </div>

      <ChildSelector children={children} selectedId={selectedChild} onSelect={setSelectedChild} />

      {child && (
        <div className="dashboard-grid">
          <div className="card">
            <div className="child-profile">
              <span className="child-avatar-lg">{child.avatar}</span>
              <div>
                <h3>{child.name}</h3>
                <p>Age: {child.age} years | Group: {child.group}</p>
                <p>Blood Type: {child.bloodType} | Allergies: {child.allergies}</p>
              </div>
            </div>
            <hr className="divider" />
            <h4>Medical History</h4>
            {childNotes.length === 0 ? (
              <p className="empty-state">No medical notes found</p>
            ) : (
              childNotes.map((note) => (
                <div key={note.id} className="medical-note">
                  <div className="note-header">
                    <strong>{note.doctorName}</strong>
                    <span className="badge badge-purple">{note.type}</span>
                  </div>
                  <p>{note.note}</p>
                  <span className="note-date">{note.date}</span>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Appointments for {child.name}</h3>
            </div>
            {childAppointments.length === 0 ? (
              <p className="empty-state">No appointments scheduled</p>
            ) : (
              <div className="appointment-list">
                {childAppointments.map((apt) => (
                  <div key={apt.id} className="appointment-item">
                    <div className="appointment-date">
                      <span className="apt-day">{apt.date.split('-')[2]}</span>
                      <span className="apt-month">Apr</span>
                    </div>
                    <div className="appointment-info">
                      <strong>{apt.type}</strong>
                      <span>{apt.doctorName} at {apt.time}</span>
                    </div>
                    <span className="badge badge-green">{apt.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DoctorAddNotes({ user }) {
  const [selectedChild, setSelectedChild] = useState(children[0]?.id);
  const [form, setForm] = useState({ note: '', type: 'checkup' });
  const [savedNotes, setSavedNotes] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const child = children.find((c) => c.id === selectedChild);
    const newNote = {
      id: Date.now(),
      childId: selectedChild,
      childName: child?.name,
      childAvatar: child?.avatar,
      doctorName: user.name,
      date: '2026-04-01',
      ...form,
    };
    setSavedNotes([newNote, ...savedNotes]);
    setForm({ note: '', type: 'checkup' });
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Add Medical Notes</h2>
        <p>Record medical observations and recommendations</p>
      </div>

      <ChildSelector children={children} selectedId={selectedChild} onSelect={setSelectedChild} />

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>New Medical Note</h3>
          </div>
          <form className="activity-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Note Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="checkup">Routine Checkup</option>
                <option value="illness">Illness</option>
                <option value="therapy">Therapy Session</option>
                <option value="assessment">Assessment</option>
                <option value="vaccination">Vaccination</option>
              </select>
            </div>
            <div className="form-group">
              <label>Medical Note</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Write your medical observations, recommendations..."
                rows={5}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Save Note</button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recently Added</h3>
          </div>
          {savedNotes.length === 0 ? (
            <p className="empty-state">No notes added this session</p>
          ) : (
            savedNotes.map((note) => (
              <div key={note.id} className="medical-note">
                <div className="note-header">
                  <strong>{note.childAvatar} {note.childName}</strong>
                  <span className="badge badge-purple">{note.type}</span>
                </div>
                <p>{note.note}</p>
                <span className="note-date">{note.date}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DoctorAppointments({ user }) {
  const [form, setForm] = useState({ childId: children[0]?.id, date: '', time: '', type: 'Routine Checkup' });
  const [localAppointments, setLocalAppointments] = useState(appointments);

  const handleSubmit = (e) => {
    e.preventDefault();
    const child = children.find((c) => c.id === Number(form.childId));
    const newApt = {
      id: Date.now(),
      childId: Number(form.childId),
      doctorId: user.id,
      doctorName: user.name,
      date: form.date,
      time: form.time,
      type: form.type,
      status: 'scheduled',
    };
    setLocalAppointments([newApt, ...localAppointments]);
    setForm({ childId: children[0]?.id, date: '', time: '', type: 'Routine Checkup' });
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Appointments</h2>
        <p>Schedule and manage appointments</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Schedule Appointment</h3>
          </div>
          <form className="activity-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Child</label>
              <select value={form.childId} onChange={(e) => setForm({ ...form, childId: e.target.value })}>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.avatar} {c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Appointment Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Routine Checkup</option>
                <option>Speech Therapy</option>
                <option>Behavioral Assessment</option>
                <option>Vaccination</option>
                <option>Follow-up</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Schedule</button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>All Appointments</h3>
          </div>
          <div className="appointment-list">
            {localAppointments.map((apt) => {
              const child = children.find((c) => c.id === apt.childId);
              return (
                <div key={apt.id} className="appointment-item">
                  <div className="appointment-date">
                    <span className="apt-day">{apt.date.split('-')[2]}</span>
                    <span className="apt-month">Apr</span>
                  </div>
                  <div className="appointment-info">
                    <strong>{child?.avatar} {child?.name}</strong>
                    <span>{apt.type} — {apt.doctorName} at {apt.time}</span>
                  </div>
                  <span className="badge badge-green">{apt.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorCalendar() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Calendar</h2>
        <p>View nursery events and your appointments</p>
      </div>
      <EventCalendar events={events} />
    </div>
  );
}

function DoctorDashboard({ user, onLogout }) {
  const sidebarLinks = [
    { to: '/doctor', icon: '📊', label: 'Dashboard' },
    { to: '/doctor/reports', icon: '📋', label: 'Child Reports' },
    { to: '/doctor/notes', icon: '📝', label: 'Add Notes' },
    { to: '/doctor/appointments', icon: '📅', label: 'Appointments' },
    { to: '/doctor/calendar', icon: '🗓️', label: 'Calendar' },
  ];

  return (
    <div className="app-layout">
      <Navbar user={user} onLogout={onLogout} />
      <div className="app-body">
        <Sidebar links={sidebarLinks} />
        <main className="main-content">
          <Routes>
            <Route index element={<DoctorHome user={user} />} />
            <Route path="reports" element={<DoctorChildReports />} />
            <Route path="notes" element={<DoctorAddNotes user={user} />} />
            <Route path="appointments" element={<DoctorAppointments user={user} />} />
            <Route path="calendar" element={<DoctorCalendar />} />
            <Route path="*" element={<Navigate to="/doctor" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default DoctorDashboard;

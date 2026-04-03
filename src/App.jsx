import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ParentDashboard from './pages/ParentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import { users as defaultUsers, children as defaultChildren, events as defaultEvents, photos as defaultPhotos } from './data/mockData';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState(defaultUsers);
  const [registeredChildren, setRegisteredChildren] = useState(defaultChildren);
  const [notifications, setNotifications] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState(defaultEvents);
  const [mediaUploads, setMediaUploads] = useState(defaultPhotos);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Nora Khalid', role: 'staff', text: 'Good morning everyone! Reminder: tomorrow is picture day, please dress the kids in their best outfits.', date: '2026-04-01', time: '08:00 AM' },
    { id: 2, sender: 'Sara Al-Ahmed', role: 'parent', text: 'Thank you for the reminder! Adam is so excited.', date: '2026-04-01', time: '08:15 AM' },
    { id: 3, sender: 'Layla Ibrahim', role: 'staff', text: 'Also, we have a new art supplies delivery. The kids will start watercolor painting this week!', date: '2026-04-01', time: '09:30 AM' },
    { id: 4, sender: 'Omar Hassan', role: 'parent', text: 'That sounds great! Lina loves painting.', date: '2026-04-01', time: '10:00 AM' },
  ]);
  const [weeklySchedule, setWeeklySchedule] = useState([
    { time: '7:30 - 8:00', mon: 'Welcoming', tue: 'Welcoming', wed: 'Welcoming', thu: 'Welcoming', fri: 'Welcoming' },
    { time: '8:00 - 8:30', mon: 'Free Play', tue: 'Free Play', wed: 'Free Play', thu: 'Free Play', fri: 'Free Play' },
    { time: '8:30 - 9:00', mon: 'Puzzle Time', tue: 'Puzzle Time', wed: 'Puzzle Time', thu: 'Puzzle Time', fri: 'Puzzle Time' },
    { time: '9:00 - 9:30', mon: 'Circle Time', tue: 'Circle Time', wed: 'Circle Time', thu: 'Circle Time', fri: 'Circle Time' },
    { time: '9:30 - 10:00', mon: 'Breakfast', tue: 'Breakfast', wed: 'Breakfast', thu: 'Breakfast', fri: 'Breakfast' },
    { time: '10:00 - 10:30', mon: 'Written Tasks', tue: 'Written Tasks', wed: 'Written Tasks', thu: 'Written Tasks', fri: 'Written Tasks' },
    { time: '10:30 - 11:00', mon: 'Nap Time', tue: 'Nap Time', wed: 'Nap Time', thu: 'Nap Time', fri: 'Nap Time' },
    { time: '11:00 - 11:30', mon: 'Lunch', tue: 'Lunch', wed: 'Lunch', thu: 'Lunch', fri: 'Lunch' },
    { time: '11:30 - 12:00', mon: 'Snack', tue: 'Snack', wed: 'Snack', thu: 'Snack', fri: 'Snack' },
    { time: '12:00 - 1:00', mon: 'Free Play', tue: 'Free Play', wed: 'Free Play', thu: 'Free Play', fri: 'Free Play' },
    { time: '1:00', mon: 'Pick Up', tue: 'Pick Up', wed: 'Pick Up', thu: 'Pick Up', fri: 'Pick Up' },
  ]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleSignup = (newUser) => {
    setRegisteredUsers([...registeredUsers, newUser]);
    if (newUser.child) {
      setRegisteredChildren([...registeredChildren, newUser.child]);
    }
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [{ id: Date.now(), read: false, date: new Date().toLocaleString(), ...notification }, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const addDailyReport = (report) => {
    const newReport = { id: Date.now(), date: '2026-04-01', ...report };
    setDailyReports((prev) => [newReport, ...prev]);
    addNotification({
      type: 'report',
      title: 'New Daily Report',
      message: `${report.staffName} sent a daily report for ${report.childName}`,
      childId: report.childId,
    });
  };

  const addCalendarEvent = (event) => {
    const newEvent = { id: Date.now(), ...event };
    setCalendarEvents((prev) => [...prev, newEvent]);
    const labels = { event: 'Event', meeting: 'Meeting', health: 'Health', offday: 'Day Off' };
    addNotification({
      type: 'announcement',
      title: `${labels[event.type] || 'Announcement'}: ${event.title}`,
      message: event.description || event.title,
    });
  };

  const editCalendarEvent = (id, updated) => {
    setCalendarEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
  };

  const deleteCalendarEvent = (id) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const addMedia = (media) => {
    const newMedia = { id: Date.now(), date: '2026-04-01', ...media };
    setMediaUploads((prev) => [newMedia, ...prev]);
    addNotification({
      type: 'media',
      title: `New ${media.type === 'video' ? 'Video' : 'Photo'} Uploaded`,
      message: `${media.uploadedBy} uploaded a ${media.type} of ${media.childName}: "${media.caption}"`,
      childId: media.childId,
    });
  };

  const updateWeeklySchedule = (newSchedule) => {
    setWeeklySchedule(newSchedule);
  };

  const [weeklyMenu, setWeeklyMenu] = useState([
    { meal: 'Breakfast', time: '9:30 AM', mon: 'Cereal & Milk', tue: 'Toast & Jam', wed: 'Oatmeal & Berries', thu: 'Pancakes', fri: 'Eggs & Bread' },
    { meal: 'Lunch', time: '11:30 AM', mon: 'Chicken & Rice', tue: 'Pasta & Sauce', wed: 'Fish & Vegetables', thu: 'Beef Stew', fri: 'Pizza & Salad' },
    { meal: 'Snack', time: '1:00 PM', mon: 'Apple Slices', tue: 'Crackers & Cheese', wed: 'Yogurt', thu: 'Banana', fri: 'Cookies & Juice' },
  ]);

  const updateWeeklyMenu = (newMenu) => {
    setWeeklyMenu(newMenu);
  };

  const sendChatMessage = (message) => {
    setChatMessages((prev) => [...prev, { id: Date.now(), date: '2026-04-01', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }), ...message }]);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login onLogin={handleLogin} users={registeredUsers} />} />
        <Route path="/signup" element={user ? <Navigate to={`/${user.role}`} replace /> : <Signup onSignup={handleSignup} />} />
        <Route
          path="/parent/*"
          element={user?.role === 'parent' ? (
            <ParentDashboard
              user={user}
              onLogout={handleLogout}
              notifications={notifications}
              onMarkRead={markNotificationRead}
              dailyReports={dailyReports}
              calendarEvents={calendarEvents}
              mediaUploads={mediaUploads}
              weeklySchedule={weeklySchedule}
              weeklyMenu={weeklyMenu}
              chatMessages={chatMessages}
              onSendChat={sendChatMessage}
            />
          ) : <Navigate to="/" replace />}
        />
        <Route
          path="/staff/*"
          element={user?.role === 'staff' ? (
            <StaffDashboard
              user={user}
              onLogout={handleLogout}
              onAddReport={addDailyReport}
              onAddEvent={addCalendarEvent}
              onEditEvent={editCalendarEvent}
              onDeleteEvent={deleteCalendarEvent}
              onAddMedia={addMedia}
              onUpdateSchedule={updateWeeklySchedule}
              onUpdateMenu={updateWeeklyMenu}
              calendarEvents={calendarEvents}
              weeklySchedule={weeklySchedule}
              weeklyMenu={weeklyMenu}
              chatMessages={chatMessages}
              onSendChat={sendChatMessage}
            />
          ) : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

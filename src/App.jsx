import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ParentDashboard from './pages/ParentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Hardcoded admin account — cannot be created or deleted from the UI.
const ADMIN_ACCOUNT = {
  id: 'admin',
  name: 'Admin',
  email: 'admin@nestsync.com',
  password: 'Admin1234',
  role: 'admin',
};

// One-time wipe: clears all stored data so the app starts completely fresh.
// Bump STORAGE_VERSION any time you want to force every browser to wipe again.
//only wipe if we're in a browser and the saved version is different from the current one.
const STORAGE_VERSION = 'v5-admin';
if (typeof window !== 'undefined' && localStorage.getItem('nestsync_version') !== STORAGE_VERSION) {
  [
    'nestsync_users',         // Holds: all registered parent/staff accounts
    'nestsync_children',      // Holds: all registered children
    'nestsync_chat',          // Holds: all chat messages per group
    'nestsync_user',          // Holds: the currently logged-in user
    'nestsync_events',        // Holds: calendar announcements
    'nestsync_media',         // Holds: uploaded photos/videos
    'nestsync_reports',       // Holds: daily reports
    'nestsync_notifications', // Holds: bell notifications
    'nestsync_schedule',      // Holds: weekly schedule
    'nestsync_menu',          // Holds: weekly menu
  ].forEach((k) => localStorage.removeItem(k));
  // .forEach goes through the array one item at a time. For each key "k",
  // it calls localStorage.removeItem(k) — so all 10 keys above get deleted.
  // Save the current version so next time the app loads it won't wipe again.
  //btsir l storage version v5-admin fa ma3ach bifout aal if w bltele ma3ach bymhe
  //wa ella bisir bado yemhe 3end kl page 
  //Without this line, the app would wipe localStorage on every single page load forever, because the version would never be saved.


  localStorage.setItem('nestsync_version', STORAGE_VERSION);
}

//loadState is a function that reads saved data from the browser's storage. If nothing is saved, it gives back a default value.
//localStorage can only store text. So your data is saved as a string:
//loadState uses JSON.parse() to convert the text back into a real array/object you can use
const loadState = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Helper: save to localStorage; warn (not crash) if quota is exceeded.
//saveState turns data into text and saves it in the browser. If it can't save (storage full), it just warns you instead of crashing.

const saveState = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Could not save "${key}" to localStorage:`, err?.message || err);
  }
};
//The [] just means "empty list of messages."
//for each group there is a list of messages, and by default that list is empty.
// // When you send a message to a group, it gets added to that group's list.
// // When you open the chat for a group, it shows all the messages in that group's list.
const defaultChat = {
  'Bumble Bees': [],
  'Honey Bees': [],
  'Busy Bees': [],
};
//What it is: the starter weekly timetable — a list of 11 time slots, each with an activity for Monday through Friday.


const defaultSchedule = [
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
];
//What it is: the starter meal plan — 3 meals (Breakfast, Lunch, Snack), each with different food for each weekday.


const defaultMenu = [
  { meal: 'Breakfast', time: '9:30 AM', mon: 'Cereal & Milk', tue: 'Toast & Jam', wed: 'Oatmeal & Berries', thu: 'Pancakes', fri: 'Eggs & Bread' },
  { meal: 'Lunch', time: '11:30 AM', mon: 'Chicken & Rice', tue: 'Pasta & Sauce', wed: 'Fish & Vegetables', thu: 'Beef Stew', fri: 'Pizza & Salad' },
  { meal: 'Snack', time: '1:00 PM', mon: 'Apple Slices', tue: 'Crackers & Cheese', wed: 'Yogurt', thu: 'Banana', fri: 'Cookies & Juice' },
];


function App() {
//loadState('nestsync_users', [])
//You give the worker 2 things:
//Which drawer to open → 'nestsync_users'
  //What to bring back if the drawer is empty → [] (empty list)

  //loadState only reads the saved data. useState is React's memory 
  //it holds the data, tracks changes, and re-renders the UI automatically when you update it with the setter function.
  // That's why we store loadState's result inside useState.
  const [user, setUser] = useState(() => loadState('nestsync_user', null));
  const [registeredUsers, setRegisteredUsers] = useState(() => loadState('nestsync_users', []));
  const [registeredChildren, setRegisteredChildren] = useState(() => loadState('nestsync_children', []));
  const [notifications, setNotifications] = useState(() => loadState('nestsync_notifications', []));
  const [dailyReports, setDailyReports] = useState(() => loadState('nestsync_reports', []));
  const [calendarEvents, setCalendarEvents] = useState(() => loadState('nestsync_events', []));
  const [mediaUploads, setMediaUploads] = useState(() => loadState('nestsync_media', []));
  const [chatMessages, setChatMessages] = useState(() => loadState('nestsync_chat', defaultChat));
  const [weeklySchedule, setWeeklySchedule] = useState(() => loadState('nestsync_schedule', defaultSchedule));

  // Save all state to localStorage whenever it changes
  //useEffect is a React hook that runs code automatically when something changes.
  //These useEffect lines auto-save each piece of state to localStorage whenever it changes./
  //That's how the app remembers everything between page refreshes — no manual saving needed.
  useEffect(() => { saveState('nestsync_user', user); }, [user]);
  useEffect(() => { saveState('nestsync_users', registeredUsers); }, [registeredUsers]);
  useEffect(() => { saveState('nestsync_children', registeredChildren); }, [registeredChildren]);
  useEffect(() => { saveState('nestsync_notifications', notifications); }, [notifications]);
  useEffect(() => { saveState('nestsync_reports', dailyReports); }, [dailyReports]);
  useEffect(() => { saveState('nestsync_events', calendarEvents); }, [calendarEvents]);
  useEffect(() => { saveState('nestsync_media', mediaUploads); }, [mediaUploads]);
  useEffect(() => { saveState('nestsync_chat', chatMessages); }, [chatMessages]);
  useEffect(() => { saveState('nestsync_schedule', weeklySchedule); }, [weeklySchedule]);

  // Reminder system: when an event is exactly 1 day away, drop a reminder
  // notification into the bell. We dedupe by eventId so the same event never
  // produces more than one reminder, even across reloads.
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    setNotifications((prev) => {
      const alreadyReminded = new Set(
        prev.filter((n) => n.type === 'reminder').map((n) => n.eventId)
      );
      const labels = { event: 'Event', meeting: 'Meeting', health: 'Health', offday: 'Day Off' };
      const newReminders = calendarEvents
        .filter((e) => e.date === tomorrowStr && !alreadyReminded.has(e.id))
        .map((e) => ({
          id: Date.now() + Math.random(),
          type: 'reminder',
          title: `Reminder: ${labels[e.type] || 'Announcement'} tomorrow — ${e.title}`,
          message: `${e.title} is scheduled for tomorrow${e.time ? ` at ${e.time}` : ''}.${e.description ? ` ${e.description}` : ''}`,
          eventId: e.id,
          read: false,
          date: new Date().toLocaleString(),
        }));
      if (newReminders.length === 0) return prev;
      return [...newReminders, ...prev];
    });
  }, [calendarEvents]);

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
    localStorage.removeItem('nestsync_user');
  };

  // Reset a user's password by email. Returns true if a matching account was
  // found and updated, false otherwise. Used by the "Forgot password?" flow on
  // the Login page.
  const handleResetPassword = (email, newPassword) => {
    const target = registeredUsers.find((u) => u.email === email);
    if (!target) return false;
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, password: newPassword } : u))
    );
    return true;
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [{ id: Date.now(), read: false, date: new Date().toLocaleString(), ...notification }, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const addDailyReport = (report) => {
    const newReport = { id: Date.now(), date: new Date().toISOString().slice(0, 10), ...report };
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
    const newMedia = { id: Date.now(), date: new Date().toISOString().slice(0, 10), ...media };
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

  const [weeklyMenu, setWeeklyMenu] = useState(() => loadState('nestsync_menu', defaultMenu));

  useEffect(() => { saveState('nestsync_menu', weeklyMenu); }, [weeklyMenu]);

  const updateWeeklyMenu = (newMenu) => {
    setWeeklyMenu(newMenu);
  };

  const sendChatMessage = (group, message) => {
    setChatMessages((prev) => ({
      ...prev,
      [group]: [...(prev[group] || []), { id: Date.now(), date: '2026-04-01', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }), ...message }],
    }));
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* When someone opens /, check if they're logged in. If yes, send them to their dashboard. If no, show the Login page. */}
        {/* path="/" → the root URL (the website's home) */}
        {/*user ? ... : ... → a ternary: "if user is logged in, do A, otherwise do B"*/}
        {/*A: <Navigate to={/${user.role}} replace /> → redirects to /parent, /staff, or /admin depending on role
       B: <Login ... /> → shows the login page with these props:
      onLogin={handleLogin} → what to call when login succeeds
      users={[ADMIN_ACCOUNT, ...registeredUsers]} → the admin plus all registered users (login checks against this list)
      onResetPassword={handleResetPassword} → the forgot-password function*/}

        

        {/*Every route follows this shape:
        <Route path="SOME_URL" element={
          CONDITION ? <TheCorrectPage /> : <Navigate to="/" />
        } />
        URL → what URL to match
        Condition → is the user allowed here?
        If yes → show the page
        If no → redirect*/}

        <Route path="/" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login onLogin={handleLogin} users={[ADMIN_ACCOUNT, ...registeredUsers]} onResetPassword={handleResetPassword} />} />

        <Route path="/signup" element={user ? <Navigate to={`/${user.role}`} replace /> : <Signup onSignup={handleSignup} registeredUsers={registeredUsers} />} />
        {/* We pass props to ParentDashboard (and the other dashboards) because App.jsx
            holds all the data and functions — the dashboards need them to display info
            and update state, so App.jsx hands them down as props. */}
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
              allChildren={registeredChildren}
              registeredUsers={registeredUsers}
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
              allChildren={registeredChildren}
              dailyReports={dailyReports}
              mediaUploads={mediaUploads}
            />
          ) : <Navigate to="/" replace />}
        />
        <Route
          path="/admin/*"
          element={user?.role === 'admin' ? (
            <AdminDashboard
              user={user}
              onLogout={handleLogout}
              registeredUsers={registeredUsers}
              setRegisteredUsers={setRegisteredUsers}
              registeredChildren={registeredChildren}
              setRegisteredChildren={setRegisteredChildren}
              dailyReports={dailyReports}
              calendarEvents={calendarEvents}
              onAddEvent={addCalendarEvent}
              onEditEvent={editCalendarEvent}
              onDeleteEvent={deleteCalendarEvent}
              mediaUploads={mediaUploads}
              chatMessages={chatMessages}
              weeklySchedule={weeklySchedule}
              weeklyMenu={weeklyMenu}
              notifications={notifications}
            />
          ) : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

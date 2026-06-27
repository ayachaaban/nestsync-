import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ParentDashboard from './pages/ParentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import {
  usersApi,
  childrenApi,
  reportsApi,
  eventsApi,
  mediaApi,
  chatApi,
  scheduleApi,
  menuApi,
  notificationsApi,
} from './api';
import './App.css';

// Hardcoded admin account — cannot be created or deleted from the UI.
// Still local because admin sign-in needs to work even if the API is offline.
const ADMIN_ACCOUNT = {
  id: 'admin',
  name: 'Admin',
  email: 'admin@nestsync.com',
  password: 'Admin1234',
  role: 'admin',
};

// We keep ONLY the logged-in user in localStorage, so a page refresh doesn't
// kick the user back to the login screen. All other data now lives in the API.
const loadUser = () => {
  try {
    const saved = localStorage.getItem('nestsync_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// Defaults used if the database is empty (first run).
const defaultChat = {
  'Bumble Bees': [],
  'Honey Bees': [],
  'Busy Bees': [],
};
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
const defaultMenu = [
  { meal: 'Breakfast', time: '9:30 AM', mon: 'Cereal & Milk', tue: 'Toast & Jam', wed: 'Oatmeal & Berries', thu: 'Pancakes', fri: 'Eggs & Bread' },
  { meal: 'Lunch', time: '11:30 AM', mon: 'Chicken & Rice', tue: 'Pasta & Sauce', wed: 'Fish & Vegetables', thu: 'Beef Stew', fri: 'Pizza & Salad' },
  { meal: 'Snack', time: '1:00 PM', mon: 'Apple Slices', tue: 'Crackers & Cheese', wed: 'Yogurt', thu: 'Banana', fri: 'Cookies & Juice' },
];

// The API stores notifications with "isRead" (C# convention). Our existing
// components read "read". This helper maps API → UI shape.
const mapNotification = (n) => ({ ...n, read: n.isRead });

// The API stores daily reports with "breakfastPortion"/"lunchPortion"/"snackPortion".
// Existing components read "breakfast"/"lunch"/"snack". This helper adds aliases.
// Also parses JSON strings for diapers + itemsNeeded back into arrays.
const safeParseJson = (s, fallback) => {
  if (!s) return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
};

const mapReport = (r) => ({
  ...r,
  breakfast: r.breakfastPortion,
  lunch: r.lunchPortion,
  snack: r.snackPortion,
  // The C# DiaperDto serializes with PascalCase, so we normalize keys to lowercase
  // (the React component reads d.type, d.time).
  diapers: safeParseJson(r.diapersJson, []).map((d) => ({
    type: d.type || d.Type || 'wet',
    time: d.time || d.Time || '',
  })),
  itemsNeeded: safeParseJson(r.itemsNeededJson, []),
});

// The API stores chat messages with "senderName"/"senderRole".
// GroupChat reads "sender"/"role". This helper adds aliases.
const mapChatMessage = (m) => ({
  ...m,
  sender: m.senderName,
  role: m.senderRole,
  message: m.text,    // some places read msg.message instead of msg.text
});

function App() {
  // ----- STATE -----
  const [user, setUser] = useState(loadUser);
  const [registeredUsers, setRegisteredUsers] = useState([]);            // for admin dashboard
  const [registeredChildren, setRegisteredChildren] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [mediaUploads, setMediaUploads] = useState([]);
  const [chatMessages, setChatMessages] = useState(defaultChat);
  const [weeklySchedule, setWeeklySchedule] = useState(defaultSchedule);
  const [weeklyMenu, setWeeklyMenu] = useState(defaultMenu);

  // Persist the logged-in user so refreshes don't kick them out.
  useEffect(() => {
    if (user) localStorage.setItem('nestsync_user', JSON.stringify(user));
    else localStorage.removeItem('nestsync_user');
  }, [user]);

  // -----------------------------------------------------------------------
  // FETCH EVERYTHING FROM THE API when the user logs in.
  // Runs once after login; refetched if user changes.
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadAll = async () => {
      try {
        const [users, children, reports, events, media, schedule, menu, notifs,
               bumble, honey, busy] = await Promise.all([
          usersApi.getAll().catch(() => []),
          childrenApi.getAll().catch(() => []),
          reportsApi.getAll().catch(() => []),
          eventsApi.getAll().catch(() => []),
          mediaApi.getAll().catch(() => []),
          scheduleApi.getAll().catch(() => []),
          menuApi.getAll().catch(() => []),
          (user.id !== 'admin'
            ? notificationsApi.getByUser(user.id)
            : notificationsApi.getAll()).catch(() => []),
          chatApi.getByGroup('Bumble Bees').catch(() => []),
          chatApi.getByGroup('Honey Bees').catch(() => []),
          chatApi.getByGroup('Busy Bees').catch(() => []),
        ]);

        if (cancelled) return;

        // Attach childIds to each parent so existing components can use user.childIds.
        // The API returns children with a parentId, so we build the list per-parent here.
        const usersWithChildIds = users.map((u) => ({
          ...u,
          childIds: u.role === 'parent'
            ? children.filter((c) => c.parentId === u.id).map((c) => c.id)
            : [],
        }));

        setRegisteredUsers(usersWithChildIds);
        setRegisteredChildren(children);
        setDailyReports(reports.map(mapReport));
        setCalendarEvents(events);
        setMediaUploads(media);
        // Use defaults if DB is empty so the UI is never blank
        setWeeklySchedule(schedule.length ? schedule : defaultSchedule);
        setWeeklyMenu(menu.length ? menu : defaultMenu);
        setNotifications(notifs.map(mapNotification));
        setChatMessages({
          'Bumble Bees': bumble.map(mapChatMessage),
          'Honey Bees': honey.map(mapChatMessage),
          'Busy Bees': busy.map(mapChatMessage),
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load data from API:', err.message);
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, [user]);

  // -----------------------------------------------------------------------
  // HANDLERS — every "add / edit / delete" now talks to the API.
  // After a successful API call we update local state to match.
  // -----------------------------------------------------------------------

  const handleLogin = (userData) => setUser(userData);

  const handleSignup = (newUser) => {
    setUser(newUser);
    if (newUser.child) {
      setRegisteredChildren((prev) => [...prev, newUser.child]);
    }
  };

  const handleLogout = () => {
    setUser(null);
    // Clear all in-memory data so the next user starts fresh
    setRegisteredChildren([]);
    setNotifications([]);
    setDailyReports([]);
    setCalendarEvents([]);
    setMediaUploads([]);
    setChatMessages(defaultChat);
    setWeeklySchedule(defaultSchedule);
    setWeeklyMenu(defaultMenu);
  };

  // The reset-password flow now runs through authApi inside Login.jsx, so this
  // is just here for backwards compatibility (returns true so the modal closes).
  const handleResetPassword = () => true;

  // Notifications -------------------------------------------------------
  const addNotification = useCallback(async (notification) => {
    try {
      const created = await notificationsApi.create({
        userId: notification.userId ?? null,
        type: notification.type || '',
        title: notification.title || '',
        message: notification.message || '',
        childId: notification.childId ?? null,
        eventId: notification.eventId ?? null,
      });
      setNotifications((prev) => [mapNotification(created), ...prev]);
    } catch (err) {
      console.error('addNotification failed:', err.message);
    }
  }, []);

  const markNotificationRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
      );
    } catch (err) {
      console.error('markNotificationRead failed:', err.message);
    }
  };

  // Daily Reports -------------------------------------------------------
  const addDailyReport = async (report) => {
    try {
      const created = await reportsApi.create({
        childId: report.childId,
        childName: report.childName || '',
        staffName: report.staffName || '',
        mood: report.mood || '',
        breakfastPortion: report.breakfast || report.breakfastPortion || '',
        lunchPortion: report.lunch || report.lunchPortion || '',
        snackPortion: report.snack || report.snackPortion || '',
        notes: report.notes || '',
        date: new Date().toISOString().slice(0, 10),
        napFrom: report.napFrom || null,
        napTo: report.napTo || null,
        napNotes: report.napNotes || null,
        diapers: (report.diapers && report.diapers.length > 0) ? report.diapers : null,
        itemsNeeded: (report.itemsNeeded && report.itemsNeeded.length > 0) ? report.itemsNeeded : null,
      });
      setDailyReports((prev) => [mapReport(created), ...prev]);
      await addNotification({
        type: 'report',
        title: 'New Daily Report',
        message: `${report.staffName} sent a daily report for ${report.childName}`,
        childId: report.childId,
      });
    } catch (err) {
      console.error('addDailyReport failed:', err.message);
    }
  };

  // Calendar Events -----------------------------------------------------
  const addCalendarEvent = async (event) => {
    try {
      const created = await eventsApi.create({
        title: event.title,
        description: event.description || null,
        type: event.type || 'event',
        date: event.date,
        time: event.time || null,
      });
      setCalendarEvents((prev) => [...prev, created]);
      const labels = { event: 'Event', meeting: 'Meeting', health: 'Health', offday: 'Day Off' };
      await addNotification({
        type: 'announcement',
        title: `${labels[event.type] || 'Announcement'}: ${event.title}`,
        message: event.description || event.title,
      });
    } catch (err) {
      console.error('addCalendarEvent failed:', err.message);
    }
  };

  const editCalendarEvent = async (id, updated) => {
    try {
      const newEvent = await eventsApi.update(id, updated);
      setCalendarEvents((prev) => prev.map((e) => (e.id === id ? newEvent : e)));
    } catch (err) {
      console.error('editCalendarEvent failed:', err.message);
    }
  };

  const deleteCalendarEvent = async (id) => {
    try {
      await eventsApi.delete(id);
      setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('deleteCalendarEvent failed:', err.message);
    }
  };

  // Media ---------------------------------------------------------------
  const addMedia = async (media) => {
    try {
      const created = await mediaApi.create({
        childId: media.childId,
        childName: media.childName || '',
        type: media.type || 'photo',
        url: media.url || '',
        caption: media.caption || '',
        uploadedBy: media.uploadedBy || '',
        date: new Date().toISOString().slice(0, 10),
      });
      setMediaUploads((prev) => [created, ...prev]);
      await addNotification({
        type: 'media',
        title: `New ${media.type === 'video' ? 'Video' : 'Photo'} Uploaded`,
        message: `${media.uploadedBy} uploaded a ${media.type} of ${media.childName}: "${media.caption}"`,
        childId: media.childId,
      });
    } catch (err) {
      console.error('addMedia failed:', err.message);
    }
  };

  const deleteMedia = async (id) => {
    try {
      await mediaApi.delete(id);
      setMediaUploads((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('deleteMedia failed:', err.message);
    }
  };

  // Schedule / Menu — bulk save the whole array to the backend ----------
  const updateWeeklySchedule = async (newSchedule) => {
    try {
      const saved = await scheduleApi.replaceAll(newSchedule);
      setWeeklySchedule(saved);
    } catch (err) {
      console.error('updateWeeklySchedule failed:', err.message);
    }
  };

  const updateWeeklyMenu = async (newMenu) => {
    try {
      const saved = await menuApi.replaceAll(newMenu);
      setWeeklyMenu(saved);
    } catch (err) {
      console.error('updateWeeklyMenu failed:', err.message);
    }
  };

  // Chat ---------------------------------------------------------------
  const sendChatMessage = async (group, message) => {
    try {
      const sent = await chatApi.send(group, {
        senderName: message.senderName || message.sender || '',
        senderRole: message.senderRole || message.role || (user?.role ?? 'parent'),
        text: message.text || message.message || '',
      });
      setChatMessages((prev) => ({
        ...prev,
        [group]: [...(prev[group] || []), mapChatMessage(sent)],
      }));
    } catch (err) {
      console.error('sendChatMessage failed:', err.message);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to={`/${user.role}`} replace /> :
            <Login
              onLogin={handleLogin}
              users={[ADMIN_ACCOUNT, ...registeredUsers]}
              onResetPassword={handleResetPassword}
            />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to={`/${user.role}`} replace /> :
            <Signup onSignup={handleSignup} registeredUsers={registeredUsers} />}
        />
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
              onAddMedia={addMedia}
              onDeleteMedia={deleteMedia}
              chatMessages={chatMessages}
              weeklySchedule={weeklySchedule}
              weeklyMenu={weeklyMenu}
              onUpdateSchedule={updateWeeklySchedule}
              onUpdateMenu={updateWeeklyMenu}
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

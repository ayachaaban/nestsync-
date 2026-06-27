// ===========================================================================
//  api.js — Central API client for NestSync+ (using AXIOS)
//
//  We use the Axios library instead of the built-in fetch() because:
//    - Axios auto-parses JSON (no res.json() call)
//    - Axios auto-throws on 4xx/5xx (no res.ok check)
//    - Axios lets us set a base URL ONCE (no string concatenation per call)
//    - Axios has interceptors (e.g. to add auth tokens later)
//    - Less boilerplate overall
// ===========================================================================

import axios from 'axios';

// ----- The base URL of the backend ---------------------------------------
const API_BASE = 'http://localhost:5239/api';


// ===========================================================================
//  The Axios instance
//  ---------------------------------------------------------------------------

// ===========================================================================
const api = axios.create({
  // baseURL → every request automatically starts with this URL.
  //   api.get('/children')  →  GET http://localhost:5239/api/children
  //                             ↑                       ↑
  //                          baseURL                your endpoint
  baseURL: API_BASE,

  // headers → every request automatically includes this header.
  //   'Content-Type': 'application/json'
  //   tells the backend: "I am sending you JSON — please parse it as JSON."
  //   Without this header, the backend wouldn't know the data format
  //   (could be text, XML, form data, etc.).
  headers: { 'Content-Type': 'application/json' },
});


// ===========================================================================
//  Error interceptor
//  Axios already throws on 4xx/5xx, but the error has a long shape:
//    err.response.data.message
//  We use an interceptor to FLATTEN it — so the caller can just read
//  err.message (same shape as the previous fetch-based code).
// ===========================================================================
api.interceptors.response.use(
  (res) => res,                                            // success → pass through
  (err) => {                                               //runs on error
    const serverMsg = err?.response?.data?.message;        // backend returns { message: "..." }
    const status = err?.response?.status;
    const friendly = new Error(serverMsg || `Request failed (${status || 'network'})`);
    friendly.status = status;
    return Promise.reject(friendly);
  }
);


// ===========================================================================
//  AUTH — login / signup / reset password
// ===========================================================================
export const authApi = {
  // POST /api/auth/signup — creates a new parent + child.
  // axios returns { data, status, headers, ... }. We only want the data.
  signup: (data) => api.post('/auth/signup', data).then((r) => r.data),

  // POST /api/auth/login — returns { id, name, email, role, children }
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  // POST /api/auth/reset-password — updates a user's password.
  resetPassword: (email, newPassword) =>
    api.post('/auth/reset-password', { email, newPassword }).then((r) => r.data),
};


// ===========================================================================
//  USERS — Admin manages parents/staff. Standard CRUD.
// ===========================================================================
export const usersApi = {
  getAll: () => api.get('/users').then((r) => r.data),
  getOne: (id) => api.get(`/users/${id}`).then((r) => r.data),
  create: (data) => api.post('/users', data).then((r) => r.data),
  update: (id, data) => api.put(`/users/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/users/${id}`).then((r) => r.data),
};


// ===========================================================================
//  CHILDREN — Standard CRUD
// ===========================================================================
export const childrenApi = {
  getAll: () => api.get('/children').then((r) => r.data),
  getOne: (id) => api.get(`/children/${id}`).then((r) => r.data),
  getByParent: (parentId) => api.get(`/children/parent/${parentId}`).then((r) => r.data),
  create: (data) => api.post('/children', data).then((r) => r.data),
  update: (id, data) => api.put(`/children/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/children/${id}`).then((r) => r.data),
};


// ===========================================================================
//  REPORTS — Daily reports submitted by staff.
// ===========================================================================
export const reportsApi = {
  getAll: () => api.get('/reports').then((r) => r.data),
  getOne: (id) => api.get(`/reports/${id}`).then((r) => r.data),
  getByChild: (childId) => api.get(`/reports/child/${childId}`).then((r) => r.data),
  create: (data) => api.post('/reports', data).then((r) => r.data),
  delete: (id) => api.delete(`/reports/${id}`).then((r) => r.data),
};


// ===========================================================================
//  EVENTS — Calendar events / announcements.
// ===========================================================================
export const eventsApi = {
  getAll: () => api.get('/events').then((r) => r.data),
  getOne: (id) => api.get(`/events/${id}`).then((r) => r.data),
  getUpcoming: () => api.get('/events/upcoming').then((r) => r.data),
  create: (data) => api.post('/events', data).then((r) => r.data),
  update: (id, data) => api.put(`/events/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/events/${id}`).then((r) => r.data),
};


// ===========================================================================
//  MEDIA — Photo / video uploads.
// ===========================================================================
export const mediaApi = {
  getAll: () => api.get('/media').then((r) => r.data),
  getOne: (id) => api.get(`/media/${id}`).then((r) => r.data),
  getByChild: (childId) => api.get(`/media/child/${childId}`).then((r) => r.data),
  create: (data) => api.post('/media', data).then((r) => r.data),
  delete: (id) => api.delete(`/media/${id}`).then((r) => r.data),
};


// ===========================================================================
//  CHAT — Group chat messages.
//  Group names have spaces — encodeURIComponent makes them URL-safe.
// ===========================================================================
export const chatApi = {
  getByGroup: (group) =>
    api.get(`/chat/${encodeURIComponent(group)}`).then((r) => r.data),
  send: (group, data) =>
    api.post(`/chat/${encodeURIComponent(group)}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/chat/${id}`).then((r) => r.data),
};


// ===========================================================================
//  SCHEDULE — Weekly timetable.
// ===========================================================================
export const scheduleApi = {
  getAll: () => api.get('/schedule').then((r) => r.data),
  replaceAll: (slots) => api.put('/schedule', slots).then((r) => r.data),
  update: (id, data) => api.put(`/schedule/${id}`, data).then((r) => r.data),
  create: (data) => api.post('/schedule', data).then((r) => r.data),
  delete: (id) => api.delete(`/schedule/${id}`).then((r) => r.data),
};


// ===========================================================================
//  MENU — Weekly meal plan.
// ===========================================================================
export const menuApi = {
  getAll: () => api.get('/menu').then((r) => r.data),
  replaceAll: (items) => api.put('/menu', items).then((r) => r.data),
  update: (id, data) => api.put(`/menu/${id}`, data).then((r) => r.data),
  create: (data) => api.post('/menu', data).then((r) => r.data),
  delete: (id) => api.delete(`/menu/${id}`).then((r) => r.data),
};


// ===========================================================================
//  NOTIFICATIONS — Bell-icon notifications.
// ===========================================================================
export const notificationsApi = {
  getAll: () => api.get('/notifications').then((r) => r.data),
  getByUser: (userId) => api.get(`/notifications/user/${userId}`).then((r) => r.data),
  getUnread: (userId) => api.get(`/notifications/user/${userId}/unread`).then((r) => r.data),
  create: (data) => api.post('/notifications', data).then((r) => r.data),
  markRead: (id) => api.put(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: (userId) =>
    api.put(`/notifications/user/${userId}/read-all`).then((r) => r.data),
  delete: (id) => api.delete(`/notifications/${id}`).then((r) => r.data),
};

// ── Mock Users ──
export const users = [
  { id: 1, name: 'Sara Al-Ahmed', email: 'sara@parent.com', password: '123456', role: 'parent', childIds: [1] },
  { id: 2, name: 'Nora Khalid', email: 'nora@staff.com', password: '123456', role: 'staff' },
  { id: 4, name: 'Omar Hassan', email: 'omar@parent.com', password: '123456', role: 'parent', childIds: [2] },
  { id: 5, name: 'Layla Ibrahim', email: 'layla@staff.com', password: '123456', role: 'staff' },
];

// ── Children ──
export const children = [
  { id: 1, name: 'Adam Al-Ahmed', age: 3, group: 'Bumble Bees', parentId: 1, avatar: '', allergies: 'None', bloodType: 'A+' },
  { id: 2, name: 'Lina Hassan', age: 4, group: 'Honey Bees', parentId: 4, avatar: '', allergies: 'Peanuts', bloodType: 'O+' },
  { id: 3, name: 'Youssef Tariq', age: 2, group: 'Bumble Bees', parentId: null, avatar: '', allergies: 'None', bloodType: 'B+' },
  { id: 4, name: 'Maya Saeed', age: 3, group: 'Honey Bees', parentId: null, avatar: '', allergies: 'Dairy', bloodType: 'AB+' },
];

// ── Daily Activities ──
export const activities = [
  { id: 1, childId: 1, type: 'meal', title: 'Breakfast', description: 'Ate cereal with milk and banana', time: '08:30 AM', date: '2026-04-01', staffName: 'Nora Khalid' },
  { id: 2, childId: 1, type: 'nap', title: 'Morning Nap', description: 'Slept for 1.5 hours, peaceful', time: '10:00 AM', date: '2026-04-01', staffName: 'Nora Khalid' },
  { id: 3, childId: 1, type: 'diaper', title: 'Diaper Change', description: 'Clean, no issues', time: '11:30 AM', date: '2026-04-01', staffName: 'Layla Ibrahim' },
  { id: 4, childId: 1, type: 'activity', title: 'Art & Craft', description: 'Painted a picture of a house with finger paints', time: '12:00 PM', date: '2026-04-01', staffName: 'Nora Khalid' },
  { id: 5, childId: 1, type: 'meal', title: 'Lunch', description: 'Chicken rice with vegetables, drank all water', time: '12:30 PM', date: '2026-04-01', staffName: 'Layla Ibrahim' },
  { id: 6, childId: 1, type: 'health', title: 'Minor Scratch', description: 'Small scratch on left knee during outdoor play, cleaned and bandaged', time: '02:00 PM', date: '2026-04-01', staffName: 'Nora Khalid' },
  { id: 7, childId: 2, type: 'meal', title: 'Breakfast', description: 'Toast with jam and apple juice (peanut-free)', time: '08:30 AM', date: '2026-04-01', staffName: 'Nora Khalid' },
  { id: 8, childId: 2, type: 'nap', title: 'Morning Nap', description: 'Slept for 1 hour', time: '10:30 AM', date: '2026-04-01', staffName: 'Layla Ibrahim' },
  { id: 9, childId: 2, type: 'activity', title: 'Story Time', description: 'Listened to "The Very Hungry Caterpillar"', time: '11:00 AM', date: '2026-04-01', staffName: 'Nora Khalid' },
  { id: 10, childId: 2, type: 'meal', title: 'Lunch', description: 'Pasta with tomato sauce, fruit salad', time: '12:30 PM', date: '2026-04-01', staffName: 'Layla Ibrahim' },
  { id: 11, childId: 3, type: 'meal', title: 'Breakfast', description: 'Oatmeal with berries', time: '08:45 AM', date: '2026-04-01', staffName: 'Layla Ibrahim' },
  { id: 12, childId: 3, type: 'diaper', title: 'Diaper Change', description: 'Clean', time: '09:30 AM', date: '2026-04-01', staffName: 'Nora Khalid' },
  { id: 13, childId: 4, type: 'meal', title: 'Breakfast', description: 'Rice porridge (dairy-free)', time: '08:30 AM', date: '2026-04-01', staffName: 'Nora Khalid' },
  { id: 14, childId: 4, type: 'nap', title: 'Morning Nap', description: 'Slept for 2 hours', time: '10:00 AM', date: '2026-04-01', staffName: 'Layla Ibrahim' },
];

// ── Attendance ──
export const attendance = [
  { id: 1, childId: 1, date: '2026-04-01', status: 'present', checkIn: '07:45 AM', checkOut: null },
  { id: 2, childId: 2, date: '2026-04-01', status: 'present', checkIn: '08:00 AM', checkOut: null },
  { id: 3, childId: 3, date: '2026-04-01', status: 'present', checkIn: '08:15 AM', checkOut: null },
  { id: 4, childId: 4, date: '2026-04-01', status: 'absent', checkIn: null, checkOut: null },
  { id: 5, childId: 1, date: '2026-03-31', status: 'present', checkIn: '07:50 AM', checkOut: '03:30 PM' },
  { id: 6, childId: 2, date: '2026-03-31', status: 'present', checkIn: '08:10 AM', checkOut: '04:00 PM' },
  { id: 7, childId: 3, date: '2026-03-31', status: 'absent', checkIn: null, checkOut: null },
  { id: 8, childId: 4, date: '2026-03-31', status: 'present', checkIn: '08:00 AM', checkOut: '03:00 PM' },
];

// ── Calendar Announcements ──
export const events = [
  { id: 1, title: 'Spring Festival', date: '2026-04-04', time: '10:00 AM', type: 'event', description: 'Annual spring celebration with games, food, and fun activities for the kids.' },
  { id: 2, title: 'Parent-Teacher Meeting', date: '2026-04-07', time: '02:00 PM', type: 'meeting', description: 'Discuss child progress and upcoming plans.' },
  { id: 3, title: 'Vaccination Day', date: '2026-04-10', time: '09:00 AM', type: 'health', description: 'Seasonal flu vaccination. Please ensure records are up to date.' },
  { id: 4, title: 'Field Trip - City Zoo', date: '2026-04-15', time: '09:30 AM', type: 'event', description: 'Fun trip to the zoo! Kids should wear comfortable shoes.' },
  { id: 5, title: 'Art Exhibition', date: '2026-04-18', time: '11:00 AM', type: 'event', description: 'Showcasing children\'s artwork from this month.' },
  { id: 6, title: 'Public Holiday', date: '2026-04-20', type: 'offday', description: 'Nursery closed for the public holiday.' },
  { id: 7, title: 'New Weekly Menu', date: '2026-03-28', type: 'event', description: 'We\'ve updated our weekly lunch menu. Check the parent portal for details.' },
  { id: 8, title: 'Health Check Reminder', date: '2026-03-30', type: 'health', description: 'Please ensure your child\'s vaccination records are up to date.' },
];


// ── Photo Gallery (placeholder URLs) ──
export const photos = [
  { id: 1, childId: 1, url: '', caption: 'Adam painting during art class', date: '2026-04-01', uploadedBy: 'Nora Khalid', type: 'photo' },
  { id: 2, childId: 1, url: '', caption: 'Adam playing in the sandbox', date: '2026-03-31', uploadedBy: 'Layla Ibrahim', type: 'photo' },
  { id: 3, childId: 2, url: '', caption: 'Lina during story time', date: '2026-04-01', uploadedBy: 'Nora Khalid', type: 'video' },
  { id: 4, childId: 2, url: '', caption: 'Lina building with blocks', date: '2026-03-31', uploadedBy: 'Layla Ibrahim', type: 'photo' },
  { id: 5, childId: 3, url: '', caption: 'Youssef at breakfast', date: '2026-04-01', uploadedBy: 'Nora Khalid', type: 'video' },
];


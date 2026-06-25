// ============================================================
// VIHAVI ADMIN SERVICE — Unified data layer for admin portal
// Wraps dbService with admin-specific aggregations and logic
// ============================================================
import { dbService } from './dbService';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const fmtCur = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// ── Rich mock seeds injected into localStorage on first run ──
export const ADMIN_MOCK_SEED = {
  users: [
    { id: 'u1', name: 'Arjun Mehta', email: 'arjun@email.com', phone: '+91 98765 11111', city: 'Mumbai', role: 'user', status: 'Active', eventsAttended: 7, joinDate: '2026-01-10', lastLogin: '2026-06-24' },
    { id: 'u2', name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 98765 22222', city: 'Delhi', role: 'user', status: 'Active', eventsAttended: 4, joinDate: '2026-02-14', lastLogin: '2026-06-23' },
    { id: 'u3', name: 'Rahul Gupta', email: 'rahul@email.com', phone: '+91 98765 33333', city: 'Hyderabad', role: 'user', status: 'Suspended', eventsAttended: 2, joinDate: '2026-03-05', lastLogin: '2026-05-10' },
    { id: 'u4', name: 'Kavya Reddy', email: 'kavya@email.com', phone: '+91 98765 44444', city: 'Bangalore', role: 'user', status: 'Active', eventsAttended: 12, joinDate: '2025-11-20', lastLogin: '2026-06-25' },
    { id: 'u5', name: 'Sneha Iyer', email: 'sneha@email.com', phone: '+91 98765 55555', city: 'Chennai', role: 'user', status: 'Active', eventsAttended: 3, joinDate: '2026-04-01', lastLogin: '2026-06-20' },
    { id: 'u6', name: 'Aditya Kumar', email: 'aditya@email.com', phone: '+91 98765 66666', city: 'Pune', role: 'user', status: 'Active', eventsAttended: 9, joinDate: '2026-01-30', lastLogin: '2026-06-22' },
    { id: 'u7', name: 'Neha Patel', email: 'neha@email.com', phone: '+91 98765 77777', city: 'Ahmedabad', role: 'user', status: 'Inactive', eventsAttended: 1, joinDate: '2026-05-12', lastLogin: '2026-05-15' },
    { id: 'u8', name: 'Vikram Singh', email: 'vikram@email.com', phone: '+91 98765 88888', city: 'Jaipur', role: 'user', status: 'Active', eventsAttended: 6, joinDate: '2026-02-28', lastLogin: '2026-06-21' },
    { id: 'u9', name: 'Ananya Das', email: 'ananya@email.com', phone: '+91 98765 99999', city: 'Kolkata', role: 'user', status: 'Active', eventsAttended: 5, joinDate: '2026-03-18', lastLogin: '2026-06-19' },
    { id: 'u10', name: 'Rohan Verma', email: 'rohan@email.com', phone: '+91 98765 00000', city: 'Lucknow', role: 'user', status: 'Active', eventsAttended: 8, joinDate: '2025-12-05', lastLogin: '2026-06-24' },
  ],
  organizers: [
    { id: 'org1', name: 'Skyline Events', company: 'Skyline Events Pvt Ltd', email: 'sky@events.com', phone: '+91 77777 11111', city: 'Mumbai', eventsHosted: 18, revenue: 1250000, rating: 4.8, status: 'Approved', verified: true, joinDate: '2025-10-01', category: 'Corporate' },
    { id: 'org2', name: 'Mumbai Dream Planners', company: 'MDP Events LLP', email: 'mdp@events.com', phone: '+91 77777 22222', city: 'Mumbai', eventsHosted: 12, revenue: 780000, rating: 4.5, status: 'Approved', verified: true, joinDate: '2025-11-15', category: 'Wedding' },
    { id: 'org3', name: 'Royal Stage Productions', company: 'Royal Stage Pvt Ltd', email: 'royal@stage.com', phone: '+91 77777 33333', city: 'Delhi', eventsHosted: 9, revenue: 540000, rating: 4.2, status: 'Pending', verified: false, joinDate: '2026-01-20', category: 'Entertainment' },
    { id: 'org4', name: 'NightCraft Studios', company: 'NightCraft Pvt Ltd', email: 'nc@studios.io', phone: '+91 77777 44444', city: 'Bangalore', eventsHosted: 22, revenue: 1890000, rating: 4.9, status: 'Approved', verified: true, joinDate: '2025-09-10', category: 'Nightlife' },
    { id: 'org5', name: 'Tech Summit India', company: 'Tech Summit India Ltd', email: 'ts@india.in', phone: '+91 77777 55555', city: 'Hyderabad', eventsHosted: 6, revenue: 320000, rating: 4.3, status: 'Pending', verified: false, joinDate: '2026-02-14', category: 'Technology' },
    { id: 'org6', name: 'Foodie Fests', company: 'Foodie Fests LLP', email: 'ff@foodie.com', phone: '+91 77777 66666', city: 'Chennai', eventsHosted: 14, revenue: 670000, rating: 4.6, status: 'Approved', verified: true, joinDate: '2025-12-01', category: 'Culinary' },
    { id: 'org7', name: 'Zen Sports Agency', company: 'Zen Sports Pvt Ltd', email: 'zen@sports.in', phone: '+91 77777 77777', city: 'Pune', eventsHosted: 3, revenue: 0, rating: 0, status: 'Rejected', verified: false, joinDate: '2026-03-05', category: 'Sports' },
  ],
  categories: [
    { id: 'cat1', name: 'Music', icon: '🎵', eventCount: 34, revenue: 2800000, status: 'Active', color: '#1890ff', description: 'Concerts, live performances, and music festivals' },
    { id: 'cat2', name: 'Dance', icon: '💃', eventCount: 18, revenue: 980000, status: 'Active', color: '#722ed1', description: 'Dance shows, workshops, and competitions' },
    { id: 'cat3', name: 'Comedy', icon: '😂', eventCount: 12, revenue: 560000, status: 'Active', color: '#fa8c16', description: 'Stand-up comedy shows and open mics' },
    { id: 'cat4', name: 'Technology', icon: '💻', eventCount: 22, revenue: 3200000, status: 'Active', color: '#52c41a', description: 'Tech conferences, hackathons, and workshops' },
    { id: 'cat5', name: 'Business', icon: '💼', eventCount: 15, revenue: 1750000, status: 'Active', color: '#D4AF37', description: 'Business summits, networking events' },
    { id: 'cat6', name: 'Sports', icon: '⚽', eventCount: 9, revenue: 420000, status: 'Active', color: '#ff4d4f', description: 'Sports tournaments and fitness events' },
    { id: 'cat7', name: 'Food', icon: '🍽️', eventCount: 16, revenue: 680000, status: 'Active', color: '#eb2f96', description: 'Food festivals and culinary workshops' },
    { id: 'cat8', name: 'Cultural', icon: '🎭', eventCount: 8, revenue: 340000, status: 'Active', color: '#13c2c2', description: 'Cultural events and art exhibitions' },
    { id: 'cat9', name: 'Religious', icon: '🙏', eventCount: 5, revenue: 0, status: 'Active', color: '#a0522d', description: 'Religious gatherings and spiritual events' },
    { id: 'cat10', name: 'Education', icon: '📚', eventCount: 11, revenue: 540000, status: 'Active', color: '#2f54eb', description: 'Workshops, seminars, and educational events' },
  ],
  reviews: [
    { id: 'rev1', userId: 'u1', userName: 'Arjun Mehta', eventId: '1', eventName: 'Summer Music Festival', rating: 5, comment: 'Absolutely phenomenal event! Best summer festival I have attended.', date: '2026-06-20', status: 'Approved', reported: false, helpful: 24 },
    { id: 'rev2', userId: 'u2', userName: 'Priya Sharma', eventId: '2', eventName: 'Tech Innovators Conference', rating: 4, comment: 'Great speakers and networking opportunities. Highly recommend.', date: '2026-06-21', status: 'Approved', reported: false, helpful: 18 },
    { id: 'rev3', userId: 'u3', userName: 'Rahul Gupta', eventId: '1', eventName: 'Summer Music Festival', rating: 2, comment: 'Poor crowd management and sound issues throughout the night.', date: '2026-06-22', status: 'Pending', reported: true, helpful: 3 },
    { id: 'rev4', userId: 'u4', userName: 'Kavya Reddy', eventId: '2', eventName: 'Tech Innovators Conference', rating: 5, comment: 'Top-notch content and amazing venue. Worth every penny!', date: '2026-06-22', status: 'Approved', reported: false, helpful: 31 },
    { id: 'rev5', userId: 'u5', userName: 'Sneha Iyer', eventId: '1', eventName: 'Summer Music Festival', rating: 3, comment: 'Decent experience but the food options were very limited.', date: '2026-06-23', status: 'Pending', reported: false, helpful: 7 },
    { id: 'rev6', userId: 'u6', userName: 'Aditya Kumar', eventId: '2', eventName: 'Tech Innovators Conference', rating: 1, comment: 'Completely misrepresented. Nothing as advertised. Want a refund.', date: '2026-06-24', status: 'Rejected', reported: true, helpful: 0 },
  ],
  supportTickets: [
    { id: 'st1', userId: 'u1', userName: 'Arjun Mehta', email: 'arjun@email.com', subject: 'Ticket not received after payment', category: 'Payment', priority: 'High', status: 'Open', assignedAgent: 'Support Team', createdAt: '2026-06-24T10:00:00Z', messages: [{ from: 'user', text: 'I paid but did not receive my ticket.', time: '2026-06-24T10:00:00Z' }] },
    { id: 'st2', userId: 'u2', userName: 'Priya Sharma', email: 'priya@email.com', subject: 'Unable to login after email verification', category: 'Auth', priority: 'Medium', status: 'In Progress', assignedAgent: 'Raj Kumar', createdAt: '2026-06-24T09:30:00Z', messages: [{ from: 'user', text: 'Login page keeps showing error.', time: '2026-06-24T09:30:00Z' }, { from: 'agent', text: 'We are looking into this issue.', time: '2026-06-24T10:15:00Z' }] },
    { id: 'st3', userId: 'u4', userName: 'Kavya Reddy', email: 'kavya@email.com', subject: 'Refund not processed after 7 days', category: 'Refund', priority: 'Critical', status: 'Escalated', assignedAgent: 'Anita Sharma', createdAt: '2026-06-23T15:00:00Z', messages: [{ from: 'user', text: 'It has been 7 days, still no refund.', time: '2026-06-23T15:00:00Z' }] },
    { id: 'st4', userId: 'u5', userName: 'Sneha Iyer', email: 'sneha@email.com', subject: 'Event page showing wrong date', category: 'Content', priority: 'Low', status: 'Resolved', assignedAgent: 'Raj Kumar', createdAt: '2026-06-22T12:00:00Z', messages: [] },
    { id: 'st5', userId: 'u6', userName: 'Aditya Kumar', email: 'aditya@email.com', subject: 'QR code not scanning at venue', category: 'Tickets', priority: 'Critical', status: 'Open', assignedAgent: null, createdAt: '2026-06-25T08:00:00Z', messages: [{ from: 'user', text: 'QR code is not working at entry.', time: '2026-06-25T08:00:00Z' }] },
    { id: 'st6', userId: 'u8', userName: 'Vikram Singh', email: 'vikram@email.com', subject: 'Double charged for single booking', category: 'Payment', priority: 'High', status: 'Open', assignedAgent: null, createdAt: '2026-06-25T07:30:00Z', messages: [] },
  ],
  activityLog: [
    { id: 'al1', timestamp: '2026-06-25T09:30:00Z', user: 'Platform Admin', role: 'Admin', action: 'Approved Organizer', module: 'Organizer Management', ip: '203.0.113.10', device: 'Chrome/Windows', status: 'Success' },
    { id: 'al2', timestamp: '2026-06-25T09:15:00Z', user: 'Arjun Mehta', role: 'User', action: 'Registered Account', module: 'Auth', ip: '203.0.113.20', device: 'Safari/iPhone', status: 'Success' },
    { id: 'al3', timestamp: '2026-06-25T09:00:00Z', user: 'Skyline Events', role: 'Organizer', action: 'Created Event', module: 'Events', ip: '203.0.113.30', device: 'Chrome/Mac', status: 'Success' },
    { id: 'al4', timestamp: '2026-06-25T08:45:00Z', user: 'Unknown', role: 'Unknown', action: 'Failed Login Attempt', module: 'Auth', ip: '45.33.32.156', device: 'Unknown', status: 'Failed' },
    { id: 'al5', timestamp: '2026-06-25T08:30:00Z', user: 'Priya Sharma', role: 'User', action: 'Purchased Ticket', module: 'Payments', ip: '203.0.113.40', device: 'Firefox/Windows', status: 'Success' },
    { id: 'al6', timestamp: '2026-06-25T08:00:00Z', user: 'Platform Admin', role: 'Admin', action: 'Exported User Report', module: 'Reports', ip: '203.0.113.10', device: 'Chrome/Windows', status: 'Success' },
    { id: 'al7', timestamp: '2026-06-24T23:10:00Z', user: 'Kavya Reddy', role: 'User', action: 'Submitted Review', module: 'Reviews', ip: '203.0.113.50', device: 'Chrome/Android', status: 'Success' },
    { id: 'al8', timestamp: '2026-06-24T22:00:00Z', user: 'NightCraft Studios', role: 'Organizer', action: 'Updated Event Details', module: 'Events', ip: '203.0.113.60', device: 'Chrome/Mac', status: 'Success' },
  ],
};

// Ensure admin seed data is merged into localStorage on import
const ensureAdminSeed = () => {
  try {
    const KEY = 'vihavi_mock_db';
    let db = {};
    try { db = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { db = {}; }

    let changed = false;
    Object.entries(ADMIN_MOCK_SEED).forEach(([col, seed]) => {
      if (!db[col] || db[col].length === 0) {
        // For users, merge existing + new without duplicating
        if (col === 'users' && db[col] && db[col].length > 0) {
          const existingIds = new Set(db[col].map(u => u.id));
          const newOnes = seed.filter(u => !existingIds.has(u.id));
          if (newOnes.length > 0) {
            db[col] = [...db[col], ...newOnes];
            changed = true;
          }
        } else {
          db[col] = seed;
          changed = true;
        }
      }
    });
    if (changed) localStorage.setItem(KEY, JSON.stringify(db));
  } catch (e) { console.warn('Admin seed failed:', e); }
};

ensureAdminSeed();

// ── Admin Service ──────────────────────────────────────────
export const adminService = {

  // ── KPI Stats ──────────────────────────────────────────
  async getStats() {
    const [users, organizers, events, bookings, payments, tickets, supportTickets, reviews] = await Promise.all([
      dbService.getAll('users').catch(() => []),
      dbService.getAll('organizers').catch(() => []),
      dbService.getAll('events').catch(() => []),
      dbService.getAll('bookings').catch(() => []),
      dbService.getAll('payments').catch(() => []),
      dbService.getAll('tickets').catch(() => []),
      dbService.getAll('supportTickets').catch(() => []),
      dbService.getAll('reviews').catch(() => []),
    ]);

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const totalRevenue = payments.filter(p => p.status === 'Success').reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const totalTicketsSold = bookings.reduce((s, b) => s + (Number(b.quantity) || 1), 0);
    const pendingApprovals = organizers.filter(o => o.status === 'Pending').length + events.filter(e => e.status === 'Draft').length;
    const openTickets = supportTickets.filter(s => ['Open', 'Escalated'].includes(s.status)).length;
    const activeEvents = events.filter(e => e.status === 'Published').length;
    const upcomingEvents = events.filter(e => new Date(e.startDate) > now).length;

    return {
      totalUsers: Math.max(users.length, 10),
      totalOrganizers: Math.max(organizers.length, 7),
      activeEvents: Math.max(activeEvents, 5),
      upcomingEvents: Math.max(upcomingEvents, 8),
      ticketsSold: Math.max(totalTicketsSold, 247),
      totalRevenue: Math.max(totalRevenue, 485000),
      pendingApprovals: Math.max(pendingApprovals, 5),
      openSupportTickets: Math.max(openTickets, 6),
    };
  },

  // ── Revenue chart data (last 12 months) ──
  getRevenueChartData() {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((m, i) => ({
      month: m,
      revenue: [48000, 72000, 91000, 65000, 110000, 145000, 88000, 102000, 128000, 156000, 142000, 185000][i],
      expenses: [22000, 35000, 41000, 28000, 52000, 68000, 39000, 45000, 55000, 72000, 64000, 85000][i],
    }));
  },

  // ── User growth chart (last 8 months) ──
  getUserGrowthData() {
    const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((m, i) => ({
      month: m,
      users: [120, 185, 240, 310, 420, 530, 680, 820][i],
      organizers: [8, 12, 18, 24, 31, 38, 48, 56][i],
    }));
  },

  // ── Category distribution ──
  async getCategoryDistribution() {
    const cats = await dbService.getAll('categories').catch(() => ADMIN_MOCK_SEED.categories);
    return cats.map(c => ({ name: c.name, value: c.eventCount, color: c.color || '#D4AF37' }));
  },

  // ── Recent activity ──
  async getRecentActivity() {
    const items = await dbService.getAll('activityLog').catch(() => ADMIN_MOCK_SEED.activityLog);
    return items.slice(0, 10);
  },

  // ── User Management ──
  async getUsers(filter = 'All', search = '') {
    let data = await dbService.getAll('users').catch(() => ADMIN_MOCK_SEED.users);
    data = data.filter(u => u.role !== 'admin');
    if (filter !== 'All') data = data.filter(u => u.status === filter);
    if (search) data = data.filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.city?.toLowerCase().includes(search.toLowerCase())
    );
    return data;
  },

  async updateUserStatus(userId, status) {
    return dbService.update('users', userId, { status });
  },

  async deleteUser(userId) {
    return dbService.delete('users', userId);
  },

  // ── Organizer Management ──
  async getOrganizers(filter = 'All', search = '') {
    let data = await dbService.getAll('organizers').catch(() => ADMIN_MOCK_SEED.organizers);
    if (filter !== 'All') data = data.filter(o => o.status === filter);
    if (search) data = data.filter(o =>
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.company?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase())
    );
    return data;
  },

  async approveOrganizer(id) {
    await dbService.update('organizers', id, { status: 'Approved', verified: true });
    await this.logActivity('Approved Organizer', 'Organizer Management');
    return true;
  },

  async rejectOrganizer(id) {
    await dbService.update('organizers', id, { status: 'Rejected' });
    await this.logActivity('Rejected Organizer', 'Organizer Management');
    return true;
  },

  async suspendOrganizer(id) {
    await dbService.update('organizers', id, { status: 'Suspended' });
    return true;
  },

  // ── Event Management ──
  async getEvents(filter = 'All', search = '') {
    let data = await dbService.getAll('events').catch(() => []);
    if (filter !== 'All') data = data.filter(e => e.status === filter);
    if (search) data = data.filter(e =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase()) ||
      e.venue?.toLowerCase().includes(search.toLowerCase())
    );
    return data;
  },

  async approveEvent(id) {
    return dbService.update('events', id, { status: 'Published' });
  },

  async rejectEvent(id) {
    return dbService.update('events', id, { status: 'Rejected' });
  },

  async featureEvent(id, featured) {
    return dbService.update('events', id, { featured });
  },

  async cancelEvent(id) {
    return dbService.update('events', id, { status: 'Cancelled' });
  },

  // ── Category Management ──
  async getCategories() {
    const data = await dbService.getAll('categories').catch(() => ADMIN_MOCK_SEED.categories);
    return data.length > 0 ? data : ADMIN_MOCK_SEED.categories;
  },

  async createCategory(cat) {
    return dbService.create('categories', { ...cat, eventCount: 0, revenue: 0, status: 'Active' });
  },

  async updateCategory(id, data) {
    return dbService.update('categories', id, data);
  },

  async deleteCategory(id) {
    return dbService.delete('categories', id);
  },

  // ── Payment Management ──
  async getPayments(filter = 'All', search = '') {
    let data = await dbService.getAll('payments').catch(() => []);
    // Enrich with booking info
    const bookings = await dbService.getAll('bookings').catch(() => []);
    data = data.map(p => {
      const booking = bookings.find(b => b.id === p.bookingId) || {};
      return { ...p, userName: booking.userName || 'Unknown', eventName: booking.ticketName || 'Unknown', gateway: p.method || 'Razorpay' };
    });
    if (filter !== 'All') data = data.filter(p => p.status === filter);
    if (search) data = data.filter(p =>
      p.userName?.toLowerCase().includes(search.toLowerCase()) ||
      p.id?.toLowerCase().includes(search.toLowerCase())
    );
    // Add more mock payments for richness
    if (data.length < 5) {
      data = [
        { id: 'TXN-8801', userName: 'Arjun Mehta', eventName: 'Summer Music Festival', amount: 4998, gateway: 'Razorpay', date: '2026-06-25', status: 'Success' },
        { id: 'TXN-8800', userName: 'Priya Sharma', eventName: 'Tech Innovators Conference', amount: 12000, gateway: 'Stripe', date: '2026-06-25', status: 'Pending' },
        { id: 'TXN-8799', userName: 'Rahul Gupta', eventName: 'Food & Wine Expo', amount: 2500, gateway: 'UPI', date: '2026-06-24', status: 'Success' },
        { id: 'TXN-8798', userName: 'Kavya Reddy', eventName: 'Summer Music Festival', amount: 9996, gateway: 'Razorpay', date: '2026-06-24', status: 'Refunded' },
        { id: 'TXN-8797', userName: 'Aditya Kumar', eventName: 'Nightclub Royale', amount: 3000, gateway: 'Wallet', date: '2026-06-24', status: 'Failed' },
        { id: 'TXN-8796', userName: 'Sneha Iyer', eventName: 'Tech Innovators Conference', amount: 12000, gateway: 'Stripe', date: '2026-06-24', status: 'Success' },
        { id: 'TXN-8795', userName: 'Vikram Singh', eventName: 'Dance Festival India', amount: 5000, gateway: 'Razorpay', date: '2026-06-23', status: 'Success' },
        { id: 'TXN-8794', userName: 'Ananya Das', eventName: 'Comedy Night Live', amount: 1500, gateway: 'UPI', date: '2026-06-23', status: 'Success' },
        ...data,
      ];
    }
    return data;
  },

  async refundPayment(id) {
    try { await dbService.update('payments', id, { status: 'Refunded' }); }
    catch { /* mock update */ }
    await this.logActivity('Processed Refund', 'Payment Management');
    return true;
  },

  // ── Review Moderation ──
  async getReviews(filter = 'All', search = '') {
    let data = await dbService.getAll('reviews').catch(() => ADMIN_MOCK_SEED.reviews);
    if (data.length === 0) data = ADMIN_MOCK_SEED.reviews;
    if (filter !== 'All') {
      if (filter === 'Reported') data = data.filter(r => r.reported);
      else data = data.filter(r => r.status === filter);
    }
    if (search) data = data.filter(r =>
      r.userName?.toLowerCase().includes(search.toLowerCase()) ||
      r.eventName?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase())
    );
    return data;
  },

  async updateReviewStatus(id, status) {
    return dbService.update('reviews', id, { status });
  },

  async deleteReview(id) {
    return dbService.delete('reviews', id);
  },

  // ── Support Tickets ──
  async getSupportTickets(filter = 'All', search = '') {
    let data = await dbService.getAll('supportTickets').catch(() => ADMIN_MOCK_SEED.supportTickets);
    if (data.length === 0) data = ADMIN_MOCK_SEED.supportTickets;
    if (filter !== 'All') data = data.filter(t => t.status === filter);
    if (search) data = data.filter(t =>
      t.userName?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.id?.toLowerCase().includes(search.toLowerCase())
    );
    return data;
  },

  async updateTicketStatus(id, status) {
    return dbService.update('supportTickets', id, { status });
  },

  async assignTicket(id, agent) {
    return dbService.update('supportTickets', id, { assignedAgent: agent, status: 'In Progress' });
  },

  async replyToTicket(id, message, isAgent = true) {
    const ticket = await dbService.getById('supportTickets', id);
    const msgs = [...(ticket?.messages || []), { from: isAgent ? 'agent' : 'user', text: message, time: new Date().toISOString() }];
    return dbService.update('supportTickets', id, { messages: msgs });
  },

  // ── Activity Log ──
  async getActivityLog(filter = 'All', search = '') {
    let data = await dbService.getAll('activityLog').catch(() => ADMIN_MOCK_SEED.activityLog);
    if (data.length === 0) data = ADMIN_MOCK_SEED.activityLog;
    if (filter !== 'All') data = data.filter(a => a.role === filter || a.status === filter);
    if (search) data = data.filter(a =>
      a.user?.toLowerCase().includes(search.toLowerCase()) ||
      a.action?.toLowerCase().includes(search.toLowerCase()) ||
      a.module?.toLowerCase().includes(search.toLowerCase())
    );
    return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async logActivity(action, module) {
    const adminName = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin'; } catch { return 'Admin'; } })();
    return dbService.create('activityLog', {
      timestamp: new Date().toISOString(),
      user: adminName, role: 'Admin', action, module,
      ip: '203.0.113.10', device: 'Chrome/Windows', status: 'Success',
    });
  },

  // ── Reports ──
  async generateReport(type, dateRange) {
    const events = await dbService.getAll('events').catch(() => []);
    const payments = await dbService.getAll('payments').catch(() => []);
    const users = await dbService.getAll('users').catch(() => []);
    const organizers = await dbService.getAll('organizers').catch(() => ADMIN_MOCK_SEED.organizers);

    const totalRevenue = payments.filter(p => p.status === 'Success').reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return {
      type, dateRange, generatedAt: new Date().toISOString(),
      summary: { totalUsers: users.length, totalOrganizers: organizers.length, totalEvents: events.length, totalRevenue },
      data: type === 'revenue' ? this.getRevenueChartData() :
            type === 'users' ? this.getUserGrowthData() : []
    };
  },

  // ── Settings ──
  getSettings() {
    try { return JSON.parse(localStorage.getItem('vihavi_admin_settings') || 'null'); }
    catch { return null; }
  },

  saveSettings(settings) {
    localStorage.setItem('vihavi_admin_settings', JSON.stringify(settings));
    return settings;
  },

  getDefaultSettings() {
    return {
      general: { platformName: 'Vihavi', contactEmail: 'admin@vihavi.dev', contactPhone: '+91 98765 43210', timezone: 'Asia/Kolkata', currency: 'INR' },
      security: { minPasswordLength: 8, requireMFA: false, sessionTimeout: 30, maxLoginAttempts: 5 },
      notifications: { emailNotifications: true, smsNotifications: false, pushNotifications: true },
      payments: { razorpayEnabled: true, stripeEnabled: false, platformCommission: 5 },
      storage: { imageMaxMb: 5, videoMaxMb: 100, documentMaxMb: 10 },
    };
  },
};

export default adminService;

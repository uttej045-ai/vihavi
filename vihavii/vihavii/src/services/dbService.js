import api from './api';

const LOCAL_STORAGE_KEY = 'vihavi_mock_db';

// Helper to initialize local data structure
const getInitialData = () => ({
  users: [
    { id: "1", email: "vihavi@gmail.com", password: "111", role: "user", name: "Vihavi" },
    { id: "mock-organizer-456", email: "organizer@vihavi.dev", password: "password", role: "ORGANIZER", name: "Test Organizer" },
    { id: "event@gmail.com", email: "event@gmail.com", password: "123456", role: "ORGANIZER", name: "Event Manager" }
  ],
  organizers: [
    {
      id: "mock-organizer-456",
      name: "Vihavi Event Management",
      email: "organizer@vihavi.dev",
      phone: "+91 98765 43210",
      location: "Hyderabad, India",
      about: "We are a premier event management company specializing in tech conferences, open mics, and exclusive social gatherings across India.",
      logo: "",
      website: "https://vihavi.dev",
      twitter: "@vihavievents",
      linkedin: "linkedin.com/company/vihavi"
    }
  ],
  events: [
    {
      id: "1",
      name: "Summer Music Festival 2026",
      summary: "Experience the ultimate summer music festival with top artists.",
      description: "Experience the ultimate summer music festival with top artists from around the world. Enjoy amazing food, great company, and unforgettable performances. Gates open at 4 PM.",
      category: "Music",
      tags: "festival, summer, music",
      type: "Public",
      venue: "Central Park Arena",
      address: "Central Park Arena, NY",
      city: "New York",
      state: "NY",
      country: "USA",
      mapsLink: "https://maps.google.com",
      isOnline: false,
      startDate: "2026-08-15",
      endDate: "2026-08-15",
      startTime: "18:00",
      endTime: "23:00",
      timeZone: "EST",
      logo: "",
      background: "burgundy",
      qrPlacement: "center",
      banner: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800&h=400",
      gallery: [],
      video: "",
      terms: "No refunds within 24 hours of event.",
      refundPolicy: "Refundable up to 7 days before.",
      instructions: "Carry your ID card and QR ticket.",
      whatToBring: "Good vibes and your ticket.",
      isPrivate: false,
      isInviteOnly: false,
      guestList: [],
      questions: ["Name", "Email", "Phone"],
      coupons: ["SUMMER50"],
      isSoldOut: false,
      enableWaitlist: true,
      notifyWaitlist: true,
      faqs: [{ q: "Is there parking available?", a: "Yes, free parking is available." }],
      visibility: "Public",
      status: "Published",
      bookingLimit: 5,
      cancellationPolicy: "Standard",
      createdBy: "mock-organizer-456"
    },
    {
      id: "2",
      name: "Tech Innovators Conference 2026",
      summary: "Join the brightest minds in tech for a two-day conference.",
      description: "Join the brightest minds in tech for a two-day conference exploring the future of AI, web development, and cloud computing.",
      category: "Technology",
      tags: "tech, conference, AI",
      type: "Public",
      venue: "Moscone Center",
      address: "Moscone Center, SF",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      mapsLink: "https://maps.google.com",
      isOnline: false,
      startDate: "2026-09-10",
      endDate: "2026-09-11",
      startTime: "09:00",
      endTime: "17:00",
      timeZone: "PST",
      logo: "",
      background: "black",
      qrPlacement: "bottom-right",
      banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800&h=400",
      gallery: [],
      video: "",
      terms: "Strict security check.",
      refundPolicy: "No refunds.",
      instructions: "Arrive 30 minutes early.",
      whatToBring: "Laptop, Notebook.",
      isPrivate: false,
      isInviteOnly: false,
      guestList: [],
      questions: ["Name", "Email", "Company"],
      coupons: [],
      isSoldOut: false,
      enableWaitlist: false,
      notifyWaitlist: false,
      faqs: [],
      visibility: "Public",
      status: "Published",
      bookingLimit: 2,
      cancellationPolicy: "No-Cancellation",
      createdBy: "mock-organizer-456"
    }
  ],
  tickets: [
    { id: "t1", eventId: "1", name: "Early Bird", price: 50, quantity: 100, sold: 40, saleStart: "2026-06-01", saleEnd: "2026-07-01" },
    { id: "t2", eventId: "1", name: "General Admission", price: 75, quantity: 200, sold: 120, saleStart: "2026-07-01", saleEnd: "2026-08-14" },
    { id: "t3", eventId: "1", name: "VIP Pass", price: 150, quantity: 50, sold: 15, saleStart: "2026-06-01", saleEnd: "2026-08-14" },
    { id: "t4", eventId: "2", name: "Standard Pass", price: 120, quantity: 300, sold: 85, saleStart: "2026-06-01", saleEnd: "2026-09-09" }
  ],
  bookings: [
    { id: "101", eventId: "2", ticketId: "t4", userName: "John Doe", userEmail: "john@example.com", userPhone: "+91 99999 88888", ticketName: "Standard Pass", ticketPrice: 120, quantity: 2, totalPaid: 240, date: "2026-06-20", status: "Confirmed", checkInStatus: "Pending" },
    { id: "102", eventId: "1", ticketId: "t2", userName: "Alice Smith", userEmail: "alice@example.com", userPhone: "+91 88888 77777", ticketName: "General Admission", ticketPrice: 75, quantity: 4, totalPaid: 300, date: "2026-06-21", status: "Confirmed", checkInStatus: "Checked In", checkedInAt: "2026-06-23T10:00:00Z" },
    { id: "103", eventId: "1", ticketId: "t3", userName: "Bob Johnson", userEmail: "bob@example.com", userPhone: "+91 77777 66666", ticketName: "VIP Pass", ticketPrice: 150, quantity: 1, totalPaid: 150, date: "2026-06-22", status: "Pending", checkInStatus: "Pending" }
  ],
  payments: [
    { id: "p101", bookingId: "101", amount: 240, date: "2026-06-20", method: "Razorpay", status: "Success" },
    { id: "p102", bookingId: "102", amount: 300, date: "2026-06-21", method: "Razorpay", status: "Success" },
    { id: "p103", bookingId: "103", amount: 150, date: "2026-06-22", method: "Razorpay", status: "Pending" }
  ],
  coupons: [
    { id: "c1", eventId: "1", code: "SUMMER50", discountType: "Percentage", value: 50, expiry: "2026-08-01" },
    { id: "c2", eventId: "2", code: "TECH10", discountType: "Fixed Amount", value: 10, expiry: "2026-09-01" }
  ],
  faqs: [
    { id: "f1", eventId: "1", question: "Is outside food allowed?", answer: "No, outside food and drinks are not allowed inside the venue." }
  ],
  notifications: [
    { id: "n1", type: "booking", message: "New booking for Summer Music Festival by Alice Smith (4 tickets)", timestamp: "2026-06-21T14:32:00Z", read: false },
    { id: "n2", type: "payment", message: "Payment of ₹150 pending from Bob Johnson", timestamp: "2026-06-22T09:15:00Z", read: false }
  ],
  attendees: [
    { id: "a1", bookingId: "101", eventId: "2", name: "John Doe", email: "john@example.com", phone: "+91 99999 88888", company: "TechCorp", checkedIn: false },
    { id: "a2", bookingId: "102", eventId: "1", name: "Alice Smith", email: "alice@example.com", phone: "+91 88888 77777", company: "Music Fan", checkedIn: true, checkedInAt: "2026-06-23T10:00:00Z" }
  ]
});

// Initialize LocalStorage if not exists, and merge missing collections
const getLocalDB = () => {
  let dbStr = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!dbStr) {
    const initial = getInitialData();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  
  try {
    const db = JSON.parse(dbStr);
    const initial = getInitialData();
    let updated = false;
    
    Object.keys(initial).forEach(key => {
      if (!db[key] || !Array.isArray(db[key]) || db[key].length === 0) {
        db[key] = initial[key];
        updated = true;
      }
    });
    
    if (updated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
    }
    return db;
  } catch (err) {
    const initial = getInitialData();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
};

const saveLocalDB = (db) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
};

export const dbService = {
  // Check if API server is online
  isServerOnline: async () => {
    try {
      // Short ping check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      await fetch(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001', { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);
      return true;
    } catch {
      return false;
    }
  },

  // Generic Get All
  getAll: async (collection) => {
    try {
      const response = await api.get(`/${collection}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      // If server returns empty list, fall back to local storage mock data
      const db = getLocalDB();
      return db[collection] || [];
    } catch (e) {
      console.warn(`[dbService] API failure for collection '${collection}'. Falling back to local storage.`);
      const db = getLocalDB();
      return db[collection] || [];
    }
  },

  // Generic Get One by ID
  getById: async (collection, id) => {
    try {
      const response = await api.get(`/${collection}/${id}`);
      return response.data;
    } catch (e) {
      console.warn(`[dbService] API failure for collection '${collection}' getById. Falling back to local storage.`);
      const db = getLocalDB();
      return (db[collection] || []).find(item => String(item.id) === String(id));
    }
  },

  // Generic Create
  create: async (collection, data) => {
    const newItem = { ...data, id: data.id || Math.random().toString(36).substring(2, 11) };
    try {
      const response = await api.post(`/${collection}`, newItem);
      return response.data;
    } catch (e) {
      console.warn(`[dbService] API failure for collection '${collection}' create. Falling back to local storage.`);
      const db = getLocalDB();
      if (!db[collection]) db[collection] = [];
      db[collection].push(newItem);
      saveLocalDB(db);
      return newItem;
    }
  },

  // Generic Update
  update: async (collection, id, data) => {
    try {
      const response = await api.patch(`/${collection}/${id}`, data);
      return response.data;
    } catch (e) {
      console.warn(`[dbService] API failure for collection '${collection}' update. Falling back to local storage.`);
      const db = getLocalDB();
      if (!db[collection]) db[collection] = [];
      const index = db[collection].findIndex(item => String(item.id) === String(id));
      if (index !== -1) {
        db[collection][index] = { ...db[collection][index], ...data };
        saveLocalDB(db);
        return db[collection][index];
      }
      throw new Error(`Item ${id} not found in local storage ${collection}`);
    }
  },

  // Generic Delete
  delete: async (collection, id) => {
    try {
      await api.delete(`/${collection}/${id}`);
      return true;
    } catch (e) {
      console.warn(`[dbService] API failure for collection '${collection}' delete. Falling back to local storage.`);
      const db = getLocalDB();
      if (db[collection]) {
        db[collection] = db[collection].filter(item => String(item.id) !== String(id));
        saveLocalDB(db);
      }
      return true;
    }
  }
};

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OrganizerLayout from './OrganizerLayout';

// Lazy loading the page components
const OrganizerDashboard = lazy(() => import('./OrganizerDashboard'));
const MyEvents = lazy(() => import('./MyEvents'));
const CreateEvent = lazy(() => import('./CreateEvent'));
const EventBookings = lazy(() => import('./EventBookings'));
const OrganizerProfile = lazy(() => import('./OrganizerProfile'));

// New sub-pages
const Attendees = lazy(() => import('./Attendees'));
const QRScanner = lazy(() => import('./QRScanner'));
const TicketManagement = lazy(() => import('./TicketManagement'));
const Analytics = lazy(() => import('./Analytics'));
const Revenue = lazy(() => import('./Revenue'));
const Notifications = lazy(() => import('./Notifications'));
const Messages = lazy(() => import('./Messages'));
const HelpSupport = lazy(() => import('./HelpSupport'));

const OrganizerRoutes = () => {
  return (
    <Suspense fallback={<div className="organizer-loading">Loading Organizer Portal...</div>}>
      <Routes>
        <Route element={<OrganizerLayout />}>
          <Route index element={<OrganizerDashboard />} />
          <Route path="events" element={<MyEvents />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="bookings" element={<EventBookings />} />
          <Route path="profile" element={<OrganizerProfile />} />
          
          {/* New Luxury Dashboard Routes */}
          <Route path="attendees" element={<Attendees />} />
          <Route path="scanner" element={<QRScanner />} />
          <Route path="tickets" element={<TicketManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="messages" element={<Messages />} />
          <Route path="help" element={<HelpSupport />} />
          
          <Route path="*" element={<Navigate to="" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default OrganizerRoutes;

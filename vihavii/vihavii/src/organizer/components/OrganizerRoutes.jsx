import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OrganizerLayout from './OrganizerLayout';

// Lazy loading the page components
const OrganizerDashboard = lazy(() => import('./OrganizerDashboard'));
const MyEvents = lazy(() => import('./MyEvents'));
const CreateEvent = lazy(() => import('./CreateEvent'));
const EventBookings = lazy(() => import('./EventBookings'));
const OrganizerProfile = lazy(() => import('./OrganizerProfile'));

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
          <Route path="*" element={<Navigate to="" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default OrganizerRoutes;

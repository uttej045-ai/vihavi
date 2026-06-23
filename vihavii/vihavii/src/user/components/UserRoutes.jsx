import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load components
const UserHome = lazy(() => import('./UserHome'));
const Wishlist = lazy(() => import('./Wishlist'));
const Bookings = lazy(() => import('./Bookings'));
const Profile = lazy(() => import('./Profile'));
const EventDetails = lazy(() => import('./EventDetails'));
const Checkout = lazy(() => import('./Checkout'));
const BookingConfirmation = lazy(() => import('./BookingConfirmation'));

const UserLayout = lazy(() => import('./UserLayout'));

const UserRoutes = () => {
  return (
    <Suspense fallback={<div>Loading User Module...</div>}>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Navigate to="home" replace />} />
          <Route path="home" element={<UserHome />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="event/:id" element={<EventDetails />} />
          <Route path="checkout/:id" element={<Checkout />} />
          <Route path="confirmation/:id" element={<BookingConfirmation />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default UserRoutes;

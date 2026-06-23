import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../landingPage/LandingPage';
import Login from '../auth/login/Login';
import Register from '../auth/register/Register';
import ForgotPassword from '../auth/forgotPassword/ForgotPassword';

const UserRoutes = lazy(() => import('../user/components/UserRoutes'));
const OrganizerRoutes = lazy(() => import('../organizer/components/OrganizerRoutes'));

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading Application...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route 
          path="/user/*" 
          element={
            <ProtectedRoute>
              <UserRoutes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/organizer/*" 
          element={
            <ProtectedRoute>
              <OrganizerRoutes />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Suspense>
  );
}

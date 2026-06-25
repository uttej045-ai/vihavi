import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../landingPage/LandingPage';
import Login from '../auth/login/Login';
import Register from '../auth/register/Register';
import ForgotPassword from '../auth/forgotPassword/ForgotPassword';
import ResetPassword from '../auth/resetPassword/ResetPassword';
import VerifyEmail from '../auth/verifyEmail/VerifyEmail';

const UserRoutes = lazy(() => import('../user/components/UserRoutes'));
const OrganizerRoutes = lazy(() => import('../organizer/components/OrganizerRoutes'));
const AdminRoutes = lazy(() => import('../admin/components/AdminRoutes'));

const ProtectedRoute = ({ children, allowedRole }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = (localStorage.getItem("userRole") || '').toLowerCase();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole.toLowerCase()) {
    const redirect = userRole === 'organizer' ? '/organizer' : userRole === 'admin' ? '/admin' : '/user';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading Application...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/user/*"
          element={
            <ProtectedRoute allowedRole="user">
              <UserRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/*"
          element={
            <ProtectedRoute allowedRole="organizer">
              <OrganizerRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

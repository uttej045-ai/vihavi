import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const AdminDashboard          = lazy(() => import('./AdminDashboard'));
const AdminUserManagement     = lazy(() => import('./AdminUserManagement'));
const AdminOrganizerManagement= lazy(() => import('./AdminOrganizerManagement'));
const AdminEventManagement    = lazy(() => import('./AdminEventManagement'));
const AdminCategoryManagement = lazy(() => import('./AdminCategoryManagement'));
const AdminPaymentManagement  = lazy(() => import('./AdminPaymentManagement'));
const AdminReviewModeration   = lazy(() => import('./AdminReviewModeration'));
const AdminSupportTickets     = lazy(() => import('./AdminSupportTickets'));
const AdminPlatformSettings   = lazy(() => import('./AdminPlatformSettings'));
const AdminReports            = lazy(() => import('./AdminReports'));
const AdminActivityLog        = lazy(() => import('./AdminActivityLog'));

const AdminRoutes = () => {
  return (
    <Suspense fallback={<div className="admin-loading">Loading Admin Portal...</div>}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users"       element={<AdminUserManagement />} />
          <Route path="organizers"  element={<AdminOrganizerManagement />} />
          <Route path="events"      element={<AdminEventManagement />} />
          <Route path="categories"  element={<AdminCategoryManagement />} />
          <Route path="payments"    element={<AdminPaymentManagement />} />
          <Route path="reviews"     element={<AdminReviewModeration />} />
          <Route path="support"     element={<AdminSupportTickets />} />
          <Route path="settings"    element={<AdminPlatformSettings />} />
          <Route path="reports"     element={<AdminReports />} />
          <Route path="activity"    element={<AdminActivityLog />} />
          <Route path="*"           element={<Navigate to="" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;

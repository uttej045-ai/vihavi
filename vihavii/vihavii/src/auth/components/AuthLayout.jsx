import React from 'react';
import AuthBanner from './AuthBanner';
import '../auth.css';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page-container">
      <AuthBanner />
      <div className="auth-form-container">
        <div className="auth-form-card">
          {children}
        </div>
      </div>
    </div>
  );
}

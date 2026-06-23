import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { authService } from '../../services/authService';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <h2>Reset Password</h2>
        <p>Enter your email and we'll send you a link to reset your password</p>
      </div>

      {error && <div className="auth-error-alert">{error}</div>}
      {success && (
        <div className="auth-success-alert">
          Reset link sent! Please check your email.
        </div>
      )}

      {!success && (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-auth-submit" disabled={isLoading}>
            {isLoading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <div className="auth-footer" style={{ marginTop: '24px' }}>
        <Link to="/login" className="auth-link">← Back to Login</Link>
      </div>
    </AuthLayout>
  );
}

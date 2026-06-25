import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { authService } from '../../services/authService';
import { Lock } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.resetPassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <h2>Reset Your Password</h2>
        <p>Please enter your new password below</p>
      </div>

      {error && <div className="auth-error-alert" style={{ color: '#ff4d4f', backgroundColor: 'rgba(255,77,79,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(255,77,79,0.3)', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
      {success && (
        <div className="auth-success-alert" style={{ color: '#52c41a', backgroundColor: 'rgba(82,196,26,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(82,196,26,0.3)', fontSize: '14px', textAlign: 'center' }}>
          Password reset successfully! Redirecting to login...
        </div>
      )}

      {!success && (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="password" className="form-label" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d9d9d9' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="confirmPassword" className="form-label" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d9d9d9' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-auth-submit" 
            disabled={isLoading}
            style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #7A0019 0%, #5A0013 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      <div className="auth-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link to="/login" className="auth-link" style={{ color: '#7A0019', textDecoration: 'none' }}>← Back to Login</Link>
      </div>
    </AuthLayout>
  );
}

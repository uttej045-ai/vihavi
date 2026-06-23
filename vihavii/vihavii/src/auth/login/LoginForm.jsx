import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import SocialLogin from '../components/SocialLogin';
import { authService } from '../../services/authService';

export default function LoginForm({ onToggleForm }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.login(email, password);
      navigate('/user');
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  const handleAppleLogin = () => {
    console.log('Apple login clicked');
  };

  return (
    <>
      <div className="logoHeader">
        <h2 className="logoText">Vihavi</h2>
        <p className="tagline">Welcome back</p>
      </div>

      {error && <div className="auth-error-alert">{error}</div>}

      {import.meta.env.VITE_DEV_AUTH_MODE === 'true' && (
        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid #ffeeba' }}>
          <strong style={{ display: 'block', marginBottom: '5px' }}>DEVELOPMENT ONLY: Mock Auth</strong>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => { setEmail('admin@vihavi.dev'); setPassword('password'); }} style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #856404', background: '#ffeeba', color: '#856404', fontWeight: 'bold' }}>Admin</button>
            <button type="button" onClick={() => { setEmail('organizer@vihavi.dev'); setPassword('password'); }} style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #856404', background: '#ffeeba', color: '#856404', fontWeight: 'bold' }}>Organizer</button>
            <button type="button" onClick={() => { setEmail('attendee@vihavi.dev'); setPassword('password'); }} style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #856404', background: '#ffeeba', color: '#856404', fontWeight: 'bold' }}>Attendee</button>
          </div>
        </div>
      )}

      <form className="auth-form" onSubmit={handleLogin}>
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

        <PasswordInput
          label="Password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />

        <div className="forgot-password-link" style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '10px' }}>
          <Link to="/forgot-password" className="forgotPassword">Forgot Password?</Link>
        </div>

        <button type="submit" className="btn-auth-submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <SocialLogin onGoogleLogin={handleGoogleLogin} onAppleLogin={handleAppleLogin} />

      <div className="footerText">
        Don't have an account? 
        {onToggleForm ? (
          <span className="footerLink" onClick={onToggleForm}>Register</span>
        ) : (
          <Link to="/register" className="footerLink">Register</Link>
        )}
      </div>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { authService } from '../../services/authService';
import { CheckCircle, ShieldAlert } from 'lucide-react';

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const doVerify = async () => {
      try {
        const res = await authService.verifyEmail();
        setStatus('success');
        setMessage(res.message || 'Your email has been verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Failed to verify email. Link may be invalid or expired.');
      }
    };
    doVerify();
  }, []);

  return (
    <AuthLayout>
      <div className="auth-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2>Email Verification</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 10px', textAlign: 'center' }}>
        {status === 'verifying' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <div className="verify-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(122,0,25,0.1)', borderTopColor: '#7A0019', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ color: '#666', fontSize: '15px' }}>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <CheckCircle size={60} color="#52c41a" />
            <p style={{ color: '#333', fontSize: '16px', fontWeight: '500' }}>{message}</p>
            <p style={{ color: '#777', fontSize: '14px' }}>You can now log in and manage your events.</p>
            <Link 
              to="/login" 
              className="btn-auth-submit" 
              style={{ display: 'inline-block', width: '200px', padding: '12px', background: 'linear-gradient(135deg, #7A0019 0%, #5A0013 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none', marginTop: '10px' }}
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <ShieldAlert size={60} color="#ff4d4f" />
            <p style={{ color: '#333', fontSize: '16px', fontWeight: '500' }}>{message}</p>
            <Link to="/login" className="auth-link" style={{ color: '#7A0019', textDecoration: 'none', fontWeight: '500' }}>Back to Login</Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

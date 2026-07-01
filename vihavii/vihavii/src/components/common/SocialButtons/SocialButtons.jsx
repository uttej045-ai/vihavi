import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';

export default function SocialButtons({ actionText }) {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('google_client_id') || ''
  );
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempClientId, setTempClientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    setError('');
    try {
      const idToken = response.credential;
      console.log("[Google Auth] Received ID Token from Google GSI");
      
      // Attempt to determine chosen role from register page selection if applicable
      let chosenRole = 'attendee';
      const organizerRadio = document.querySelector('input[value="organizer"]');
      const organizerButton = document.querySelector('[class*="userType"] button:nth-child(2), [class*="Role"] button:nth-child(2)');
      
      if (organizerRadio && organizerRadio.checked) {
        chosenRole = 'organizer';
      } else if (organizerButton && (organizerButton.classList.contains('active') || organizerButton.getAttribute('aria-selected') === 'true')) {
        chosenRole = 'organizer';
      }

      // Perform backend google login
      const result = await authService.loginWithGoogle(idToken, chosenRole);
      
      // Redirect based on user role
      const roleLower = result.user.role.toLowerCase();
      if (roleLower === 'organizer') {
        navigate('/organizer');
      } else if (roleLower === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to authenticate with Google. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) return;

    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse
        });

        const btnElement = document.getElementById("google-signin-btn");
        if (btnElement) {
          window.google.accounts.id.renderButton(
            btnElement,
            { 
              theme: "outline", 
              size: "large", 
              width: btnElement.offsetWidth || 350,
              text: actionText.toLowerCase().includes('sign up') ? 'signup_with' : 'signin_with',
              shape: 'rectangular'
            }
          );
        }
      }
    };

    // Dynamically load Google GSI script if not present
    if (window.google) {
      initializeGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.head.appendChild(script);
    }
  }, [clientId, actionText]);

  const handleSaveClientId = (e) => {
    e.preventDefault();
    if (tempClientId.trim()) {
      localStorage.setItem('google_client_id', tempClientId.trim());
      setClientId(tempClientId.trim());
      setIsConfigOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', alignItems: 'center' }}>
      
      {error && (
        <div style={{
          color: '#d93025',
          background: 'rgba(217, 48, 37, 0.08)',
          padding: '0.75rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          textAlign: 'center',
          border: '1px solid rgba(217, 48, 37, 0.2)',
          width: '100%'
        }}>
          {error}
        </div>
      )}

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#666', padding: '0.5rem' }}>
          <div style={{
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #1a73e8',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            animation: 'spin 1s linear infinite'
          }} />
          Verifying Google credential...
        </div>
      )}

      {clientId ? (
        /* Real Google Sign-in Button Container */
        <div id="google-signin-btn" style={{ width: '100%', minHeight: '44px', display: 'flex', justifyContent: 'center' }}></div>
      ) : (
        /* Fallback Configure Button */
        <button 
          type="button"
          onClick={() => setIsConfigOpen(true)}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontWeight: 'bold',
            color: '#1a73e8',
            transition: 'background-color 0.2s',
            fontSize: '0.95rem'
          }}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" height="20" />
          {actionText} Google (Configure Client ID)
        </button>
      )}

      <button 
        type="button"
        style={{
          width: '100%',
          padding: '0.75rem',
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          cursor: 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontWeight: 'bold',
          color: '#aaa',
          opacity: 0.7,
          fontSize: '0.95rem'
        }}
        disabled
      >
        <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" width="20" height="20" style={{ filter: 'grayscale(1)' }} />
        {actionText} Apple
      </button>

      {/* Client ID Configuration Modal */}
      {isConfigOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 15, 20, 0.4)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <form onSubmit={handleSaveClientId} style={{
            background: '#fff',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '24px',
            padding: '2rem',
            width: '90%',
            maxWidth: '450px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#1f1f1f' }}>Google OAuth Configuration</h3>
              <p style={{ fontSize: '0.85rem', color: '#5f6368', margin: 0 }}>
                To enable a real Google Sign-In popup, please enter your Google OAuth 2.0 Web Client ID.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666' }}>Google Client ID</label>
              <input
                type="text"
                placeholder="xxxxxx-xxxxxxxx.apps.googleusercontent.com"
                value={tempClientId}
                onChange={(e) => setTempClientId(e.target.value)}
                required
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ fontSize: '0.75rem', color: '#888', background: '#f5f5f7', padding: '0.75rem', borderRadius: '8px' }}>
              <strong>Tip:</strong> You can create OAuth credentials in the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8' }}>Google Cloud Console</a>. Add <code>http://localhost:5173</code> to the Authorized JavaScript Origins.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#666',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  borderRadius: '8px'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.6rem 1.2rem',
                  background: '#1a73e8',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  borderRadius: '8px'
                }}
              >
                Save & Initialize
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Global CSS injection for spin */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

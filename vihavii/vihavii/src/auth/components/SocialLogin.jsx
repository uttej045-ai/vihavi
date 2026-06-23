import React from 'react';
import '../auth.css';

export default function SocialLogin({ onGoogleLogin, onAppleLogin }) {
  return (
    <>
      <div className="auth-divider">
        <span>or</span>
      </div>
      <div className="social-login-group">
        <button type="button" className="btn-social" onClick={onGoogleLogin}>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
          Continue with Google
        </button>
        <button type="button" className="btn-social" onClick={onAppleLogin}>
          <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" width={20} height={20} />
          Continue with Apple
        </button>
      </div>
    </>
  );
}

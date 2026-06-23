import React from 'react';

export default function SocialButtons({ actionText }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <button 
        type="button"
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
          color: '#333'
        }}
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" height="20" />
        {actionText} Google
      </button>
      <button 
        type="button"
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
          color: '#333'
        }}
      >
        <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" width="20" height="20" />
        {actionText} Apple
      </button>
    </div>
  );
}

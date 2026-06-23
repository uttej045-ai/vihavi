import React from 'react';

export default function AnimatedButton({ children, type = 'button', onClick }) {
  return (
    <button 
      type={type} 
      onClick={onClick}
      style={{
        width: '100%',
        padding: '1rem',
        background: 'linear-gradient(135deg, #7A0019, #5A0013)',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '0.5rem'
      }}
    >
      {children}
    </button>
  );
}

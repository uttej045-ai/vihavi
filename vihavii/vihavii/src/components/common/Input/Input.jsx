import React from 'react';

export default function InputField({ icon: Icon, type, name, placeholder, value, onChange, error }) {
  return (
    <div style={{ marginBottom: '1rem', width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        background: '#fff', 
        border: `1px solid ${error ? '#ef4444' : '#e0e0e0'}`,
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        gap: '0.5rem'
      }}>
        {Icon && <Icon size={20} color={error ? '#ef4444' : '#666'} />}
        <input 
          type={type} 
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%',
            fontSize: '1rem'
          }}
        />
      </div>
      {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
    </div>
  );
}

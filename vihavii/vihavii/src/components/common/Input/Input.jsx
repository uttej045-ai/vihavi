import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function InputField({ icon: Icon, type, name, placeholder, value, onChange, error }) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

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
          type={inputType} 
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            flex: 1,
            minWidth: 0,
            fontSize: '1rem'
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              color: '#666',
              flexShrink: 0
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
    </div>
  );
}

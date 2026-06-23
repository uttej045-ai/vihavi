import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../auth.css';

export default function PasswordInput({ label, id, value, onChange, placeholder, required = true }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="password-input-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          className="form-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
          required={required}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}

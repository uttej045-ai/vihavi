import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import StatsCounter from '../../components/common/StatsCounter/StatsCounter';
import GlassCard from '../../components/common/GlassCard/GlassCard';
import InputField from '../../components/common/Input/Input';
import AnimatedButton from '../../components/common/Button/Button';
import SocialButtons from '../../components/common/SocialButtons/SocialButtons';
import { authService } from '../../services/authService';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate requests
    
    if (validate()) {
      setIsLoading(true);
      setErrors(prev => ({ ...prev, server: '' })); // Clear previous server errors
      
      try {
        const { user } = await authService.login(formData.email, formData.password);
        const role = user.role.toLowerCase();
        if (role === 'organizer') {
          navigate('/organizer');
        } else if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      } catch (err) {
        // Display specific error messages
        setErrors(prev => ({ ...prev, server: err.message || 'Login failed' }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="authContainer">
      <button 
        onClick={() => navigate('/')} 
        className="backButton" 
        aria-label="Back to Home"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>
      <div className="leftSection">
        <div className="particles"></div>
        <motion.div 
          className="leftContent"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="welcomeHeading">
            Welcome Back<br />to <span className="textGradient">Vihavi</span>
          </h1>
          <p className="welcomeText">
            Discover unforgettable events, connect with amazing people, and create memorable experiences.
          </p>
          <StatsCounter />
        </motion.div>
      </div>
      
      <div className="rightSection">
        <div className="formContainer">
          <div className="logoHeader">
            <div className="logoText">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              Vihavi
            </div>
            <div className="tagline">Discover Amazing Events</div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard>
                <form onSubmit={handleSubmit}>
                  {import.meta.env.VITE_DEV_AUTH_MODE === 'true' && (
                    <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid #ffeeba' }}>
                      <strong style={{ display: 'block', marginBottom: '5px' }}>DEVELOPMENT ONLY: Mock Auth</strong>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => setFormData({...formData, email: 'admin@vihavi.dev', password: 'password'})} style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #856404', background: '#ffeeba', color: '#856404', fontWeight: 'bold' }}>Admin</button>
                        <button type="button" onClick={() => setFormData({...formData, email: 'organizer@vihavi.dev', password: 'password'})} style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #856404', background: '#ffeeba', color: '#856404', fontWeight: 'bold' }}>Organizer</button>
                        <button type="button" onClick={() => setFormData({...formData, email: 'attendee@vihavi.dev', password: 'password'})} style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #856404', background: '#ffeeba', color: '#856404', fontWeight: 'bold' }}>Attendee</button>
                      </div>
                    </div>
                  )}
                  <h2 className="formHeader">Login</h2>
                  
                  {errors.server && (
                    <div style={{ 
                      color: '#ff4d4f', 
                      backgroundColor: 'rgba(255, 77, 79, 0.1)', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      marginBottom: '16px', 
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      border: '1px solid rgba(255, 77, 79, 0.3)'
                    }}>
                      {errors.server}
                    </div>
                  )}
                  
                  <InputField
                    icon={Mail}
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                  
                  <InputField
                    icon={Lock}
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                  />
                  
                  <div className="checkboxContainer">
                    <label className="checkboxLabel">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="checkboxInput"
                      />
                      Remember Me
                    </label>
                    <a href="#" className="forgotPassword">Forgot Password?</a>
                  </div>
                  
                  <AnimatedButton type="submit" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                    {isLoading ? 'Connecting...' : 'Login'}
                  </AnimatedButton>
                  
                  <div className="divider">OR</div>
                  
                  <SocialButtons actionText="Continue with" />
                  
                  <div className="footerText">
                    Don't have an account? 
                    <Link to="/register" className="footerLink" aria-label="Navigate to Registration Page">
                      Create Account
                    </Link>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;
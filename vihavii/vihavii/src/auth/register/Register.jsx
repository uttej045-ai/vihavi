import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard/GlassCard';
import InputField from '../../components/common/Input/Input';
import AnimatedButton from '../../components/common/Button/Button';
import SocialButtons from '../../components/common/SocialButtons/SocialButtons';
import UserTypeSelector from '../../components/common/UserTypeSelector/UserTypeSelector';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userType: 'attendee',
    fullName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

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

  const handleUserTypeChange = (type) => {
    setFormData(prev => ({ ...prev, userType: type }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.userType) newErrors.userType = 'User role is required';
    if (!formData.fullName) newErrors.fullName = 'Full Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Registration attempt with:', formData);
      alert('Account created successfully. Please log in to continue.');
      navigate('/login');
    }
  };

  return (
    <div className="authContainer">
      <button 
        onClick={() => navigate('/login')} 
        className="backButton" 
        aria-label="Back to Login"
      >
        <ArrowLeft size={20} /> Back to Login
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
            Create Your Account
          </h1>
          <p className="welcomeText">
            Join as an Attendee or Organizer
          </p>
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
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard>
                <form onSubmit={handleSubmit}>
                  <h2 className="formHeader">Register</h2>

                  <UserTypeSelector value={formData.userType} onChange={handleUserTypeChange} />
                  {errors.userType && <span className="errorMessage" style={{marginTop: '-0.5rem', marginBottom: '0.5rem'}}>{errors.userType}</span>}
                  
                  <InputField
                    icon={User}
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                  />
                  
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
                  
                  <AnimatedButton type="submit">
                    Create Account
                  </AnimatedButton>
                  
                  <div className="divider">OR</div>
                  
                  <SocialButtons actionText="Sign up with" />
                  
                  <div className="footerText">
                    Already have an account? 
                    <Link to="/login" className="footerLink" aria-label="Navigate to Login Page">
                      Login
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

export default Register;
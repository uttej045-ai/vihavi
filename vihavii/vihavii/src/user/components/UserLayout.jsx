import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Bookmark, Ticket, User, MapPin, Bell, Search } from 'lucide-react';
import wishlistService from '../../services/wishlistService';
import '../styles/UserLayout.css';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const [globalWishlist, setGlobalWishlist] = useState([]);
  const [globalWishlistIds, setGlobalWishlistIds] = useState(new Set());

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await wishlistService.getWishlist();
        setGlobalWishlist(data);
        setGlobalWishlistIds(new Set(data.map(item => String(item.eventId || item.id))));
      } catch (error) {
        console.error('Failed to fetch global wishlist', error);
      }
    };
    fetchWishlist();
  }, []);

  const toggleGlobalWishlist = async (event) => {
    const targetEventId = String(event.eventId || event.id);
    const isWishlisted = globalWishlistIds.has(targetEventId);
    
    try {
      if (isWishlisted) {
        // Find the saved wishlist item to get its actual database primary key ID
        const wishlistItem = globalWishlist.find(item => String(item.eventId || item.id) === targetEventId);
        if (wishlistItem) {
          await wishlistService.removeFromWishlist(wishlistItem.id);
          setGlobalWishlist(prev => prev.filter(item => String(item.eventId || item.id) !== targetEventId));
          setGlobalWishlistIds(prev => {
            const next = new Set(prev);
            next.delete(targetEventId);
            return next;
          });
          showToast('Removed from Wishlist');
        }
      } else {
        const newWishlistItem = {
          ...event,
          eventId: targetEventId
        };
        const savedItem = await wishlistService.addToWishlist(newWishlistItem);
        setGlobalWishlist(prev => [...prev, savedItem]);
        setGlobalWishlistIds(prev => {
          const next = new Set(prev);
          next.add(targetEventId);
          return next;
        });
        showToast('Added to Wishlist ❤️');
      }
    } catch (error) {
      console.error('Wishlist toggle failed:', error);
    }
  };

  const navItems = [
    { path: '/user/home', icon: <Home size={24} />, label: 'Home' },
    { path: '/user/wishlist', icon: <Bookmark size={24} />, label: 'Wishlist' },
    { path: '/user/bookings', icon: <Ticket size={24} />, label: 'Bookings' },
    { path: '/user/profile', icon: <User size={24} />, label: 'Profile' }
  ];

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="user-layout">
      {/* Global Top Header (Desktop & Mobile) */}
      <header className="global-app-header">
        <div className="header-left">
          <div className="logo-text" onClick={() => navigate('/user/home')}>Vihavi</div>
          <div className="location-selector">
            <MapPin size={14} /> Mumbai ▼
          </div>
        </div>
        
        {/* Desktop Top Navigation Links */}
        <nav className="desktop-top-nav">
          {navItems.map(item => (
            <div 
              key={item.label} 
              className={`desk-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div className="header-right">
          <button className="icon-btn search-trigger-btn"><Search size={20} /></button>
          <button className="icon-btn"><Bell size={20} /></button>
          <button className="icon-btn avatar-btn" onClick={() => navigate('/user/profile')}><User size={20} /></button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="layout-content">
        <Outlet context={{ showToast, globalWishlist, globalWishlistIds, toggleGlobalWishlist }} />
      </main>

      {/* Global Toast Message */}
      {toastMessage && (
        <div className="toast-message">
          {toastMessage}
        </div>
      )}

      {/* Global Bottom Navigation (Mobile Only) */}
      <nav className="global-bottom-nav">
        {navItems.map(item => (
          <div 
            key={item.label}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`} 
            onClick={() => navigate(item.path)}
          >
            <div className="nav-icon-wrapper">
              {item.icon}
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default UserLayout;

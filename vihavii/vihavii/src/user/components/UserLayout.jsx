import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Bookmark, Ticket, User, Bell, Search, ChevronDown, LogOut, Settings, X } from 'lucide-react';
import wishlistService from '../../services/wishlistService';
import { authService } from '../../services/authService';
import '../styles/UserLayout.css';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifCount] = useState(3);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
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
        const wishlistItem = globalWishlist.find(item => String(item.eventId || item.id) === targetEventId);
        if (wishlistItem) {
          await wishlistService.removeFromWishlist(wishlistItem.id);
          setGlobalWishlist(prev => prev.filter(item => String(item.eventId || item.id) !== targetEventId));
          setGlobalWishlistIds(prev => { const next = new Set(prev); next.delete(targetEventId); return next; });
          showToast('Removed from Wishlist');
        }
      } else {
        const newWishlistItem = { ...event, eventId: targetEventId };
        const savedItem = await wishlistService.addToWishlist(newWishlistItem);
        setGlobalWishlist(prev => [...prev, savedItem]);
        setGlobalWishlistIds(prev => { const next = new Set(prev); next.add(targetEventId); return next; });
        showToast('Added to Wishlist ❤️');
      }
    } catch (error) {
      console.error('Wishlist toggle failed:', error);
    }
  };

  const navLinks = [
    { path: '/user/home', label: 'Home' },
    { path: '/user/home', label: 'Explore Events' },
    { path: '/user/tickets', label: 'My Tickets' },
    { path: '/user/wishlist', label: 'Saved Events' },
  ];

  const mobileNavItems = [
    { path: '/user/home', icon: <Home size={22} />, label: 'Home' },
    { path: '/user/tickets', icon: <Ticket size={22} />, label: 'Tickets' },
    { path: '/user/wishlist', icon: <Bookmark size={22} />, label: 'Saved' },
    { path: '/user/profile', icon: <User size={22} />, label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path || (path !== '/user/home' && location.pathname.startsWith(path));

  const userName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return (u.name || 'User').split(' ')[0];
    } catch { return 'User'; }
  })();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="user-layout">
      {/* Global Top Header */}
      <header className="global-app-header">
        <div className="header-left">
          <div className="logo-text" onClick={() => navigate('/user/home')}>Vihavi</div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-top-nav">
          {navLinks.map(item => (
            <div
              key={item.label}
              className={`desk-nav-item ${isActive(item.path) && item.label === 'My Tickets' ? 'active' :
                isActive(item.path) && item.label === 'Saved Events' ? 'active' :
                item.label === 'Home' && location.pathname === '/user/home' ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div className="header-right">
          {/* Search */}
          {showSearch ? (
            <div className="header-search-bar">
              <Search size={13} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search events..."
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
                <X size={13} />
              </button>
            </div>
          ) : (
            <button className="icon-btn search-trigger-btn" onClick={() => setShowSearch(true)}>
              <Search size={18} />
            </button>
          )}

          {/* Notifications */}
          <button className="icon-btn notif-btn" style={{ position: 'relative' }} onClick={() => navigate('/user/notifications')}>
            <Bell size={18} />
            {notifCount > 0 && (
              <span className="notif-badge">{notifCount}</span>
            )}
          </button>

          {/* User Avatar Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="user-avatar-dropdown-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="avatar-circle">{userName[0]}</div>
              <span className="avatar-name">{userName}</span>
              <ChevronDown size={12} />
            </button>

            {showUserMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 140 }} onClick={() => setShowUserMenu(false)} />
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <div className="udh-avatar">{userName[0]}</div>
                    <div>
                      <div className="udh-name">{userName}</div>
                      <div className="udh-role">Attendee</div>
                    </div>
                  </div>
                  <div className="user-dropdown-divider" />
                  {[
                    { icon: <User size={13} />, label: 'Profile', action: () => { navigate('/user/profile'); setShowUserMenu(false); } },
                    { icon: <Settings size={13} />, label: 'Settings', action: () => setShowUserMenu(false) },
                  ].map(item => (
                    <button key={item.label} className="user-dropdown-item" onClick={item.action}>
                      {item.icon} {item.label}
                    </button>
                  ))}
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item logout-item" onClick={handleLogout}>
                    <LogOut size={13} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="layout-content">
        <Outlet context={{ showToast, globalWishlist, globalWishlistIds, toggleGlobalWishlist }} />
      </main>

      {/* Global Toast Message */}
      {toastMessage && (
        <div className="toast-message">{toastMessage}</div>
      )}

      {/* Global Bottom Navigation (Mobile Only) */}
      <nav className="global-bottom-nav">
        {mobileNavItems.map(item => (
          <div
            key={item.label}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <div className="nav-icon-wrapper">{item.icon}</div>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default UserLayout;

import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import OrganizerHeader from './OrganizerHeader';
import OrganizerBottomNav from './OrganizerBottomNav';
import '../styles/OrganizerLayout.css';

const OrganizerLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Quick role check just in case
    const role = localStorage.getItem("userRole");
    if (role && role !== "organizer") {
      navigate('/user');
    }
  }, [navigate]);

  return (
    <div className="organizer-layout">
      <OrganizerHeader />
      <main className="organizer-main-content">
        <Outlet />
      </main>
      <OrganizerBottomNav />
    </div>
  );
};

export default OrganizerLayout;

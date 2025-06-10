import React from 'react';
import { Link } from 'react-router-dom';
import './LayoutStyles.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <h1>Visitor Management</h1>
        </Link>
      </div>
      
      <div className="navbar-actions">
        <Link to="/profile" className="profile-link">
          <div className="avatar-small">
            {JSON.parse(localStorage.getItem('user') || '{}').name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
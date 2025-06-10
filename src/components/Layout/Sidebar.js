import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './LayoutStyles.css';

const Sidebar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-user">
        <div className="user-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="user-info">
          <h3>{user.name || 'User'}</h3>
          <p>{user.email || 'user@example.com'}</p>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className={isActive('/dashboard')}>
            <Link to="/dashboard">
              <span className="icon">📊</span>
              Dashboard
            </Link>
          </li>
          <li className={isActive('/profile')}>
            <Link to="/profile">
              <span className="icon">👤</span>
              Profile
            </Link>
          </li>
          <li className={isActive('/settings')}>
            <Link to="/settings">
              <span className="icon">⚙️</span>
              Settings
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button 
          className="btn-logout"
          onClick={() => {
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
        >
          <span className="icon">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
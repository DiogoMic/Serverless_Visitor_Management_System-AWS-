import React from 'react';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import './ProfileStyles.css';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <Sidebar />
        
        <div className="main-content">
          <h1>Profile</h1>
          
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="profile-info">
                <h2>{user.name || 'User'}</h2>
                <p>{user.email || 'user@example.com'}</p>
              </div>
            </div>
            
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{user.name || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value">{user.email || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Department</span>
                <span className="detail-value">Not set</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Role</span>
                <span className="detail-value">Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
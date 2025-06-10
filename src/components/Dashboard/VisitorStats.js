import React from 'react';
import './DashboardStyles.css';

const VisitorStats = ({ stats }) => {
  return (
    <div className="stats-container">
      <div className="stat-card">
        <h3>Expected Visitors</h3>
        <div className="stat-value">{stats.expected}</div>
      </div>
      
      <div className="stat-card">
        <h3>Currently Checked In</h3>
        <div className="stat-value">{stats.checkedIn}</div>
      </div>
      
      <div className="stat-card">
        <h3>Completed Visits</h3>
        <div className="stat-value">{stats.completed}</div>
      </div>
    </div>
  );
};

export default VisitorStats;
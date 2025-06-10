import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VisitorLookup from './VisitorLookup';
import VisitorDetails from './VisitorDetails';
import { getAllVisitors } from '../../services/api';
import './SecurityStyles.css';

const SecurityCheckpoint = () => {
  const [visitor, setVisitor] = useState(null);
  const [allVisitors, setAllVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    todayTotal: 0,
    pending: 0,
    checkedIn: 0,
    checkedOut: 0
  });
  const navigate = useNavigate();
  
  const securityUser = JSON.parse(localStorage.getItem('securityUser') || '{}');

  // Fetch all visitors on component mount
  useEffect(() => {
    fetchAllVisitors();
  }, []);

  // Function to fetch all visitors
  const fetchAllVisitors = async () => {
    try {
      setLoading(true);
      const visitors = await getAllVisitors();
      setAllVisitors(visitors);
      
      // Calculate statistics
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      
      const todayVisitors = visitors.filter(v => {
        // Check if estimated arrival is today
        const arrivalDate = new Date(v.EstimatedArrival).toISOString().split('T')[0];
        return arrivalDate === today;
      });
      
      setStats({
        todayTotal: todayVisitors.length,
        pending: visitors.filter(v => v.Status === 'Pending').length,
        checkedIn: visitors.filter(v => v.Status === 'CheckedIn').length,
        checkedOut: visitors.filter(v => v.Status === 'CheckedOut').length
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching visitors:', err);
      setError('Failed to load visitor data');
      setLoading(false);
    }
  };

  const handleVisitorFound = (visitorData) => {
    setVisitor(visitorData);
    setError('');
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setVisitor(null);
  };

  const handleStatusUpdate = (message) => {
    setSuccess(message);
    setVisitor(null); // Clear visitor after status update
    fetchAllVisitors(); // Refresh the visitor list
  };
  
  const handleLogout = () => {
    localStorage.removeItem('securityUser');
    navigate('/security');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="security-container">
      <header className="security-header">
        <h1>Security Checkpoint</h1>
        <div className="security-user">
          <span>Logged in as: {securityUser.name || 'Security Officer'}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>
      
      <main className="security-content">
        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>Expected Today</h3>
            <div className="stat-value">{stats.todayTotal}</div>
          </div>
          
          <div className="stat-card">
            <h3>Pending</h3>
            <div className="stat-value">{stats.pending}</div>
          </div>
          
          <div className="stat-card">
            <h3>Checked In</h3>
            <div className="stat-value">{stats.checkedIn}</div>
          </div>
          
          <div className="stat-card">
            <h3>Checked Out</h3>
            <div className="stat-value">{stats.checkedOut}</div>
          </div>
        </div>
        
        <VisitorLookup 
          onVisitorFound={handleVisitorFound} 
          onError={handleError}
          setLoading={setLoading}
        />
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {loading ? (
          <div className="loading">Loading visitor information...</div>
        ) : visitor ? (
          <VisitorDetails 
            visitor={visitor} 
            onStatusUpdate={handleStatusUpdate}
            setError={setError}
          />
        ) : (
          <div className="visitor-history-section">
            <h2>All Visitors</h2>
            {allVisitors.length === 0 ? (
              <p>No visitor records found.</p>
            ) : (
              <table className="visitor-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Visit Type</th>
                    <th>Estimated Arrival</th>
                    <th>Access Code</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allVisitors.map((visitor, index) => (
                    <tr key={visitor.AccessCode || index}>
                      <td>{visitor.FirstName} {visitor.LastName}</td>
                      <td>{visitor.VisitType}</td>
                      <td>{formatDate(visitor.EstimatedArrival)}</td>
                      <td>{visitor.AccessCode}</td>
                      <td>
                        <span className={`status-badge status-${visitor.Status.toLowerCase()}`}>
                          {visitor.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SecurityCheckpoint;

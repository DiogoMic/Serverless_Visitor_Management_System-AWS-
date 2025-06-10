import React, { useState, useEffect } from 'react';
import { getVisitorHistory } from '../../services/api';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import VisitorStats from './VisitorStats';
import VisitorHistory from './VisitorHistory';
import CreateVisitorModal from './CreateVisitorModal';
import './DashboardStyles.css';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [visitorStats, setVisitorStats] = useState({
    expected: 0,
    checkedIn: 0,
    completed: 0
  });
  const [visitorHistory, setVisitorHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Function to fetch visitor data
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching visitor history for:', user.email);
      const visitorData = await getVisitorHistory(user.email);
      console.log('API response:', visitorData);
      
      // Count statistics
      const stats = {
        expected: visitorData.filter(v => v.Status === 'Pending').length,
        checkedIn: visitorData.filter(v => v.Status === 'CheckedIn').length,
        completed: visitorData.filter(v => v.Status === 'CheckedOut').length
      };
      
      // Show all visitors regardless of status
      setVisitorStats(stats);
      setVisitorHistory(visitorData);
      setError('');
    } catch (error) {
      console.error('Error fetching visitor data:', error);
      setError('Failed to load visitor history');
      setVisitorHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or user changes
  useEffect(() => {
    if (user.email) {
      fetchData();
    }
  }, [user.email]);

  // Handle modal close and refresh data
  const handleModalClose = () => {
    setShowModal(false);
    fetchData(); // Refresh data after creating a new visitor
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <Sidebar />
        
        <div className="main-content">
          <div className="dashboard-header">
            <h1>Welcome, {user.name || 'User'}</h1>
            <button 
              className="btn-create" 
              onClick={() => setShowModal(true)}
            >
              Create Visitor Request
            </button>
          </div>
          
          <VisitorStats stats={visitorStats} />
          
          <div className="history-section">
            <h2>Visitor History</h2>
            {error && <div className="error-message">{error}</div>}
            {loading ? (
              <p>Loading...</p>
            ) : (
              <VisitorHistory visitors={visitorHistory} />
            )}
          </div>
        </div>
      </div>
      
      {showModal && (
        <CreateVisitorModal 
          onClose={handleModalClose}
          userEmail={user.email}
        />
      )}
    </div>
  );
};

export default Dashboard;

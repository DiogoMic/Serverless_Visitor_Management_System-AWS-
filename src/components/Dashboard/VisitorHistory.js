import React from 'react';
import './DashboardStyles.css';

const VisitorHistory = ({ visitors }) => {
  // Improved date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Handle ISO format dates
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid Date';
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'CheckedIn':
        return 'status-checked-in';
      case 'CheckedOut':
        return 'status-checked-out';
      default:
        return '';
    }
  };
  
  // Add console logging to debug the data
  console.log('Visitor data received:', visitors);
  
  return (
    <div className="visitor-table-container">
      {!visitors || visitors.length === 0 ? (
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
            {visitors.map((visitor, index) => (
              <tr key={visitor.AccessCode || visitor.id || index}>
                <td>{visitor.FirstName || ''} {visitor.LastName || ''}</td>
                <td>{visitor.VisitType || 'N/A'}</td>
                <td>{formatDate(visitor.EstimatedArrival)}</td>
                <td>{visitor.AccessCode || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(visitor.Status)}`}>
                    {visitor.Status || 'Unknown'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VisitorHistory;

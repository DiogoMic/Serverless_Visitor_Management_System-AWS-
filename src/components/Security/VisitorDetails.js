import React from 'react';
import { checkInVisitor, checkOutVisitor } from '../../services/api';
import './SecurityStyles.css';

const VisitorDetails = ({ visitor, onStatusUpdate, setError }) => {
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

  const handleCheckIn = async () => {
    try {
      await checkInVisitor(visitor.AccessCode);
      onStatusUpdate('Visitor checked in successfully');
    } catch (error) {
      console.error('Error checking in visitor:', error);
      setError(`Failed to check in visitor: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOutVisitor(visitor.AccessCode);
      onStatusUpdate('Visitor checked out successfully');
    } catch (error) {
      console.error('Error checking out visitor:', error);
      setError(`Failed to check out visitor: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="visitor-details-container">
      <div className="visitor-details-header">
        <h2>Visitor Information</h2>
        <div className={`status-badge status-${visitor.Status.toLowerCase()}`}>
          {visitor.Status}
        </div>
      </div>
      
      <div className="visitor-details-grid">
        <div className="detail-group">
          <label>Name</label>
          <div>{visitor.FirstName} {visitor.LastName}</div>
        </div>
        
        <div className="detail-group">
          <label>Email</label>
          <div>{visitor.Email}</div>
        </div>
        
        <div className="detail-group">
          <label>Phone</label>
          <div>{visitor.Phone}</div>
        </div>
        
        <div className="detail-group">
          <label>Visit Type</label>
          <div>{visitor.VisitType}</div>
        </div>
        
        <div className="detail-group">
          <label>Staff to Visit</label>
          <div>{visitor.StaffToVisit}</div>
        </div>
        
        <div className="detail-group">
          <label>Estimated Arrival</label>
          <div>{formatDate(visitor.EstimatedArrival)}</div>
        </div>
        
        <div className="detail-group">
          <label>ID Type</label>
          <div>{visitor.IdentityCard}</div>
        </div>
        
        <div className="detail-group">
          <label>Reason for Visit</label>
          <div>{visitor.Reason}</div>
        </div>
        
        {visitor.MultiDayVisit && (
          <>
            <div className="detail-group">
              <label>Start Date</label>
              <div>{formatDate(visitor.StartDate)}</div>
            </div>
            
            <div className="detail-group">
              <label>End Date</label>
              <div>{formatDate(visitor.EndDate)}</div>
            </div>
          </>
        )}
        
        {visitor.checkInTime && (
          <div className="detail-group">
            <label>Check-in Time</label>
            <div>{formatDate(visitor.checkInTime)}</div>
          </div>
        )}
        
        {visitor.checkOutTime && (
          <div className="detail-group">
            <label>Check-out Time</label>
            <div>{formatDate(visitor.checkOutTime)}</div>
          </div>
        )}
      </div>
      
      <div className="visitor-actions">
        {visitor.Status === 'Pending' && (
          <button 
            className="btn-primary" 
            onClick={handleCheckIn}
          >
            Check In Visitor
          </button>
        )}
        
        {visitor.Status === 'CheckedIn' && (
          <button 
            className="btn-secondary" 
            onClick={handleCheckOut}
          >
            Check Out Visitor
          </button>
        )}
        
        {visitor.Status === 'CheckedOut' && (
          <div className="completed-message">
            Visit completed
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorDetails;
import React, { useState } from 'react';
import { createVisitorRequest } from '../../services/api';
import './DashboardStyles.css';

const CreateVisitorModal = ({ onClose, userEmail }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    visitType: 'Meeting',
    staffToVisit: userEmail,
    estimatedArrival: '',
    multiDayVisit: false,
    reason: '',
    identityCard: 'ID Card',
    createdBy: userEmail,
    startDate: '',
    endDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call your API to create visitor request
      // const response = await createVisitorRequest(formData);
      // console.log('Visitor created:', response);
      
      await createVisitorRequest(formData);
    setLoading(false);
    onClose();
    // Optionally refresh the dashboard data
  } catch (err) {
    setError('Failed to create visitor request');
    setLoading(false);
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Visitor Request</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Visit Type</label>
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
              >
                <option value="Meeting">Meeting</option>
                <option value="Interview">Interview</option>
                <option value="Delivery">Delivery</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>ID Type</label>
              <select
                name="identityCard"
                value={formData.identityCard}
                onChange={handleChange}
              >
                <option value="ID Card">ID Card</option>
                <option value="Passport">Passport</option>
                <option value="Driver's License">Driver's License</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Estimated Arrival</label>
            <input
              type="datetime-local"
              name="estimatedArrival"
              value={formData.estimatedArrival}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group checkbox">
            <input
              type="checkbox"
              name="multiDayVisit"
              checked={formData.multiDayVisit}
              onChange={handleChange}
              id="multiDayVisit"
            />
            <label htmlFor="multiDayVisit">Multi-day Visit</label>
          </div>
          
          {formData.multiDayVisit && (
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required={formData.multiDayVisit}
                />
              </div>
              
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required={formData.multiDayVisit}
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>Reason for Visit</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVisitorModal;
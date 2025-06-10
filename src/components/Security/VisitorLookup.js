import React, { useState } from 'react';
import { getVisitorDetails } from '../../services/api';
import './SecurityStyles.css';

const VisitorLookup = ({ onVisitorFound, onError, setLoading }) => {
  const [accessCode, setAccessCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      onError('Please enter an access code');
      return;
    }
    
    try {
      setLoading(true);
      const visitorData = await getVisitorDetails(accessCode.trim());
      
      if (!visitorData) {
        onError('No visitor found with this access code');
      } else {
        onVisitorFound(visitorData);
      }
    } catch (error) {
      console.error('Error looking up visitor:', error);
      onError(`Error looking up visitor: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lookup-container">
      <form onSubmit={handleSubmit} className="lookup-form">
        <div className="form-group">
          <label htmlFor="accessCode">Visitor Access Code</label>
          <div className="input-group">
            <input
              type="text"
              id="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter 6-digit access code"
              maxLength="6"
            />
            <button type="submit" className="btn-primary">
              Look Up
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VisitorLookup;
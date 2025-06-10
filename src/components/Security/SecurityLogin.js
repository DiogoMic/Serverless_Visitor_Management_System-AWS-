import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SecurityStyles.css';

const SecurityLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For demo purposes, use a simple security login
    // In production, use proper authentication
    if (username === 'security' && password === 'checkpoint123') {
      localStorage.setItem('securityUser', JSON.stringify({ 
        username, 
        role: 'security',
        name: 'Security Officer'
      }));
      navigate('/security/checkpoint');
    } else {
      setError('Invalid security credentials');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Security Checkpoint</h1>
        <p>Sign in to access the security portal</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default SecurityLogin;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import Settings from './components/Profile/Settings';
import SecurityLogin from './components/Security/SecurityLogin';
import SecurityCheckpoint from './components/Security/SecurityCheckpoint';
import './App.css';

// Staff auth guard component
const StaffRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Security auth guard component
const SecurityRoute = ({ children }) => {
  const isSecurityAuthenticated = localStorage.getItem('securityUser') !== null;
  return isSecurityAuthenticated ? children : <Navigate to="/security" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Security routes */}
        <Route path="/security" element={<SecurityLogin />} />
        <Route 
          path="/security/checkpoint" 
          element={
            <SecurityRoute>
              <SecurityCheckpoint />
            </SecurityRoute>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <StaffRoute>
              <Dashboard />
            </StaffRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <StaffRoute>
              <Profile />
            </StaffRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <StaffRoute>
              <Settings />
            </StaffRoute>
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// Auth service for handling authentication

// In a real application, this would integrate with AWS Cognito or another auth provider
// For now, we'll use localStorage for demo purposes

// Store user data in localStorage
export const setUser = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

// Get user data from localStorage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Remove user data from localStorage
export const removeUser = () => {
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return getUser() !== null;
};

// Mock login function (replace with real API call in production)
export const login = async (email, password) => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        const userData = {
          email,
          name: email.split('@')[0]
        };
        setUser(userData);
        resolve(userData);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
};

// Mock register function (replace with real API call in production)
export const register = async (name, email, password) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

// Mock logout function
export const logout = () => {
  removeUser();
  window.location.href = '/login';
};
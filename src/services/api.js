// API service for making requests to the backend

const API_URL = process.env.REACT_APP_API_URL || '*******';//insert your API endpoint

// Helper function for making API requests
const fetchAPI = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  };

  const config = {
    mode: 'cors', // Explicitly request CORS
    ...options,
    headers
  };

  try {
    console.log(`Fetching from: ${API_URL}${endpoint}`, config);
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    console.log('Raw response:', response);
    
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `HTTP error ${response.status}`;
      } catch (e) {
        errorMessage = `HTTP error ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {};
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Get all visitors for security dashboard
export const getAllVisitors = async () => {
  try {
    console.log('Fetching all visitors');
    const response = await fetchAPI('/getAllVisitors');
    console.log('All visitors response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching all visitors:', error);
    throw error;
  }
};


// Visitor API functions
export const getVisitorHistory = async (email) => {
  return fetchAPI(`/getVisitorHistory?email=${encodeURIComponent(email)}`);
};

export const createVisitorRequest = async (visitorData) => {
  return fetchAPI('/VisitorRequestPayload', {
    method: 'POST',
    body: JSON.stringify(visitorData)
  });
};

export const checkInVisitor = async (accessCode) => {
  return fetchAPI('/VisitorSecurityHandler', {
    method: 'POST',
    body: JSON.stringify({
      AccessCode: accessCode,
      action: 'check-in'
    })
  });
};

export const checkOutVisitor = async (accessCode) => {
  return fetchAPI('/VisitorSecurityHandler', {
    method: 'POST',
    body: JSON.stringify({
      AccessCode: accessCode,
      action: 'check-out'
    })
  });
};

// Modified to use POST instead of GET to avoid CORS/405 issues
export const getVisitorDetails = async (accessCode) => {
  try {
    console.log(`Looking up visitor with access code: ${accessCode}`);
    // Use POST instead of GET since your Lambda might not be configured for GET
    const response = await fetchAPI('/VisitorSecurityHandler', {
      method: 'POST',
      body: JSON.stringify({
        AccessCode: accessCode,
        action: 'get-details'
      })
    });
    console.log('API response:', response);
    return response;
  } catch (error) {
    console.error('Error in getVisitorDetails:', error);
    throw error;
  }
};

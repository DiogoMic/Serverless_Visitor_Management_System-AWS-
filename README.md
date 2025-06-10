# Visitor Management System Frontend

This is the frontend for the Visitor Management System, built with React.

## Features

- User authentication (login/register)
- Dashboard with visitor statistics
- Create visitor requests
- View visitor history
- Profile management
- Settings for password reset

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory and add your API URL:

```
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com/prod
```

3. Start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000.

## Project Structure

- `/src/components/Auth` - Authentication components (Login, Register)
- `/src/components/Dashboard` - Dashboard components
- `/src/components/Layout` - Layout components (Navbar, Sidebar)
- `/src/components/Profile` - Profile and Settings components
- `/src/services` - API and authentication services

## Connecting to Backend

Update the API URL in `/src/services/api.js` to point to your AWS API Gateway endpoint.

## Building for Production

```bash
npm run build
```

This will create a production-ready build in the `build` folder.
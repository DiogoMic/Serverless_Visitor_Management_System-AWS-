# Visitor Management System Design

![Screenshot 2025-06-05 at 12 57 25](https://github.com/user-attachments/assets/169db9ba-57c1-49a2-8d3f-d5fd808fd582)


This is the frontend for the Visitor Management System, built with React.

<img width="1735" alt="Screenshot 2025-06-11 at 16 25 47" src="https://github.com/user-attachments/assets/8f2d7a3c-2a2f-4dde-910e-73146a892706" />

<img width="2055" alt="Screenshot 2025-06-11 at 16 25 17" src="https://github.com/user-attachments/assets/32e4c9bd-e9b3-4fe3-ae80-c8db55c2d347" />

<img width="703" alt="Screenshot 2025-07-04 at 16 13 22" src="https://github.com/user-attachments/assets/af4e4552-2b62-48a7-a737-ff2bb522ce58" />

<img width="599" alt="Screenshot 2025-07-04 at 16 16 27" src="https://github.com/user-attachments/assets/9378e0bf-0761-411b-81df-32a0367d65b5" />

<img width="586" alt="Screenshot 2025-07-04 at 16 17 38" src="https://github.com/user-attachments/assets/470a2057-ca2e-4fa1-ba35-513aa8ce557e" />

# Video Demo

[![Watch the Demo](https://img.youtube.com/vi/p-oyccsp7tU/0.jpg)](https://youtu.be/p-oyccsp7tU)
# Features

- User authentication (login/register)
- Dashboard with visitor statistics
- Create visitor requests
- View visitor history
- Profile management
- Settings for password reset

# Getting Started

# Prerequisites

- Node.js (v14 or higher)
- npm or yarn

# Installation

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

# Project Structure

- `/src/components/Auth` - Authentication components (Login, Register)
- `/src/components/Dashboard` - Dashboard components
- `/src/components/Layout` - Layout components (Navbar, Sidebar)
- `/src/components/Profile` - Profile and Settings components
- `/src/services` - API and authentication services

# Connecting to Backend

Update the API URL in `/src/services/api.js` to point to your AWS API Gateway endpoint.

# Building for Production

```bash
npm run build
```

This will create a production-ready build in the `build` folder.

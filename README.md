# Salesforce Scheduler Front End - Demo App

### This is a DEMO APP Only, this is NOT supported nor warrented as even working - thanks

This is a React app demo to showcase the use of a 3rd party front end to interact with the Salesforce Scheduling API's. This app is designed to run on the Salesforce on Alibaba Cloud infrastructure, but should also work on the standard Salesforce instances - update your login string accordingly.

## Project Structure

```
server
├── .env
├── .gitignore
├── app.js
├── bin
│   └── www
├── config
│   ├── cors.config.js
│   └── passport.config.js
├── controllers
│   ├── auth.controller.js
│   ├── customer.controller.js
│   └── scheduler.controller.js
├── middleware
│   └── auth.middleware.js
├── package-lock.json
├── package.json
├── public
│   └── stylesheets
│       └── style.css
├── routes
│   ├── auth.routes.js
│   ├── customer.routes.js
│   ├── index.js
│   └── scheduler.routes.js
├── services
│   ├── auth.service.js
│   ├── customer.service.js
│   ├── scheduler
│   │   ├── appointment.service.js
│   │   ├── availability.service.js
│   │   ├── resource.service.js
│   │   └── territory.service.js
│   ├── scheduler.service.js
│   └── utils
│       └── salesforce-api.util.js
└── views
    ├── error.pug
    ├── index.pug
    └── layout.pug
client
├── .env
├── .env.development
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── public
│   └── vite.svg
├── src
│   ├── App.css
│   ├── App.jsx
│   ├── assets
│   │   └── react.svg
│   ├── components
│   │   ├── AppointmentFlow
│   │   │   └── AppointmentFlow.jsx
│   │   ├── Customers
│   │   │   ├── AppointmentBooking
│   │   │   │   ├── AppointmentBookingModal.jsx
│   │   │   │   └── steps
│   │   │   │       ├── ResourceSelection.jsx
│   │   │   │       ├── TerritorySelection.jsx
│   │   │   │       ├── TimeSlotSelection.jsx
│   │   │   │       └── WorkTypeSelection.jsx
│   │   │   ├── CustomerDetail.jsx
│   │   │   ├── CustomerTable.jsx
│   │   │   └── Customers.jsx
│   │   ├── Dashboard
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DashboardContent.jsx
│   │   │   ├── DataTable.jsx
│   │   │   └── StatCard.jsx
│   │   ├── Icons
│   │   │   └── SalesforceIcon.jsx
│   │   ├── Login
│   │   │   └── Login.jsx
│   │   ├── Navigation
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   └── Profile
│   │       └── Profile.jsx
│   ├── hooks
│   │   └── useSalesforceData.js
│   ├── index.css
│   ├── layouts
│   │   └── MainLayout.jsx
│   ├── main.jsx
│   ├── services
│   │   └── api.service.js
│   ├── theme
│   │   └── theme.js
│   └── utils
│       └── logger.js
└── vite.config.js

```

## Getting Started

1. Install dependencies:

    ```bash
    npm run install-all
    ```

2. Create .env files:

    In server/.env:

    ```
    SF_LOGIN_URL=https://login.salesforce.com || https://login.sfcrmproducts.cn
    SF_CLIENT_ID=your_client_id
    SF_CLIENT_SECRET=your_client_secret
    SESSION_SECRET=your_session_secret
    NODE_ENV=development
    CLIENT_URL=http://localhost:5173
    ```

3. Start the development servers:
    ```bash
    npm run dev
    ```

This will start:

-   Frontend at: http://localhost:5173
-   Backend at: http://localhost:3000

## Available Scripts

-   `npm run dev`: Start both frontend and backend in development mode
-   `npm run client`: Start only the frontend
-   `npm run server`: Start only the backend
-   `npm run install-all`: Install dependencies for root, client, and server

## Tech Stack

-   Frontend:
    -   React with Vite
    -   Material UI
    -   React Router
-   Backend:
    -   Express
    -   Passport.js
    -   OAuth 2.0

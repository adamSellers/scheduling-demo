# Salesforce React Application

This is a full-stack application using React with Vite for the frontend and Express for the backend, featuring Salesforce OAuth integration.

## Project Structure

```
├── client/             # React frontend
├── server/             # Express backend
├── package.json        # Root package.json for running both client and server
└── README.md          # This file
```

## Getting Started

1. Install dependencies:

    ```bash
    npm run install-all
    ```

2. Create .env files:

    In server/.env:

    ```
    SF_LOGIN_URL=https://login.salesforce.com
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

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';

// Components
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import AppointmentFlow from './components/AppointmentFlow/AppointmentFlow';
import Customers from './components/Customers/Customers';
import Profile from './components/Profile/Profile';
import CustomerDetail from './components/Customers/CustomerDetail';
import ApiService from './services/api.service';

// Auth check component
const AuthWrapper = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to fetch user info to verify authentication
        await ApiService.profile.getUserInfo();
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  // Show nothing while checking authentication
  if (!authChecked) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public route - Login */}
          <Route path="/" element={<Login />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <AuthWrapper>
                <Dashboard />
              </AuthWrapper>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <AuthWrapper>
                <AppointmentFlow />
              </AuthWrapper>
            } 
          />
          <Route 
            path="/customers" 
            element={
              <AuthWrapper>
                <Customers />
              </AuthWrapper>
            } 
          />
          <Route
            path="/customers/:id"
            element={
              <AuthWrapper>
                <CustomerDetail />
              </AuthWrapper>
            }
          />
          <Route 
            path="/profile" 
            element={
              <AuthWrapper>
                <Profile />
              </AuthWrapper>
            } 
          />

          {/* Catch all unauthorized route */}
          <Route path="*" element={
            <AuthWrapper>
              <Navigate to="/dashboard" replace />
            </AuthWrapper>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
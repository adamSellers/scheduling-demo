import React from 'react';
import { Box, CircularProgress, Alert, Snackbar } from '@mui/material';
import ApiService from '../../services/api.service';
import DashboardContent from './DashboardContent';
import MainLayout from '../../layouts/MainLayout';

const Dashboard = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [territories, setTerritories] = React.useState([]);
  const [resources, setResources] = React.useState([]);
  const [appointments, setAppointments] = React.useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [territories, resources, appointments] = await Promise.all([
        ApiService.scheduler.getTerritories(),
        ApiService.scheduler.getResources(),
        ApiService.scheduler.getAppointments(),
      ]);

      setTerritories(territories || []);
      setResources(resources || []);
      setAppointments(appointments || []);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(error.message);
      setTerritories([]);
      setResources([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <DashboardContent
        territories={territories}
        resources={resources}
        appointments={appointments}
        error={error}
        onRefresh={fetchData}
      />
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default Dashboard;
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
  const [workGroupTypes, setWorkGroupTypes] = React.useState([]);

  // Monitor territories state changes
  React.useEffect(() => {
    console.log('Territories state changed:', territories);
  }, [territories]);

  // Fetch all dashboard data
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Starting to fetch territories...');
        const territoriesData = await ApiService.scheduler.getTerritories();
        console.log('Territories before setState:', territoriesData);
        setTerritories(territoriesData);
        console.log('Just set territories state:', territoriesData);

        // Fetch work group types
        const workGroupTypesResult = await ApiService.scheduler.getWorkGroupTypes();
        console.log('Work group types fetch result:', workGroupTypesResult);
        setWorkGroupTypes(workGroupTypesResult || []);

        // Fetch other data
        const [resources, appointments] = await Promise.all([
          ApiService.scheduler.getResources(),
          ApiService.scheduler.getAppointments(),
        ]);

        setResources(resources || []);
        setAppointments(appointments || []);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting refresh fetch...');
      const territoriesData = await ApiService.scheduler.getTerritories();
      console.log('Refresh territories data:', territoriesData);
      setTerritories(territoriesData);

      const workGroupTypesResult = await ApiService.scheduler.getWorkGroupTypes();
      setWorkGroupTypes(workGroupTypesResult || []);

      const [resources, appointments] = await Promise.all([
        ApiService.scheduler.getResources(),
        ApiService.scheduler.getAppointments(),
      ]);

      setResources(resources || []);
      setAppointments(appointments || []);
    } catch (error) {
      console.error('Dashboard refresh error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
        workGroupTypes={workGroupTypes}
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
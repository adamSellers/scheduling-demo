import React from 'react';
import { Box, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useSalesforceData } from '../../hooks/useSalesforceData';
import DashboardContent from './DashboardContent';
import MainLayout from '../../layouts/MainLayout';

const Dashboard = () => {
  const {
    territories,
    resources,
    appointments,
    workGroupTypes,
    loading,
    error,
    refreshData,
    clearError
  } = useSalesforceData();

  // Monitor territories state changes (keeping this for debugging)
  React.useEffect(() => {
    console.log('Territories state changed:', territories);
  }, [territories]);

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
        onRefresh={refreshData}
      />
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={clearError}
      >
        <Alert onClose={clearError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default Dashboard;
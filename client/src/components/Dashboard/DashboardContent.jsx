import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import {
  LocationOn as TerritoryIcon,
  Person as ResourceIcon,
  Event as AppointmentIcon,
} from '@mui/icons-material';
import StatCard from './StatCard';
import DataTable from './DataTable';

const DashboardContent = ({ territories, resources, appointments, error }) => {
  const territoryColumns = [
    { id: 'name', label: 'Territory Name' },
    { id: 'operatingHours', label: 'Operating Hours' },
    { id: 'address', label: 'Address' },
    { id: 'status', label: 'Status' },
  ];

  const resourceColumns = [
    { id: 'name', label: 'Resource Name' },
    { id: 'type', label: 'Resource Type' },
    { id: 'territory', label: 'Territory' },
    { id: 'availability', label: 'Availability' },
  ];

  const appointmentColumns = [
    { id: 'appointmentNumber', label: 'Appointment #' },
    {
      id: 'scheduledTime',
      label: 'Scheduled Time',
      format: (value) => new Date(value).toLocaleString(),
    },
    { id: 'serviceTerritory', label: 'Territory' },
    { id: 'assignedResource', label: 'Assigned To' },
    { id: 'status', label: 'Status' },
  ];

  return (
    <Box
      sx={{
        maxWidth: '1200px',
        width: '100%',
        p: 3,
        boxSizing: 'border-box',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Service Territories"
            count={territories.length}
            icon={TerritoryIcon}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Service Resources"
            count={resources.length}
            icon={ResourceIcon}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Open Appointments"
            count={appointments.length}
            icon={AppointmentIcon}
          />
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mb: 3 }}>
        Service Territories
      </Typography>
      <Box sx={{ mb: 4 }}>
        <DataTable columns={territoryColumns} data={territories} />
      </Box>

      <Typography variant="h5" sx={{ mb: 3 }}>
        Service Resources
      </Typography>
      <Box sx={{ mb: 4 }}>
        <DataTable columns={resourceColumns} data={resources} />
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" sx={{ mb: 3 }}>
        Open Service Appointments
      </Typography>
      <Box sx={{ mb: 4 }}>
        <DataTable columns={appointmentColumns} data={appointments} />
      </Box>
    </Box>
  );
};

export default DashboardContent;
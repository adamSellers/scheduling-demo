import React from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Event as EventIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import DataTable from '../Dashboard/DataTable';

const CustomerTable = ({ 
  customers, 
  loading, 
  onBookAppointment 
}) => {
  const columns = [
    { 
      id: 'name', 
      label: 'Customer Name',
      format: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span>{value === 'No Name' ? '—' : value}</span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EventIcon />}
            onClick={() => {
              onBookAppointment(row)
              console.log('Booking appointment for customer:', row);
            }}
          >
            Book Appointment
          </Button>
        </Box>
      )
    },
    { 
      id: 'email', 
      label: 'Email',
      format: (value) => {
        if (value === 'No Email') return '—';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon fontSize="small" color="action" />
            <span>{value}</span>
          </Box>
        );
      }
    },
    { 
      id: 'phone', 
      label: 'Phone',
      format: (value) => {
        if (value === 'No Phone') return '—';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon fontSize="small" color="action" />
            <span>{value}</span>
          </Box>
        );
      }
    },
    {
      id: 'customerStatus',
      label: 'Status',
      format: (value) => (
        <Chip 
          label={value}
          size="small"
          color={value === 'Active' ? 'success' : 'default'}
        />
      )
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={customers}
      title={`${customers.length} Customers`}
    />
  );
};

export default CustomerTable;
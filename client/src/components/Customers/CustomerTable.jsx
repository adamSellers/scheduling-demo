import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Link
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
          <Link
            component={RouterLink}
            to={`/customers/${row.id}`}
            sx={{ 
              textDecoration: 'none',
              color: 'primary.main',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {value === 'No Name' ? '—' : value}
          </Link>
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
      label: 'Mobile Phone',
      format: (value) => {
        if (value === 'No Mobile Phone') return '—';
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
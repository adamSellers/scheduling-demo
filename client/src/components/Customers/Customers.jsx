import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Container
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import MainLayout from '../../layouts/MainLayout';
import DataTable from '../Dashboard/DataTable';
import ApiService from '../../services/api.service';

const Customers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const columns = [
    { 
      id: 'name', 
      label: 'Customer Name',
      format: (value) => value === 'No Name' ? '—' : value
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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await ApiService.customers.getPersonAccounts();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCustomers();
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <Container maxWidth={false} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Customers
          </Typography>
          <Tooltip title="Refresh customer list">
            <span>
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={filteredCustomers}
            title={`${filteredCustomers.length} Customers`}
          />
        )}
      </Container>
    </MainLayout>
  );
};

export default Customers;
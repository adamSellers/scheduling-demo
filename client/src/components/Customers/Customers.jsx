import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Paper,
  Alert,
  IconButton,
  Tooltip,
  Container,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import MainLayout from '../../layouts/MainLayout';
import CustomerTable from './CustomerTable';
import AppointmentBookingModal from './AppointmentBooking/AppointmentBookingModal';
import { useSalesforceData } from '../../hooks/useSalesforceData';
import ApiService from '../../services/api.service';

const Customers = () => {
  // Main loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Customer data and search
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Appointment booking state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Fetch Salesforce data for appointments
  const { 
    workGroupTypes, 
    territories,
    resources,
    loading: salesforceDataLoading,
    error: salesforceDataError 
  } = useSalesforceData();

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

  const handleBookAppointment = (customer) => {
    setSelectedCustomer(customer);
    setIsAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedCustomer(null);
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <Container maxWidth={false} sx={{ p: 3 }}>
        {/* Header */}
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

        {/* Error Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {salesforceDataError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading appointment data: {salesforceDataError}
          </Alert>
        )}

        {/* Search Bar */}
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

        {/* Customer Table */}
        <CustomerTable 
          customers={filteredCustomers}
          loading={loading}
          onBookAppointment={handleBookAppointment}
        />

        {/* Appointment Booking Modal */}
        <AppointmentBookingModal
          open={isAppointmentModalOpen}
          onClose={handleCloseAppointmentModal}
          customer={selectedCustomer}
          resources={resources}
          workGroupTypes={workGroupTypes}
          territories={territories}
          loading={salesforceDataLoading}
        />
      </Container>
    </MainLayout>
  );
};

export default Customers;
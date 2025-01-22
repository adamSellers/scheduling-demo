import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid2 as Grid,
  Divider,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Event as EventIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import MainLayout from '../../layouts/MainLayout';
import ApiService from '../../services/api.service';
import AppointmentBookingModal from './AppointmentBooking/AppointmentBookingModal';
import { useSalesforceData } from '../../hooks/useSalesforceData';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Fetch Salesforce data including customer appointments
  const { 
    workGroupTypes, 
    territories,
    resources,
    customerAppointments,
    loading: salesforceDataLoading,
    error: salesforceDataError 
  } = useSalesforceData({
    customerId: id,
    autoFetch: true
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        // Get all customers and find the matching one
        const customers = await ApiService.customers.getPersonAccounts();
        const customer = customers.find(c => c.id === id);
        
        if (!customer) {
          throw new Error('Customer not found');
        }
        
        setCustomerData(customer);

        // Try to fetch the customer's photo
        try {
          const photo = await ApiService.customers.getCustomerPhoto(customer.id);
          if (photo) {
            setPhotoUrl(photo);
          }
        } catch (error) {
          console.error('Error fetching customer photo:', error);
          // Don't set error state as this is not critical
        }
      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  const handleBookAppointment = () => {
    setIsAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
  };

  const renderAppointmentStatus = (status) => {
    const statusConfig = {
      Scheduled: { color: 'success', label: 'Confirmed' },
      Canceled: { color: 'error', label: 'Canceled' },
      Completed: { color: 'default', label: 'Completed' },
      'In Progress': { color: 'warning', label: 'In Progress' },
      default: { color: 'default', label: status }
    };

    const config = statusConfig[status] || statusConfig.default;

    return (
      <Chip 
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  // Loading state
  if (loading || salesforceDataLoading) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton width={200} height={40} />
          </Box>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Skeleton variant="circular" width={120} height={120} />
                  <Skeleton width={150} height={40} sx={{ mt: 2 }} />
                </Box>
              </Grid>
              <Grid item xs={12} md={9}>
                <Skeleton width={300} height={40} sx={{ mb: 2 }} />
                <Skeleton width={200} height={24} sx={{ mb: 1 }} />
                <Skeleton width={200} height={24} sx={{ mb: 1 }} />
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </MainLayout>
    );
  }

  // Error state
  if (error || salesforceDataError) {
    return (
      <MainLayout>
        <Container sx={{ mt: 4 }}>
          <Alert 
            severity="error"
            action={
              <Button color="inherit" onClick={() => navigate('/customers')}>
                Return to Customers
              </Button>
            }
          >
            {error || salesforceDataError}
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  // Not found state
  if (!customerData) {
    return (
      <MainLayout>
        <Container sx={{ mt: 4 }}>
          <Alert 
            severity="warning"
            action={
              <Button color="inherit" onClick={() => navigate('/customers')}>
                Return to Customers
              </Button>
            }
          >
            Customer not found
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header with back button */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/customers')} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Customer Profile</Typography>
        </Box>

        {/* Customer Overview Card */}
        <Paper sx={{ mb: 4, p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={photoUrl}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    border: photoUrl ? '2px solid' : 'none',
                    borderColor: 'primary.main'
                  }}
                >
                  {customerData.name?.charAt(0)}
                </Avatar>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">{customerData.name}</Typography>
                <IconButton>
                  <EditIcon />
                </IconButton>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EmailIcon color="action" />
                    <Typography>
                      {customerData.email === 'No Email' ? '—' : customerData.email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PhoneIcon color="action" />
                    <Typography>
                      {customerData.phone === 'No Mobile Phone' ? '—' : customerData.phone}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={customerData.customerStatus}
                  color={customerData.customerStatus === 'Active' ? 'success' : 'default'}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Appointments Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="primary" />
                <Typography variant="h6">Appointments</Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<EventIcon />}
                onClick={handleBookAppointment}
              >
                New Appointment
              </Button>
            </Box>

            {customerAppointments.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  No appointments scheduled
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<EventIcon />}
                  onClick={handleBookAppointment}
                  sx={{ mt: 2 }}
                >
                  Schedule First Appointment
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Assigned Associate</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Service Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customerAppointments
                      .sort((a, b) => new Date(b.scheduledStartTime) - new Date(a.scheduledStartTime))
                      .map((appointment) => {
                        const appointmentDate = new Date(appointment.scheduledStartTime);
                        const isPastAppointment = appointmentDate < new Date();
                        
                        return (
                          <TableRow 
                            key={appointment.id}
                            sx={{
                              opacity: isPastAppointment ? 0.7 : 1,
                              backgroundColor: isPastAppointment ? 'action.hover' : 'inherit'
                            }}
                          >
                            <TableCell>
                              {appointmentDate.toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>
                              {appointmentDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>
                              {appointment.serviceResourceName || 'Unassigned'}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {territories.find(t => t.id === appointment.serviceTerritoryId)?.name || 'Unknown Location'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {appointment.workTypeName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {renderAppointmentStatus(appointment.status)}
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => console.log('Edit appointment:', appointment.id)}
                                disabled={isPastAppointment || appointment.status === 'Completed'}
                              >
                                Modify
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Appointment Booking Modal */}
        <AppointmentBookingModal
          open={isAppointmentModalOpen}
          onClose={handleCloseAppointmentModal}
          customer={customerData}
          resources={resources}
          workGroupTypes={workGroupTypes}
          territories={territories}
          loading={salesforceDataLoading}
        />
      </Container>
    </MainLayout>
  );
};

export default CustomerDetail;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
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
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Event as EventIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import MainLayout from '../../layouts/MainLayout';
import ApiService from '../../services/api.service';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null);

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

        // Get all appointments and filter for this customer
        const allAppointments = await ApiService.scheduler.getAppointments();
        const customerAppointments = allAppointments.filter(
          app => app.parentRecordId === id
        );
        setAppointments(customerAppointments);

      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </MainLayout>
    );
  }

  // Not found state
  if (!customerData) {
    return (
      <MainLayout>
        <Container sx={{ mt: 4 }}>
          <Alert severity="warning">Customer not found</Alert>
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
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    border: photoUrl ? '2px solid' : 'none',
                    borderColor: 'primary.main'
                  }}
                >
                  {customerData.name?.charAt(0)}
                </Avatar>
                <Button
                  variant="outlined"
                  startIcon={<EventIcon />}
                  onClick={() => navigate('/customers')} // This should open the appointment modal
                  sx={{ width: '100%' }}
                >
                  Book Appointment
                </Button>
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
            <Typography variant="h6" gutterBottom>
              Appointments
            </Typography>
            
            {appointments.length === 0 ? (
              <Typography color="text.secondary">No appointments scheduled</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Appointment #</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Service Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.appointmentNumber}</TableCell>
                        <TableCell>
                          {new Date(appointment.scheduledStartTime).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(appointment.scheduledStartTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={appointment.status}
                            color={appointment.status === 'Scheduled' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{appointment.serviceTerritory}</TableCell>
                        <TableCell>{appointment.workTypeName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>
    </MainLayout>
  );
};

export default CustomerDetail;
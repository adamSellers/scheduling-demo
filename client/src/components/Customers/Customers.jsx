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
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Stepper,
  Step,
  StepLabel,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Event as EventIcon,
  CalendarMonth as CalendarIcon,
  WorkspacePremium as LuxuryIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
} from '@mui/icons-material';
import MainLayout from '../../layouts/MainLayout';
import DataTable from '../Dashboard/DataTable';
import ApiService from '../../services/api.service';
import { useSalesforceData } from '../../hooks/useSalesforceData';

const steps = ['Select Appointment Type', 'Choose Location'];

const Customers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [territorySearchQuery, setTerritorySearchQuery] = useState('');

  // State for storing selections
  const [selectedWorkType, setSelectedWorkType] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);

  // Fetch data using the custom hook
  const { 
    workGroupTypes, 
    territories,
    loading: dataLoading 
  } = useSalesforceData();

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
            onClick={() => handleBookAppointment(row)}
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
    setActiveStep(0);
    setSelectedWorkType(null);
    setSelectedTerritory(null);
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedCustomer(null);
    setActiveStep(0);
    setSelectedWorkType(null);
    setSelectedTerritory(null);
    setTerritorySearchQuery('');
  };

  const handleWorkTypeSelect = (workType) => {
    setSelectedWorkType(workType);
    setActiveStep(1);
  };

  const handleTerritorySelect = (territory) => {
    setSelectedTerritory(territory);
    // We'll handle the next step in future updates
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    if (activeStep === 1) {
      setSelectedTerritory(null);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTerritories = territories?.filter(territory =>
    territory.name.toLowerCase().includes(territorySearchQuery.toLowerCase()) ||
    territory.address.toLowerCase().includes(territorySearchQuery.toLowerCase())
  ) || [];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <List>
            {workGroupTypes?.map((workType) => (
              <ListItem 
                key={workType.id} 
                disablePadding
                divider
              >
                <ListItemButton 
                  onClick={() => handleWorkTypeSelect(workType)}
                  selected={selectedWorkType?.id === workType.id}
                >
                  <ListItemIcon>
                    <LuxuryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={workType.name}
                    secondary={workType.groupType}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        );
      case 1:
        return (
          <Box>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search locations by name, city, or address..."
              value={territorySearchQuery}
              onChange={(e) => setTerritorySearchQuery(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <List>
              {filteredTerritories.map((territory) => (
                <ListItem 
                  key={territory.id} 
                  disablePadding
                  divider
                >
                  <ListItemButton 
                    onClick={() => handleTerritorySelect(territory)}
                    selected={selectedTerritory?.id === territory.id}
                  >
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={territory.name}
                      secondary={territory.address}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        );
      default:
        return null;
    }
  };

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

        {/* Appointment Booking Modal */}
        <Dialog 
          open={isAppointmentModalOpen} 
          onClose={handleCloseAppointmentModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="primary" />
                <Typography variant="h6">
                  Book Appointment
                </Typography>
              </Box>
              <IconButton onClick={handleCloseAppointmentModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedCustomer && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Booking for
                </Typography>
                <Typography variant="h6">
                  {selectedCustomer.name}
                </Typography>
              </Box>
            )}
            
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {dataLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              renderStepContent(activeStep)
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleBack}
              startIcon={<BackIcon />}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            {/* We'll add the Next/Finish button in future updates */}
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default Customers;
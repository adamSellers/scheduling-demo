import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Close as CloseIcon,
  NavigateBefore as BackIcon,
} from '@mui/icons-material';
import WorkTypeSelection from './steps/WorkTypeSelection';
import TerritorySelection from './steps/TerritorySelection';
import TimeSlotSelection from './steps/TimeSlotSelection';
import ResourceSelection from './steps/ResourceSelection';
import ApiService from '../../../services/api.service';

const steps = ['Select Appointment Type', 'Choose Location', 'Select Time', 'Select Associate', 'Confirm Booking'];

const AppointmentBookingModal = ({ 
  open, 
  onClose, 
  customer,
  workGroupTypes = [],
  territories = [],
  resources = [],
  loading,
  onSuccess 
}) => {
  // Step management state
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  
  // Selection state
  const [selectedWorkType, setSelectedWorkType] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Loading states
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  useEffect(() => {
    console.log('Customer prop in modal:', customer);
  }, [customer]);

  const handleWorkTypeSelect = (workType) => {
    console.log('Selected work type:', workType);
    if (!workType?.id) return;
    setSelectedWorkType(workType);
    setActiveStep(1);
  };

  const handleTerritorySelect = async (territory) => {
    try {
      setError(null);
      
      if (!selectedWorkType?.id) {
        setError('Please select an appointment type first');
        return;
      }

      if (!territory?.id) {
        setError('Please select a valid location');
        return;
      }

      console.log('Selected territory:', territory);
      setSelectedTerritory(territory);
      setLoadingTimeSlots(true);
      
      const startTime = new Date();
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 7); // Look ahead 7 days

      const requestParams = {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        workType: {  
          id: selectedWorkType.id
        },
        territoryIds: [territory.id],
        schedulingPolicyId: null,
        accountId: null,
        allowConcurrentScheduling: false
      };

      console.log('Fetching appointment candidates with params:', requestParams);
      const candidates = await ApiService.scheduler.getAppointmentCandidates(requestParams);
      
      if (Array.isArray(candidates) && candidates.length > 0) {
        console.log('Retrieved time slots:', candidates);
        setTimeSlots(candidates);
        setActiveStep(2);
      } else {
        setError('No available time slots found for the selected criteria.');
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError(error?.message || 'Failed to fetch available time slots. Please try again.');
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const handleTimeSlotSelect = (timeSlot) => {
    console.log('Selected time slot:', timeSlot);
    if (timeSlot?.startTime && timeSlot?.endTime && timeSlot?.resources) {
      setSelectedTimeSlot(timeSlot);
      setActiveStep(3);
    }
  };

  const handleResourceSelect = (resourceId) => {
    console.log('Selected resource:', resourceId);
    if (resourceId) {
      setSelectedResource(resourceId);
      setActiveStep(4);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      const missingFields = [];
      
      console.log('Validating appointment data:', {
        workType: selectedWorkType,
        territory: selectedTerritory,
        timeSlot: selectedTimeSlot,
        resource: selectedResource,
        customerId: customer?.id
      });

      if (!selectedWorkType?.id) missingFields.push('Work Type');
      if (!selectedTerritory?.id) missingFields.push('Territory');
      if (!selectedTimeSlot?.startTime || !selectedTimeSlot?.endTime) missingFields.push('Time Slot');
      if (!selectedResource) missingFields.push('Resource');
      if (!customer?.id) missingFields.push('Customer ID');

      if (missingFields.length > 0) {
        const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
        console.error(errorMessage);
        setError(errorMessage);
        return;
      }

      const appointmentData = {
        serviceAppointment: {
            parentRecordId: customer.id,
            workTypeId: selectedWorkType.id,
            serviceTerritoryId: selectedTerritory.id,
            schedStartTime: selectedTimeSlot.startTime,
            schedEndTime: selectedTimeSlot.endTime,
            appointmentType: "In Person",
            Status: "Scheduled",
            description: `Luxury client appointment with ${customer.name}`,
            street: selectedTerritory.address?.split(',')[0]?.trim() || '',
            city: selectedTerritory.address?.split(',')[1]?.trim() || '',
            subject: `${resources.find(r => r.id === selectedResource)?.name || 'Associate'} to meet ${customer.name.split(' ')[0]} at ${new Date(selectedTimeSlot.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        },
        assignedResources: [
          {
            serviceResourceId: selectedResource,
            isPrimaryResource: true,
            isRequiredResource: true,
            extendedFields: []
          }
        ]
      };

      console.log('Submitting appointment data:', appointmentData);
      
      const response = await ApiService.scheduler.createAppointment(appointmentData);
      console.log('Appointment creation response:', response);
      
      if (onSuccess) {
        onSuccess();
      }
      
      handleClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError(error?.message || 'Failed to create appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setError(null); // Clear any errors when going back
    setActiveStep((prevStep) => prevStep - 1);
    
    // Clear the data for the step we're leaving
    switch (activeStep) {
      case 1:
        setSelectedWorkType(null);
        break;
      case 2:
        setSelectedTerritory(null);
        setTimeSlots([]);
        break;
      case 3:
        setSelectedTimeSlot(null);
        break;
      case 4:
        setSelectedResource(null);
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    // Reset all state when closing
    setActiveStep(0);
    setSelectedWorkType(null);
    setSelectedTerritory(null);
    setSelectedTimeSlot(null);
    setSelectedResource(null);
    setTimeSlots([]);
    setError(null);
    onClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <WorkTypeSelection
            workGroupTypes={workGroupTypes}
            selectedWorkType={selectedWorkType}
            onSelect={handleWorkTypeSelect}
            loading={loading}
          />
        );
      case 1:
        return (
          <TerritorySelection
            territories={territories}
            selectedTerritory={selectedTerritory}
            onSelect={handleTerritorySelect}
          />
        );
      case 2:
        return (
          <TimeSlotSelection
            timeSlots={timeSlots}
            selectedTimeSlot={selectedTimeSlot}
            onSelect={handleTimeSlotSelect}
            loading={loadingTimeSlots}
            territory={selectedTerritory}
            selectedWorkType={selectedWorkType}
          />
        );
      case 3:
        return (
          <ResourceSelection
            resources={selectedTimeSlot?.resources || []}
            serviceResources={resources}
            selectedTimeSlot={selectedTimeSlot}
            onSelect={handleResourceSelect}
            selectedResource={selectedResource}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
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
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {customer && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Booking for
            </Typography>
            <Typography variant="h6">
              {customer.name}
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 4 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Confirm Appointment Details
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Service Type
              </Typography>
              <Typography variant="body1">
                {selectedWorkType?.name}
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1">
                {selectedTerritory?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTerritory?.address}
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Date & Time
              </Typography>
              <Typography variant="body1">
                {selectedTimeSlot && new Date(selectedTimeSlot.startTime).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Associate
              </Typography>
              <Typography variant="body1">
                {resources?.find(r => r.id === selectedResource)?.name || 'Selected Associate'}
              </Typography>
            </Box>
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
        {activeStep === 4 && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !selectedWorkType || !selectedTerritory || !selectedTimeSlot || !selectedResource}
          >
            {submitting ? 'Creating Appointment...' : 'Confirm Booking'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentBookingModal;
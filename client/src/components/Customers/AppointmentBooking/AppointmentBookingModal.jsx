import React, { useState } from 'react';
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

const steps = ['Select Appointment Type', 'Choose Location', 'Select Time', 'Select Associate'];

const AppointmentBookingModal = ({ 
  open, 
  onClose, 
  customer,
  workGroupTypes = [],
  territories = [],
  resources = [],
  loading 
}) => {
  // Step management state
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  
  // Selection state
  const [selectedWorkType, setSelectedWorkType] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  
  // Loading states
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  const handleWorkTypeSelect = (workType) => {
    if (!workType) return;
    setSelectedWorkType(workType);
    setActiveStep(1);
  };

  const handleTerritorySelect = async (territory) => {
    try {
      if (!selectedWorkType?.id) {
        setError('Please select an appointment type first');
        return;
      }

      if (!territory) {
        setError('Please select a valid location');
        return;
      }

      setSelectedTerritory(territory);
      setLoadingTimeSlots(true);
      setError(null);
      
      const startTime = new Date();
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 7); // Look ahead 7 days

      const requestParams = {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        workTypeGroupId: selectedWorkType.id,
        territoryIds: [territory.id]
      };

      if (customer?.id) {
        requestParams.accountId = customer.id;
      }

      const candidates = await ApiService.scheduler.getAppointmentCandidates(requestParams);
      
      if (Array.isArray(candidates) && candidates.length > 0) {
        setTimeSlots(candidates);
        setActiveStep(2);
      } else {
        setError('No available time slots found for the selected criteria.');
      }
    } catch (error) {
      console.error('Error details:', { error, selectedWorkType, selectedTerritory: territory, customer });
      setError(error?.message || 'Failed to fetch available time slots. Please try again.');
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const handleTimeSlotSelect = (timeSlot) => {
    if (timeSlot && timeSlot.resources) {
      setSelectedTimeSlot(timeSlot);
      setActiveStep(3);
    }
  };

  const handleResourceSelect = (resourceId) => {
    if (!resourceId) return;
    setSelectedResource(resourceId);
    // Future: Add confirmation step or handle booking submission
    // setActiveStep(4);
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
            serviceResources={resources || []}
            selectedTimeSlot={selectedTimeSlot}
            onSelect={handleResourceSelect}
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

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleBack}
          startIcon={<BackIcon />}
          disabled={activeStep === 0}
        >
          Back
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentBookingModal;
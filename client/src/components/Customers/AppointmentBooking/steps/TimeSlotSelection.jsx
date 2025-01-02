import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  Typography,
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import ApiService from '../../../../services/api.service';

const TimeSlotSelection = ({ 
  timeSlots, 
  selectedTimeSlot, 
  onSelect,
  loading,
  territory,
  selectedWorkType
}) => {
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!territory?.operatingHours) {
        setError('No operating hours defined for this location');
        return;
      }

      try {
        setLoadingSlots(true);
        console.log('Fetching time slots for territory:', territory);
        const territoryTimeSlots = await ApiService.scheduler.getTimeSlots(
          territory.operatingHours,
          selectedWorkType?.id
        );

        // Filter appointment slots that match time slot constraints
        const filtered = timeSlots.filter(appointmentSlot => {
          const startTime = new Date(appointmentSlot.startTime);
          const endTime = new Date(appointmentSlot.endTime);
          
          // Find matching time slot for this appointment slot
          return territoryTimeSlots.some(timeSlot => {
            // Match day of week
            if (timeSlot.dayOfWeek !== getDayOfWeek(startTime)) {
              return false;
            }
            
            // Match time range
            const slotStart = getTimeString(startTime);
            const slotEnd = getTimeString(endTime);
            return slotStart >= timeSlot.startTime && 
                   slotEnd <= timeSlot.endTime &&
                   (!timeSlot.maxAppointments || 
                    appointmentSlot.resources?.length <= timeSlot.maxAppointments);
          });
        });

        setAvailableTimeSlots(filtered);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Unable to load available time slots');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, [timeSlots, territory, selectedWorkType]);

  const getDayOfWeek = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const getTimeString = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading || loadingSlots) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <Chip
            icon={<WarningIcon />}
            label="Configuration Error"
            color="error"
            variant="outlined"
          />
        }
      >
        {error}
      </Alert>
    );
  }

  if (availableTimeSlots.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No available time slots found for this service.
      </Alert>
    );
  }

  // Group slots by date
  const slotsByDate = availableTimeSlots.reduce((acc, slot) => {
    const date = new Date(slot.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <Box>
      {territory && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<TimeIcon />}
            label={`${territory.name} - Operating Hours`}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}
      
      {Object.entries(slotsByDate).map(([date, slots]) => (
        <Box key={date} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            {date}
          </Typography>
          <List>
            {slots.map((slot) => (
              <ListItem 
                key={`${slot.startTime}-${slot.endTime}`}
                disablePadding
                divider
              >
                <ListItemButton 
                  onClick={() => onSelect(slot)}
                  selected={selectedTimeSlot?.startTime === slot.startTime}
                >
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${new Date(slot.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })} - ${new Date(slot.endTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}`}
                    secondary={`${slot.resources?.length || 0} available resources`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
};

export default TimeSlotSelection;
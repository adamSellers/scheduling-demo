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
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon 
} from '@mui/icons-material';
import ApiService from '../../../../services/api.service';

const TimeSlotSelection = ({ 
  timeSlots, 
  selectedTimeSlot, 
  onSelect,
  loading,
  territory
}) => {
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [businessHours, setBusinessHours] = useState(null);
  const [loadingHours, setLoadingHours] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusinessHours = async () => {
      if (!territory?.operatingHours) {
        setError('No business hours defined for this location');
        return;
      }

      try {
        setLoadingHours(true);
        console.log('Fetching business hours for territory:', territory);
        const hours = await ApiService.scheduler.getBusinessHours(
            territory.operatingHours
        );
        setBusinessHours(hours);

        // Filter time slots based on business hours
        const filtered = timeSlots.filter(slot => {
          const startTime = new Date(slot.startTime);
          const endTime = new Date(slot.endTime);
          
          // Both start and end time must be within business hours
          return ApiService.scheduler.isWithinBusinessHours(hours, startTime) &&
                 ApiService.scheduler.isWithinBusinessHours(hours, endTime);
        });

        setFilteredTimeSlots(filtered);
      } catch (err) {
        console.error('Error fetching business hours:', err);
        setError('Unable to load business hours');
      } finally {
        setLoadingHours(false);
      }
    };

    fetchBusinessHours();
  }, [timeSlots, territory]);

  if (loading || loadingHours) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (filteredTimeSlots.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No available time slots found during business hours.
      </Alert>
    );
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      timeZone: businessHours?.TimeZoneSidKey 
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      timeZone: businessHours?.TimeZoneSidKey 
    });
  };

  // Group slots by date
  const slotsByDate = filteredTimeSlots.reduce((acc, slot) => {
    const date = formatDate(slot.startTime);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <Box>
      {businessHours && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<TimeIcon />}
            label={`${businessHours.Name} (${businessHours.TimeZoneSidKey})`}
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
            {slots.map((slot, index) => (
              <ListItem 
                key={`${slot.startTime}-${index}`}
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
                    primary={`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
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
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
  Warning as WarningIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import _ from 'lodash';

const TimeSlotSelection = ({ 
  timeSlots, 
  selectedTimeSlot,
  onSelect,
  loading,
  territory,
  selectedWorkType
}) => {
  const [aggregatedSlots, setAggregatedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const aggregateTimeSlots = () => {
      // Group slots by startTime
      const groupedByTime = _.groupBy(timeSlots, 'startTime');
      
      // Transform into our desired format
      const aggregated = Object.entries(groupedByTime).map(([startTime, slots]) => ({
        startTime,
        endTime: slots[0].endTime,
        resources: slots.map(slot => slot.resources).flat(),
        territoryId: slots[0].territoryId
      }));

      // Sort by start time
      const sorted = _.sortBy(aggregated, 'startTime');
      setAggregatedSlots(sorted);
    };

    if (timeSlots?.length) {
      aggregateTimeSlots();
    }
  }, [timeSlots]);

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

  if (!aggregatedSlots.length) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No available time slots found for this service.
      </Alert>
    );
  }

  // Group slots by date for display
  const slotsByDate = _.groupBy(aggregatedSlots, slot => 
    format(new Date(slot.startTime), 'EEEE, MMMM d, yyyy')
  );

  return (
    <Box>
      {territory && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<TimeIcon />}
            label={`${territory.name} - Available Times`}
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
                  onClick={() => onSelect && onSelect(slot)}
                  selected={selectedTimeSlot?.startTime === slot.startTime}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${format(new Date(slot.startTime), 'h:mm a')} - ${format(new Date(slot.endTime), 'h:mm a')}`}
                    secondary={`${slot.resources.length} ${slot.resources.length === 1 ? 'associate' : 'associates'} available`}
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
import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  Typography,
  Alert,
} from '@mui/material';
import { 
  Person as PersonIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const ResourceSelection = ({
  resources = [],
  serviceResources = [],
  selectedTimeSlot,
  onSelect
}) => {
	const getResourceDetails = (resourceId) => {
    console.log('Service Resources:', serviceResources);
    console.log('Looking for resource ID:', resourceId);
    if (!Array.isArray(serviceResources)) return { name: 'Unknown Associate' };
    const resource = serviceResources.find(resource => resource.id === resourceId);
    console.log('Found resource:', resource);
    return resource || { name: 'Unknown Associate' };
};

  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (e) {
      return 'Invalid Time';
    }
  };

  if (!selectedTimeSlot) {
    return (
      <Alert severity="info">
        Please select a time slot first
      </Alert>
    );
  }

  if (!Array.isArray(resources) || resources.length === 0) {
    return (
      <Alert severity="warning">
        No associates are available for this time slot
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Available Associate for {formatTime(selectedTimeSlot.startTime)}
      </Typography>
      
      <List>
        {resources.map((resourceId) => {
          const resourceDetails = getResourceDetails(resourceId);
          return (
            <ListItem key={resourceId} disablePadding>
              <ListItemButton 
                onClick={() => onSelect(resourceId)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                }}
              >
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
                <ListItemText 
                  primary={resourceDetails.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" component="span">
                        Available for this time slot
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default ResourceSelection;
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
  Chip,
  Grid,
  Paper,
  Button,
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Language as LanguageIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const ResourceSelection = ({
  resources = [],
  serviceResources = [],
  selectedTimeSlot,
  onSelect,
  selectedResource
}) => {
  const getResourceDetails = (resourceId) => {
    if (!Array.isArray(serviceResources)) return null;
    return serviceResources.find(resource => resource.id === resourceId);
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
          if (!resourceDetails) return null;

          const fullName = `${resourceDetails.firstName} ${resourceDetails.lastName}`.trim();
          const isSelected = selectedResource === resourceId;

          return (
            <Paper
              key={resourceId}
              elevation={isSelected ? 3 : 1}
              sx={{ 
                mb: 2,
                bgcolor: isSelected ? 'primary.light' : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                },
                position: 'relative'
              }}
            >
              <ListItem 
                disablePadding
                secondaryAction={
                  isSelected && (
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => onSelect(resourceId)}
                      sx={{ mr: 2 }}
                    >
                      Confirm Associate
                    </Button>
                  )
                }
              >
                <ListItemButton 
                  onClick={() => onSelect(resourceId)}
                  selected={isSelected}
                  sx={{
                    p: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      },
                    },
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar
                        src={resourceDetails.photoUrl}
                        sx={{ 
                          width: 64, 
                          height: 64,
                          bgcolor: 'primary.main'
                        }}
                      >
                        {!resourceDetails.photoUrl && (
                          `${resourceDetails.firstName?.[0] || ''}${resourceDetails.lastName?.[0] || ''}`
                        )}
                      </Avatar>
                    </Grid>
                    <Grid item xs={12} sm>
                      <Box>
                        <Typography variant="h6" component="div">
                          {fullName || 'Unnamed Associate'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                          {resourceDetails.title && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <WorkIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {resourceDetails.title}
                              </Typography>
                            </Box>
                          )}
                          
                          {resourceDetails.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <EmailIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {resourceDetails.email}
                              </Typography>
                            </Box>
                          )}
                          
                          {resourceDetails.language && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LanguageIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {resourceDetails.language}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ mt: 1 }}>
                          <Chip
                            size="small"
                            label={isSelected ? 'Selected' : 'Available'}
                            color={isSelected ? 'primary' : 'success'}
                            variant={isSelected ? 'filled' : 'outlined'}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </ListItemButton>
              </ListItem>
            </Paper>
          );
        })}
      </List>
    </Box>
  );
};

export default ResourceSelection;
import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { 
  WorkspacePremium as LuxuryIcon,
} from '@mui/icons-material';

const WorkTypeSelection = ({ 
  workGroupTypes, 
  selectedWorkType, 
  onSelect,
  loading 
}) => {
  // Extract all work types from work group types
  const allWorkTypes = React.useMemo(() => {
    if (!Array.isArray(workGroupTypes)) return [];
    
    return workGroupTypes.reduce((acc, group) => {
      if (group.workTypes && Array.isArray(group.workTypes)) {
        acc.push(...group.workTypes);
      }
      return acc;
    }, []);
  }, [workGroupTypes]);

  React.useEffect(() => {
    console.log('Available work types:', allWorkTypes);
  }, [allWorkTypes]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!allWorkTypes.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">
          No appointment types available
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {allWorkTypes.map((workType) => (
        <ListItem 
          key={workType.id}
          disablePadding
          divider
        >
          <ListItemButton
            onClick={() => onSelect(workType)}
            selected={selectedWorkType?.id === workType.id}
          >
            <ListItemIcon>
              <LuxuryIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary={workType.name}
              secondary={`Duration: ${workType.estimatedDuration || workType.DurationInMinutes || 30} ${workType.durationType?.toLowerCase() || 'minutes'}`}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default WorkTypeSelection;
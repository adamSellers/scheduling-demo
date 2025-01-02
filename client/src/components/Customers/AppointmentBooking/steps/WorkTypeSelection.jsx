import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CircularProgress
} from '@mui/material';
import { WorkspacePremium as LuxuryIcon } from '@mui/icons-material';

const WorkTypeSelection = ({ 
  workGroupTypes, 
  selectedWorkType, 
  onSelect,
  loading 
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <List>
      {workGroupTypes?.map((workType) => (
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
              secondary={`Type: ${workType.groupType || 'Standard'}`}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default WorkTypeSelection;
import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CircularProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import { 
  WorkspacePremium as LuxuryIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

const WorkTypeSelection = ({ 
  workGroupTypes, 
  selectedWorkType, 
  onSelect,
  loading 
}) => {
  const [expandedGroups, setExpandedGroups] = React.useState({});

  React.useEffect(() => {
    console.log('WorkTypeSelection received workGroupTypes:', workGroupTypes);
  }, [workGroupTypes]);

  const handleGroupClick = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <List>
      {workGroupTypes?.map((group) => (
        <React.Fragment key={group.id}>
          <ListItem 
            disablePadding
            divider
            secondaryAction={
              <IconButton edge="end" onClick={() => handleGroupClick(group.id)}>
                {expandedGroups[group.id] ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            }
          >
            <ListItemButton onClick={() => handleGroupClick(group.id)}>
              <ListItemIcon>
                <LuxuryIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={group.name}
                secondary={`${group.workTypes?.length || 0} service type${group.workTypes?.length !== 1 ? 's' : ''} available`}
              />
            </ListItemButton>
          </ListItem>
          
          <Collapse in={expandedGroups[group.id]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {group.workTypes?.map((workType) => (
                <ListItem 
                  key={workType.id}
                  disablePadding
                >
                  <ListItemButton
                    onClick={() => onSelect(workType)}
                    selected={selectedWorkType?.id === workType.id}
                    sx={{ pl: 4 }}
                  >
                    <ListItemText 
                      primary={workType.name}
                      secondary={`Duration: ${workType.estimatedDuration || 'Unknown'} ${workType.durationType?.toLowerCase() || 'minutes'}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      ))}
    </List>
  );
};

export default WorkTypeSelection;
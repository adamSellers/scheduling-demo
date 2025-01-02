import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

const TerritorySelection = ({ territories, selectedTerritory, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTerritories = territories?.filter(territory =>
    territory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    territory.address.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Box>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Search locations by name, city, or address..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <List>
        {filteredTerritories.map((territory) => (
          <ListItem 
            key={territory.id} 
            disablePadding
            divider
          >
            <ListItemButton 
              onClick={() => onSelect(territory)}
              selected={selectedTerritory?.id === territory.id}
            >
              <ListItemIcon>
                <LocationIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={territory.name}
                secondary={territory.address}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TerritorySelection;
import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  BusinessCenter as BusinessIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Accounts', icon: <BusinessIcon />, path: '/accounts' },
  { text: 'Contacts', icon: <PeopleIcon />, path: '/contacts' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const SidebarContent = () => (
  <Box>
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" sx={{ color: 'primary.main' }}>
        SF Dashboard
      </Typography>
    </Box>
    <Divider />
    <List>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </Box>
);

const Sidebar = ({ mobileOpen, onDrawerToggle, drawerWidth }) => {
  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        <SidebarContent />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            boxShadow: 'none',
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/Navigation/Navbar';
import Sidebar from '../components/Navigation/Sidebar';

const drawerWidth = 240;

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar onDrawerToggle={handleDrawerToggle} />
      <Sidebar
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          pt: '64px', // AppBar height
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
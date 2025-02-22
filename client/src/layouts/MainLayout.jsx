import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/Navigation/Navbar';
import Sidebar from '../components/Navigation/Sidebar';
import Footer from '../components/Navigation/Footer';

const drawerWidth = 240;

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', width: '100vw' }}>
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
          pt: '64px', // AppBar height
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexGrow: 1,
          }}
        >
          <Box
            sx={{
              maxWidth: '1200px',
              width: '100%',
              px: 3, // Horizontal padding
            }}
          >
            {children}
          </Box>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Key as KeyIcon,
} from '@mui/icons-material';

const Navbar = ({ onDrawerToggle, onRefresh }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showCopySuccess, setShowCopySuccess] = React.useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    window.location.href = 'http://localhost:3000/auth/logout';
  };

  const handleCopyToken = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/user-info', {
        credentials: 'include'
      });
      const data = await response.json();
      await navigator.clipboard.writeText(data.accessToken);
      setShowCopySuccess(true);
      handleClose();
    } catch (error) {
      console.error('Error copying token:', error);
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Box sx={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={onDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Salesforce Integration
            </Typography>
            <IconButton color="inherit" onClick={onRefresh} sx={{ mr: 2 }}>
              <RefreshIcon />
            </IconButton>
            <IconButton size="large" onClick={handleMenu} color="inherit">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                }}
              >
                U
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleCopyToken}>
                <ListItemIcon>
                  <KeyIcon fontSize="small" />
                </ListItemIcon>
                Copy Access Token
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </Box>
      </AppBar>
      <Snackbar
        open={showCopySuccess}
        autoHideDuration={3000}
        onClose={() => setShowCopySuccess(false)}
        message="Access token copied to clipboard"
      />
    </>
  );
};

export default Navbar;
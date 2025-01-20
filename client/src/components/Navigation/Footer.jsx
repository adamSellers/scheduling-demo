import React from 'react';
import { Box, Container, Grid2 as Grid, Typography, Link } from '@mui/material';
import { 
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon 
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'white',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Northern Trail Outfitters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Equipping adventurers since 1985 with premium outdoor gear and apparel.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Global Locations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  San Francisco • Beijing • Shanghai • Paris
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  +1 (415) 555-0123
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  contact@northerntrail.com
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="text.secondary" underline="hover">
                Book an Appointment
              </Link>
              <Link href="#" color="text.secondary" underline="hover">
                Our Services
              </Link>
              <Link href="#" color="text.secondary" underline="hover">
                Store Locations
              </Link>
              <Link href="#" color="text.secondary" underline="hover">
                Customer Support
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center"
              sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
            >
              © {new Date().getFullYear()} Northern Trail Outfitters. All rights reserved.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
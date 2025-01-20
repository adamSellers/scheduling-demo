import React from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Container, 
  Box 
} from '@mui/material';
import { SalesforceIcon } from '../Icons/SalesforceIcon';
import ApiService from '../../services/api.service';

const Login = () => {
  const handleSalesforceLogin = () => {
    ApiService.auth.login();
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <Card 
        elevation={3} 
        sx={{ 
          width: '100%',
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <CardContent 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            p: 4 
          }}
        >
          <Typography 
            variant="h5" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              mb: 3 
            }}
          >
            Welcome Back
          </Typography>

          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center" 
              gutterBottom
            >
              Sign in with your Salesforce account to continue
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSalesforceLogin}
            startIcon={<SalesforceIcon />}
            sx={{
              width: '100%',
              py: 1.5,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Continue with Salesforce
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
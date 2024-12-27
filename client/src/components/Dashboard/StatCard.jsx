import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, count, icon: Icon }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {Icon && <Icon sx={{ color: 'primary.main', mr: 1 }} />}
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
        {count}
      </Typography>
    </CardContent>
  </Card>
);

export default StatCard;
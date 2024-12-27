import React from 'react';
import { 
    Container, 
    Paper, 
    Typography, 
    Avatar, 
    Box, 
    Grid, 
    Card, 
    CardContent,
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';
import ApiService from '../../services/api.service';

const Profile = () => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [userInfo, setUserInfo] = React.useState(null);

    React.useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const data = await ApiService.profile.getUserInfo();
                setUserInfo(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ width: '100%', p:3 }}>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                        src={userInfo?.photoUrl}
                        sx={{ 
                            width: 100, 
                            height: 100,
                            mr: 3,
                            bgcolor: 'primary.main'
                        }}
                    >
                        {userInfo?.name?.[0] || 'U'}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {userInfo?.name || 'User Name'}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {userInfo?.email || 'email@example.com'}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Salesforce Details
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Organization
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {userInfo?.organization?.name || 'N/A'}
                                    </Typography>

                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                                        Role
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {userInfo?.userRole || 'N/A'}
                                    </Typography>

                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                                        Profile
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {userInfo?.profile?.name || 'N/A'}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Access Information
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Last Login
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {userInfo?.lastLoginDate ? new Date(userInfo.lastLoginDate).toLocaleString() : 'N/A'}
                                    </Typography>

                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                                        Status
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {userInfo?.isActive ? 'Active' : 'Inactive'}
                                    </Typography>

                                    {/* For development purposes only - remove in production */}
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                                        Access Token
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            wordBreak: 'break-all', 
                                            bgcolor: 'grey.100',
                                            p: 1,
                                            borderRadius: 1
                                        }}
                                    >
                                        {userInfo?.accessToken || 'N/A'}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default Profile;
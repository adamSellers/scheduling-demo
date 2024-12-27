import React, { useState } from 'react';
import {
    Box,
    Button,
    Modal,
    Paper,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    TextField,
    IconButton,
    Avatar,
    Stack,
    Divider,
    Container
} from '@mui/material';
import {
    Close as CloseIcon,
    Search as SearchIcon,
    GridView as GridViewIcon
} from '@mui/icons-material';

const AppointmentFlow = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchMethod, setSearchMethod] = useState('workType');

    // Modal styles
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 600,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        maxHeight: '90vh',
        overflow: 'auto'
    };

    // Parent record data (mock)
    const parentRecord = {
        name: "Daisy Zhao",
        avatarText: "DZ"
    };

    // Previous appointment data (mock)
    const previousAppointment = {
        name: "Steve Shanghai",
        role: "Technician",
        isAvailable: true,
        lastServiceDate: "28 Dec 2024",
        imageUrl: null
    };

    const handleSearchMethodChange = (event) => {
        setSearchMethod(event.target.value);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Main page content */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Book Appointment
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => setIsModalOpen(true)}
                >
                    New Appointment
                </Button>
            </Box>

            {/* Appointment Flow Modal */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                aria-labelledby="modal-title"
            >
                <Paper sx={modalStyle}>
                    {/* Modal Header */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" component="h2">
                                NTO Outbound Appointment
                            </Typography>
                            <IconButton onClick={() => setIsModalOpen(false)} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Typography variant="h4" align="center">
                            Select Service Resources
                        </Typography>
                    </Box>

                    {/* Parent Record Section */}
                    <Box sx={{ mb: 4 }}>
                        <Typography 
                            component="span" 
                            color="error.main" 
                            sx={{ display: 'inline-flex', alignItems: 'center', mb: 1 }}
                        >
                            * Parent Record
                        </Typography>
                        <Paper 
                            variant="outlined" 
                            sx={{ 
                                p: 2, 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <GridViewIcon color="primary" />
                                <Typography>{parentRecord.name}</Typography>
                            </Box>
                            <IconButton size="small">
                                <CloseIcon />
                            </IconButton>
                        </Paper>
                    </Box>

                    {/* Search Options */}
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Find a service resource
                        </Typography>

                        <RadioGroup
                            value={searchMethod}
                            onChange={handleSearchMethodChange}
                        >
                            {/* Work Type Option */}
                            <FormControlLabel
                                value="workType"
                                control={<Radio />}
                                label="By work type group, appointment type, or service territory"
                            />

                            {/* Name Search Option */}
                            <Box sx={{ mb: 2 }}>
                                <FormControlLabel
                                    value="name"
                                    control={<Radio />}
                                    label="By name"
                                />
                                {searchMethod === 'name' && (
                                    <Box sx={{ ml: 4, mt: 1 }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Search Service Resources..."
                                            size="small"
                                            InputProps={{
                                                endAdornment: <SearchIcon color="action" />
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>

                            {/* Previous Appointments Option */}
                            <FormControlLabel
                                value="previous"
                                control={<Radio />}
                                label="By previously scheduled service appointments"
                            />
                            {searchMethod === 'previous' && (
                                <Box sx={{ ml: 4, mt: 1 }}>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Stack direction="row" spacing={2}>
                                            <Avatar 
                                                src={previousAppointment.imageUrl}
                                                sx={{ width: 56, height: 56 }}
                                            >
                                                {!previousAppointment.imageUrl && previousAppointment.name.split(' ').map(n => n[0]).join('')}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1">
                                                    {previousAppointment.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {previousAppointment.role}
                                                </Typography>
                                                <Typography variant="body2">
                                                    true
                                                </Typography>
                                                <Typography variant="body2">
                                                    Last service appointment : {previousAppointment.lastServiceDate}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Box>
                            )}
                        </RadioGroup>
                    </Box>
                </Paper>
            </Modal>
        </Container>
    );
};

export default AppointmentFlow;
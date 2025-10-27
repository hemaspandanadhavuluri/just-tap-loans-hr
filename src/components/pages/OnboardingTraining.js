import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Container, Paper, Box, Stepper, Step, StepLabel, Button, Typography,
    TextField, Grid, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
    InputAdornment, Divider, StepIcon, StepButton, Input, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow,
    TableCell, TableBody, Chip, Avatar, Stack,
    ThemeProvider, createTheme
} from '@mui/material';
import axios from 'axios';

// MUI Icons
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BadgeIcon from '@mui/icons-material/Badge';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import BusinessIcon from '@mui/icons-material/Business';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import RoleForm from './RoleForm';

// Custom Theme for a modern, user-friendly look
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Blue
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#dc004e', // Pink
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
        success: { main: '#2e7d32' }
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h3: {
            fontWeight: 700,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 500,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                },
            },
        },
        MuiStepper: {
            styleOverrides: {
                root: {
                    padding: '24px 0',
                },
            },
        },
        MuiStepIcon: {
            styleOverrides: {
                root: {
                    '&.Mui-active': {
                        color: '#1976d2',
                    },
                    '&.Mui-completed': {
                        color: '#4caf50',
                    },
                },
            },
        },
    },
});


// --- INITIAL STATE ---
const initialFormData = {
    name: '', personalNumber: '', email: '', dateOfBirth: '', gender: '', profilePictureUrl: '',
    panNumber: '', aadharNumber: '', currentAddress: '', permanentAddress: '',
    fatherName: '', fatherDob: '', fatherMobile: '', motherName: '', motherDob: '', motherMobile: '',
    aadharUpload: null, panUpload: null,
    zone: '', region: '', reporting_hr: '', reporting_fo: '', reporting_zonalHead: '', reporting_regionalHead: '', reporting_ceo: 'Jane D. Rockefeller',
    joiningDate: '', joiningTime: '', joiningLocation: ''
};

const totalSteps = 5;

// Example zones and regions
const zones = ['North Zone', 'South Zone', 'East Zone', 'West Zone'];
const regions = ['Delhi NCR', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad'];
const hardcodedTrainers = [
    { id: 't1', name: 'Rajesh Kumar' },
    { id: 't2', name: 'Anita Sharma' },
    { id: 't3', name: 'Vikram Singh' }
];
const mockTimeSlots = [
    '2025-10-28 09:00',
    '2025-10-28 14:00',
    '2025-10-29 10:00',
    '2025-10-29 15:00'
];

// --- FORM STEP COMPONENTS (Props are passed down to all steps) ---

const PersonalInfo = ({ formData, handleChange, acceptedOffers, selectedCandidateId, setSelectedCandidateId }) => {
     const handleFileChange = (e) => {
        const { name, files } = e.target;
        // Mocking the behavior by creating a synthetic event structure for handleChange
        handleChange({ target: { name, value: files[0], type: 'file', files } });
    };

    const handleCandidateSelect = (e) => {
        const candidateId = e.target.value;
        setSelectedCandidateId(candidateId);

        if (candidateId) {
            const selectedOffer = acceptedOffers.find(offer => offer._id === candidateId);
            if (selectedOffer) {
                // Pre-fill form data with candidate information
                handleChange({ target: { name: 'name', value: selectedOffer.candidateName || '' } });
                handleChange({ target: { name: 'email', value: selectedOffer.email || '' } });
                handleChange({ target: { name: 'dateOfBirth', value: selectedOffer.application?.dateOfBirth ? new Date(selectedOffer.application.dateOfBirth).toISOString().split('T')[0] : '' } });
                handleChange({ target: { name: 'personalNumber', value: selectedOffer.application?.phone || '' } });
            }
        } else {
            // Manual entry, clear pre-filled fields
            handleChange({ target: { name: 'email', value: '' } });
            handleChange({ target: { name: 'dateOfBirth', value: '' } });
            handleChange({ target: { name: 'personalNumber', value: '' } });
        }
    };

    return <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '3px solid', borderColor: 'primary.main', pb: 1, color: 'text.primary', fontWeight: 'bold' }}>
            <AccountCircleIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
            1. Personal & Contact Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please provide your basic personal details and contact information.
        </Typography>


        <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth required variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <InputLabel>Full Name</InputLabel>
                    <Select
                        value={selectedCandidateId}
                        onChange={handleCandidateSelect}
                        label="Full Name"
                    >
                        <MenuItem value="">
                            <em>Manual Entry</em>
                        </MenuItem>
                        {acceptedOffers.map(offer => (
                            <MenuItem key={offer._id} value={offer._id}>
                                {offer.candidateName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {selectedCandidateId === "" && (
                    <TextField
                        fullWidth
                        label="Enter Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mt: 2 }}
                    />
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Personal Phone Number"
                    name="personalNumber"
                    value={formData.personalNumber}
                    onChange={handleChange}
                    required
                    placeholder="+91 9876543210"
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    type="email"
                    placeholder="jane.doe@company.com"
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth required variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                        labelId="gender-label"
                        id="gender"
                        name="gender"
                        value={formData.gender || ''}
                        label="Gender"
                        onChange={handleChange}
                    >
                        <MenuItem value=""><em>Select Gender</em></MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
             <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel shrink={true} htmlFor="profileUpload">Profile Picture (Optional)</InputLabel>
                        <Input
                            id="profileUpload"
                            name="profileUpload"
                            type="file"
                            onChange={handleFileChange}
                            sx={{ mt: 3, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            inputProps={{ accept: '.jpg,.png,.jpeg' }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <Button
                                        variant="contained"
                                        component="label"
                                        startIcon={<UploadFileIcon />}
                                        size="small"
                                        color={formData.profileUpload ? "success" : "primary"}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {formData.profileUpload ? 'Change' : 'Upload'}
                                        <input
                                            type="file"
                                            hidden
                                            name="profileUpload"
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                </InputAdornment>
                            }
                        />
                         {formData.profileUpload && (
                            <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                                Selected: {formData.profileUpload.name}
                            </Typography>
                        )}
                    </FormControl>
                </Grid>
        </Grid>
    </Box>
};

const IdentityAddress = ({ formData, handleChange }) => (
    <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '3px solid', borderColor: 'primary.main', pb: 1, color: 'text.primary', fontWeight: 'bold' }}>
            <BadgeIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
            2. Identity & Address Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Provide your identity details and residential address for verification purposes.
        </Typography>
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="PAN Number"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    required
                    placeholder="ABCDE1234F"
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Aadhar Number"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    required
                    placeholder="XXXX XXXX XXXX"
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Current Address"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleChange}
                    required
                    multiline
                    rows={3}
                    placeholder="H.No, Street, Village, City, State, Pin Code"
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Permanent Address (If different)"
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Same as Current Address, or different address"
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
        </Grid>
    </Box>
);

const FamilyDetails = ({ formData, handleChange }) => (
    <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '3px solid', borderColor: 'primary.main', pb: 1, color: 'text.primary', fontWeight: 'bold' }}>
            <FamilyRestroomIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
            3. Family Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Provide information about your parents for family records.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2, color: 'text.secondary' }}>
            Father's Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Full Name"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Date of Birth"
                    name="fatherDob"
                    value={formData.fatherDob}
                    onChange={handleChange}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Mobile Number"
                    name="fatherMobile"
                    value={formData.fatherMobile}
                    onChange={handleChange}
                    placeholder="+91 XXXX"
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 5, mb: 2, color: 'text.secondary' }}>
            Mother's Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Full Name"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Date of Birth"
                    name="motherDob"
                    value={formData.motherDob}
                    onChange={handleChange}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Mobile Number"
                    name="motherMobile"
                    value={formData.motherMobile}
                    onChange={handleChange}
                    placeholder="+91 XXXX"
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
        </Grid>
    </Box>
);

const DocumentUploads = ({ formData, handleChange }) => {
    // Helper function for file input change
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        // Mocking the behavior by creating a synthetic event structure for handleChange
        handleChange({ target: { name, value: files[0], type: 'file', files } });
    };

    return (
        <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '3px solid', borderColor: 'primary.main', pb: 1, color: 'text.primary', fontWeight: 'bold' }}>
                <UploadFileIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
                4. Document Uploads
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload required documents for verification. File uploads are mocked; they just store the file object in state.
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel shrink={true} htmlFor="aadharUpload">Aadhar Card Copy</InputLabel>
                        <Input
                            id="aadharUpload"
                            name="aadharUpload"
                            type="file"
                            onChange={handleFileChange}
                            required
                            sx={{ mt: 3, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            inputProps={{ accept: '.pdf,.jpg,.png' }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <Button
                                        variant="contained"
                                        component="label"
                                        startIcon={<UploadFileIcon />}
                                        size="small"
                                        color={formData.aadharUpload ? "success" : "primary"}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {formData.aadharUpload ? 'Change File' : 'Upload'}
                                        <input
                                            type="file"
                                            hidden
                                            name="aadharUpload"
                                            onChange={handleFileChange}
                                            required
                                        />
                                    </Button>
                                </InputAdornment>
                            }
                        />
                         {formData.aadharUpload && (
                            <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                                Selected: {formData.aadharUpload.name}
                            </Typography>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel shrink={true} htmlFor="panUpload">PAN Card Copy</InputLabel>
                        <Input
                            id="panUpload"
                            name="panUpload"
                            type="file"
                            onChange={handleFileChange}
                            required
                            sx={{ mt: 3, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            inputProps={{ accept: '.pdf,.jpg,.png' }}
                             endAdornment={
                                <InputAdornment position="end">
                                    <Button
                                        variant="contained"
                                        component="label"
                                        startIcon={<UploadFileIcon />}
                                        size="small"
                                        color={formData.panUpload ? "success" : "primary"}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {formData.panUpload ? 'Change File' : 'Upload'}
                                        <input
                                            type="file"
                                            hidden
                                            name="panUpload"
                                            onChange={handleFileChange}
                                            required
                                        />
                                    </Button>
                                </InputAdornment>
                            }
                        />
                        {formData.panUpload && (
                            <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                                Selected: {formData.panUpload.name}
                            </Typography>
                        )}
                    </FormControl>
                </Grid>
            </Grid>
        </Box>
    );
};

const OrganizationalDetails = ({ formData, handleChange }) => (
    <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '3px solid', borderColor: 'primary.main', pb: 1, color: 'text.primary', fontWeight: 'bold' }}>
            <BusinessIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
            5. Organizational & Reporting Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select your organizational zone, region, and reporting structure.
        </Typography>
        <Grid container spacing={3}>
            {/* Zone Dropdown */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth required variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <InputLabel id="zone-label">Zone</InputLabel>
                    <Select
                        labelId="zone-label"
                        id="zone"
                        name="zone"
                        value={formData.zone || ''}
                        label="Zone"
                        onChange={handleChange}
                    >
                        <MenuItem value=""><em>Select Zone</em></MenuItem>
                        {zones.map(z => <MenuItem key={z} value={z}>{z}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            {/* Region Dropdown */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth required variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <InputLabel id="region-label">Region</InputLabel>
                    <Select
                        labelId="region-label"
                        id="region"
                        name="region"
                        value={formData.region || ''}
                        label="Region"
                        onChange={handleChange}
                    >
                        <MenuItem value=""><em>Select Region</em></MenuItem>
                        {regions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 5, mb: 2, color: 'text.secondary' }}>
            Reporting Hierarchy
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <RoleForm formData={formData} handleChange={handleChange} />

        <Typography variant="h6" gutterBottom sx={{ mt: 5, mb: 2, color: 'text.secondary' }}>
            Joining Details
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Joining Date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    required
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Joining Time"
                    name="joiningTime"
                    value={formData.joiningTime}
                    onChange={handleChange}
                    required
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Joining Location"
                    name="joiningLocation"
                    value={formData.joiningLocation}
                    onChange={handleChange}
                    required
                    placeholder="Office Address or Meeting Point"
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>
        </Grid>
    </Box>
);

// Array to manage steps and their content/titles
const steps = [
    { title: 'Personal Info', component: PersonalInfo, requiredFields: ['name', 'personalNumber', 'email', 'dateOfBirth', 'gender'] },
    { title: 'Identity & Address', component: IdentityAddress, requiredFields: ['panNumber', 'aadharNumber', 'currentAddress'] },
    { title: 'Family Details', component: FamilyDetails, requiredFields: [] },
    { title: 'Document Upload', component: DocumentUploads, requiredFields: ['aadharUpload', 'panUpload'] },
    { title: 'Org. Details', component: OrganizationalDetails, requiredFields: ['zone', 'region', 'role', 'joiningDate', 'joiningTime', 'joiningLocation'] },
];


// --- MAIN APPLICATION COMPONENT ---

const OnboardingTraining = () => {
    const [currentView, setCurrentView] = useState('dashboard'); // Default to dashboard view 
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [acceptedOffers, setAcceptedOffers] = useState([]);
    const [jobTitles, setJobTitles] = useState([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState('');



    // candidates list representing dashboard items (fetched from user model)
    const [candidates, setCandidates] = useState([]);
    const [trainers, setTrainers] = useState(hardcodedTrainers);
    const [timeSlots, setTimeSlots] = useState([
        '2025-10-28 09:00',
        '2025-10-28 14:00',
        '2025-10-29 10:00',
        '2025-10-29 15:00',
        '2025-10-30 11:00',
        '2025-10-30 16:00'
    ]);

    // Fetch onboarding candidates from backend
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/users/onboarding');
                if (response.data) {
                    // Transform backend data to match component expectations
                    const transformedCandidates = response.data.map(candidate => ({
                        id: candidate._id,
                        name: candidate.fullName,
                        email: candidate.email,
                        status: candidate.onboardingStatus,
                        progress: candidate.progress || 0,
                        trainer: candidate.trainer ? { id: candidate.trainer._id, name: candidate.trainer.fullName } : null,
                        timeslot: candidate.timeslot
                    }));
                    setCandidates(transformedCandidates);
                }
            } catch (error) {
                console.error('Error fetching candidates:', error);
                showMessage('Failed to load candidates', 'error');
            }
        };

        fetchCandidates();
    }, []);

    // Fetch trainers from backend (using managers endpoint for now)
    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/users/managers');
                if (response.data) {
                    // Combine zonalHeads and regionalHeads as potential trainers
                    const allTrainers = [
                        ...response.data.zonalHeads.map(h => ({ id: h.id, name: h.name })),
                        ...response.data.regionalHeads.map(h => ({ id: h.id, name: h.name }))
                    ];
                    setTrainers(allTrainers);
                }
            } catch (error) {
                console.error('Error fetching trainers:', error);
                // Fallback to mock trainers if API fails
                setTrainers([
                    { id: 't1', name: 'Rajesh Kumar' },
                    { id: 't2', name: 'Anita Sharma' },
                    { id: 't3', name: 'Vikram Singh' }
                ]);
            }
        };

        fetchTrainers();
    }, []);

    // Fetch accepted offers for dropdown
    useEffect(() => {
        const fetchAcceptedOffers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/offers/accepted/list');
                if (response.data) {
                    setAcceptedOffers(response.data);
                }
            } catch (error) {
                console.error('Error fetching accepted offers:', error);
            }
        };

        fetchAcceptedOffers();
    }, []);

    // dialog states
    const [assignOpen, setAssignOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedTrainerId, setSelectedTrainerId] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [trainingOpen, setTrainingOpen] = useState(false);

    // Handle form input changes
    const handleChange = useCallback((e) => {
        const { name, value, type, files } = e.target;
        
        setFormData(prevData => ({
            ...prevData,
            // Handle file type input specifically
            [name]: type === 'file' && files ? files[0] : value
        }));
    }, []);

    // Function to check if all required fields in the current step are filled
    const validateCurrentStep = useCallback(() => {
        const currentStepData = steps[currentStep - 1];
        let requiredFields = [...currentStepData.requiredFields];

        // For the last step (Org. Details), add role-specific required fields
        if (currentStep === totalSteps) {
            const role = formData.role;
            if (role === 'FO') {
                requiredFields.push('reporting_zonalHead', 'reporting_regionalHead');
            } else if (role === 'RegionalHead') {
                requiredFields.push('reporting_zonalHead');
            }
            // ZonalHead and CEO have no additional required fields
        }

        let isValid = true;
        const currentTab = document.getElementById(`step-content-${currentStep}`);

        requiredFields.forEach(fieldName => {
            const value = formData[fieldName];
            // Find the actual input element to apply border styles (MUI uses specific input structures)
            const fieldElement = currentTab?.querySelector(`[name="${fieldName}"]`);

            // Validation logic for general fields and file uploads
            if (value === '' || value === null || value === undefined || (value instanceof File && !value.name)) {
                isValid = false;
                // Add validation class for visual feedback (though MUI fields handle error state better)
                if (fieldElement) {
                    // In a real MUI app, you would use the TextField 'error' prop and helperText
                    // For a quick, reactive check on next/submit, we rely on the logic here.
                }
            }
        });

        return isValid;
    }, [currentStep, formData]);

    // Show a temporary message
    const showMessage = (text, type = 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    // Handle step changes
    const changeStep = (direction) => {
        // Validation check only when moving forward
        if (direction > 0 && !validateCurrentStep()) {
            showMessage('Please fill out all required fields in this section.', 'error');
            return;
        }

        let newStep = currentStep + direction;
        if (newStep >= 1 && newStep <= totalSteps) {
            setCurrentStep(newStep);
            setMessage({ text: '', type: '' }); // Clear message on step change
        }
    };
    
    const jumpToStep = (stepIndex) => {
        // Allow jumping back freely. 
        if (stepIndex < currentStep) {
            setCurrentStep(stepIndex);
            setMessage({ text: '', type: '' });
            return;
        }
        
        // Allow jumping forward only if previous step is valid
        if (validateCurrentStep()) {
             setCurrentStep(stepIndex);
             setMessage({ text: '', type: '' });
        } else {
            showMessage('Please complete the current step before proceeding.', 'error');
        }
    };

    // Submission Handler to Backend
    const handleFormSubmit = async (e) => {
        console.log("Handle Submit");
        console.log("Form data ", formData);
        e.preventDefault();

        if (!validateCurrentStep()) {
            showMessage('Please fill out all required fields in the final section.', 'error');
            return;
        }

        setIsSubmitting(true);
        showMessage('Submitting employee record...', 'info');

        try {
            const formDataToSend = new FormData();

            // Append all form fields
            Object.keys(formData).forEach(key => {
                if (formData[key] instanceof File) {
                    formDataToSend.append(key, formData[key]);
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Role is already in formData from RoleForm

            const response = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                body: formDataToSend,
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Employee record successfully created.', 'success');
                // Reset form state after success
                setTimeout(() => {
                    setFormData(initialFormData);
                    setCurrentStep(1);
                    setCurrentView('dashboard'); // Return to dashboard view after submission
                }, 2000);
            } else {
                showMessage(result.message || 'Error creating employee record.', 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showMessage('Network error. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
 
     // Dashboard actions
    const openAssign = (candidate) => {
        setSelectedCandidate(candidate);
        setSelectedTrainerId(candidate.trainer?.id || '');
        setSelectedSlot(candidate.timeslot || '');
        setAssignOpen(true);
    };

    const submitAssign = () => {
        if (!selectedTrainerId || !selectedSlot) { showMessage('Select trainer and slot', 'error'); return; }
        const trainer = trainers.find(t => t.id === selectedTrainerId);
        setCandidates(prev => prev.map(c => c.id === selectedCandidate.id ? { ...c, trainer, timeslot: selectedSlot, status: 'training', progress: Math.max(c.progress, 5) } : c));
        setAssignOpen(false);
        showMessage('Trainer assigned and training scheduled', 'success');
    };

    const openTraining = (candidate) => {
        setSelectedCandidate(candidate);
        setTrainingOpen(true);
    };

    const updateProgress = (candidateId, newProgress) => {
        setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, progress: newProgress, status: newProgress >= 100 ? 'completed' : (c.status === 'onboarding' ? 'training' : c.status) } : c));
    };


    // derived stats
    const stats = useMemo(() => {
        const total = candidates.length;
        const onboarding = candidates.filter(c => c.status === 'onboarding').length;
        const training = candidates.filter(c => c.status === 'training').length;
        const completed = candidates.filter(c => c.status === 'completed').length;
        return { total, onboarding, training, completed };
    }, [candidates]);

    // inject minimal CSS for non-MUI classes (user asked for styling)
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .stat-card { padding: 14px; border-radius: 10px; color: #fff; }
            .stat-blue { background: linear-gradient(90deg,#3b82f6,#1d4ed8); }
            .stat-green { background: linear-gradient(90deg,#10b981,#047857); }
            .stat-orange { background: linear-gradient(90deg,#f59e0b,#d97706); }
            .stat-purple { background: linear-gradient(90deg,#8b5cf6,#6d28d9); }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);


    // --- RENDER VIEWS ---
    //new changes needed to be added 
    const renderDashboard = () => (
        // <Card sx={{ maxWidth: 600, width: '100%', p: 4, textAlign: 'center', boxShadow: 8, borderRadius: 3 }}>
        //     <CardContent>
        //         <PersonAddAlt1Icon sx={{ color: 'primary.main', mb: 2, fontSize: 80 }}/>
        //         <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        //             Access the tools you need to manage employee records. Click below to start onboarding a new employee.
        //         </Typography>
        //         <Button
        //             onClick={() => setCurrentView('form')}
        //             variant="contained"
        //             size="large"
        //             startIcon={<PersonAddAlt1Icon />}
        //             sx={{ py: 1.5, px: 4, borderRadius: 2 }}
        //         >
        //             Start New Employee Onboarding
        //         </Button>5
        //     </CardContent>
        // </Card>
        <Box sx={{ width: '100%', maxWidth: 1100, marginTop: -40}}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h4">Onboarding & Training Dashboard</Typography>
                <Box>
                    <Button variant="outlined" startIcon={<PersonAddAlt1Icon />} onClick={() => setCurrentView('form')}>New Onboarding</Button>
                </Box>
            </Box>

             {/* stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Box className="stat-card stat-blue">
                        <Typography variant="subtitle2">Total Candidates</Typography>
                        <Typography variant="h5">{stats.total}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Box className="stat-card stat-orange">
                        <Typography variant="subtitle2">Onboarding</Typography>
                        <Typography variant="h5">{stats.onboarding}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Box className="stat-card stat-purple">
                        <Typography variant="subtitle2">In Training</Typography>
                        <Typography variant="h5">{stats.training}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Box className="stat-card stat-green">
                        <Typography variant="subtitle2">Completed</Typography>
                        <Typography variant="h5">{stats.completed}</Typography>
                    </Box>
                </Grid>
            </Grid>

             {/* candidates table */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Candidates</Typography>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Candidate</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Trainer / Slot</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {candidates.map(c => (
                            <TableRow key={c.id}>
                                <TableCell>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{ bgcolor: '#1976d2' }}>{c.name?.slice(0,1)}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle2">{c.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Chip label={c.status} color={c.status === 'completed' ? 'success' : (c.status === 'training' ? 'warning' : 'default')} size="small" />
                                </TableCell>
                                <TableCell>
                                    {c.trainer ? <Box><Typography variant="body2">{c.trainer.name}</Typography><Typography variant="caption" color="text.secondary"><ScheduleIcon sx={{ fontSize: 12, verticalAlign: 'middle' }} /> {c.timeslot}</Typography></Box> : <Typography variant="caption" color="text.secondary">Unassigned</Typography>}
                                </TableCell>
                                <TableCell sx={{ width: 240 }}>
                                    <Typography variant="caption">{c.progress}%</Typography>
                                    <LinearProgress variant="determinate" value={c.progress} sx={{ mt: 0.5 }} />
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Button size="small" variant="outlined" onClick={() => openTraining(c)}>View</Button>
                                        <Button size="small" variant="contained" onClick={() => openAssign(c)} startIcon={<PeopleIcon />}>Assign</Button>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );

    const renderEmployeeForm = () => {
        const CurrentStepComponent = steps[currentStep - 1].component;
        
        return (
            <Paper 
                elevation={10} 
                sx={{ 
                    width: '100%', 
                    maxWidth: 1000, 
                    p: { xs: 3, md: 5 }, 
                    borderRadius: 3 
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Typography variant="h3" component="h1" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                        New Employee Onboarding Form
                    </Typography>
                    <Typography color="text.secondary">
                        Complete all 5 steps to submit the new employee record.
                    </Typography>
                </Box>

                {/* Step Navigation Bar (Stepper) */}
                <Stepper activeStep={currentStep - 1} alternativeLabel sx={{ mb: 6 }}>
                    {steps.map((step, index) => (
                        <Step key={step.title} completed={currentStep - 1 > index}>
                            <StepButton onClick={() => jumpToStep(index + 1)}>
                                <StepLabel 
                                    StepIconComponent={(props) => (
                                        <StepIcon {...props} />
                                    )}
                                >
                                    {step.title}
                                </StepLabel>
                            </StepButton>
                        </Step>
                    ))}
                </Stepper>

                {/* Form Content */}
                <form onSubmit={handleFormSubmit}>

                    <Box id={`step-content-${currentStep}`}>
                        {/* Render current step component */}
                        {currentStep === 1 ? (
                            <PersonalInfo
                                formData={formData}
                                handleChange={handleChange}
                                acceptedOffers={acceptedOffers}
                                selectedCandidateId={selectedCandidateId}
                                setSelectedCandidateId={setSelectedCandidateId}
                            />
                        ) : (
                            <CurrentStepComponent formData={formData} handleChange={handleChange} />
                        )}
                    </Box>

                    {/* Message Box */}
                    {message.text && (
                        <Alert 
                            severity={message.type === 'info' ? 'info' : (message.type === 'success' ? 'success' : 'error')} 
                            sx={{ mt: 4, mb: 2 }}
                            onClose={() => setMessage({ text: '', type: '' })}
                        >
                            {message.text}
                        </Alert>
                    )}

                    <Divider sx={{ my: 4 }} />

                    {/* Navigation Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        
                        <Button 
                            variant="outlined" 
                            color="inherit" 
                            onClick={() => setCurrentView('dashboard')}
                            startIcon={<DashboardIcon />}
                        >
                            Back to Dashboard
                        </Button>
                        
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                disabled={currentStep === 1 || isSubmitting}
                                onClick={() => changeStep(-1)}
                                startIcon={<ArrowBackIcon />}
                                variant="outlined"
                            >
                                Previous
                            </Button>

                            {currentStep < totalSteps && (
                                <Button 
                                    variant="contained" 
                                    onClick={() => changeStep(1)} 
                                    disabled={isSubmitting}
                                    endIcon={<ArrowForwardIcon />}
                                >
                                    Next Step
                                </Button>
                            )}

                            {currentStep === totalSteps && (
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="success" 
                                    disabled={isSubmitting}
                                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Employee Record'}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </form>

            </Paper>
        );
    };

     // assign dialog render
    const AssignDialog = () => (
        <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth>
            <DialogTitle>Assign Trainer & Schedule</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>{selectedCandidate?.name}</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="trainer-label">Trainer</InputLabel>
                    <Select labelId="trainer-label" value={selectedTrainerId} label="Trainer" onChange={(e) => setSelectedTrainerId(e.target.value)}>
                        <MenuItem value=""><em>Select Trainer</em></MenuItem>
                        {trainers.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id="slot-label">Time Slot</InputLabel>
                    <Select labelId="slot-label" value={selectedSlot} label="Time Slot" onChange={(e) => setSelectedSlot(e.target.value)}>
                        <MenuItem value=""><em>Select Slot</em></MenuItem>
                        {mockTimeSlots.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={submitAssign}>Assign</Button>
            </DialogActions>
        </Dialog>
    );

    // training modal to simulate progress update
    const TrainingDialog = () => {
        const candidate = selectedCandidate;
        const [localProgress, setLocalProgress] = useState(candidate?.progress || 0);

        useEffect(() => { setLocalProgress(candidate?.progress || 0); }, [candidate]);

        if (!candidate) return null;
        return (
            <Dialog open={trainingOpen} onClose={() => setTrainingOpen(false)} fullWidth>
                <DialogTitle>Training - {candidate.name}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{candidate.trainer ? `Trainer: ${candidate.trainer.name}` : 'No trainer assigned'}</Typography>
                    <Typography variant="caption">Progress: {localProgress}%</Typography>
                    <LinearProgress variant="determinate" value={localProgress} sx={{ mt: 1, mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Button variant="outlined" onClick={() => setLocalProgress(p => Math.max(0, p - 10))}>-10%</Button>
                        <Button variant="outlined" onClick={() => setLocalProgress(p => Math.min(100, p + 10))}>+10%</Button>
                        <Button variant="outlined" onClick={() => setLocalProgress(100)}>Mark Complete</Button>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2">Modules</Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        <Chip label="Company Policies" color={localProgress >= 20 ? 'success' : 'default'} />
                        <Chip label="Product Training" color={localProgress >= 50 ? 'success' : 'default'} />
                        <Chip label="Systems & Tools" color={localProgress >= 80 ? 'success' : 'default'} />
                    </Stack>
                    </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTrainingOpen(false)}>Close</Button>
                    <Button variant="contained" onClick={() => { updateProgress(candidate.id, localProgress); setTrainingOpen(false); }}>Save Progress</Button>
                </DialogActions>
            </Dialog>
        );
    };


 return (
        <ThemeProvider theme={theme}>
            <Container
                maxWidth={false}
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    py: 4,
                    
                }}
            >{currentView === 'dashboard' ? renderDashboard() : renderEmployeeForm()}
            {/* dialogs */}
            <AssignDialog />
            <TrainingDialog />
               {/* small global message */}
                    {message.text && <Box sx={{ position: 'fixed', right: 20, bottom: 20, width: 320 }}><Alert severity={message.type === 'success' ? 'success' : (message.type === 'info' ? 'info' : 'error')}>{message.text}</Alert></Box>}
            

            </Container>
        </ThemeProvider>
    );
};

export default OnboardingTraining; 
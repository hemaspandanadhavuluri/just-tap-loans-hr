import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Container, Paper, Box, Stepper, Step, StepLabel, Button, Typography,
    TextField, Grid, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
    InputAdornment, Divider, StepIcon, StepButton, Input,
    ThemeProvider, createTheme
} from '@mui/material';
import axios from 'axios';

// MUI Icons
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BadgeIcon from '@mui/icons-material/Badge';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import BusinessIcon from '@mui/icons-material/Business';

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
    bankName: '', accountNumber: '', ifscCode: '', accountHolderName: '', bankStatementUpload: null
};

const totalSteps = 5;

// --- FORM STEP COMPONENTS ---

const PersonalInfo = ({ formData, handleChange }) => {
     const handleFileChange = (e) => {
        const { name, files } = e.target;
        handleChange({ target: { name, value: files[0], type: 'file', files } });
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
                <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
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
    const handleFileChange = (e) => {
        const { name, files } = e.target;
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

const BankDetails = ({ formData, handleChange }) => {
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        handleChange({ target: { name, value: files[0], type: 'file', files } });
    };

    return (
        <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '3px solid', borderColor: 'primary.main', pb: 1, color: 'text.primary', fontWeight: 'bold' }}>
                <BusinessIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
                5. Bank Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Provide your bank account details for salary processing.
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Bank Name"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Account Number"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="IFSC Code"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Account Holder Name"
                        name="accountHolderName"
                        value={formData.accountHolderName}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel shrink={true} htmlFor="bankStatementUpload">Bank Statement (Optional)</InputLabel>
                        <Input
                            id="bankStatementUpload"
                            name="bankStatementUpload"
                            type="file"
                            onChange={handleFileChange}
                            sx={{ mt: 3, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            inputProps={{ accept: '.pdf,.jpg,.png' }}
                             endAdornment={
                                <InputAdornment position="end">
                                    <Button
                                        variant="contained"
                                        component="label"
                                        startIcon={<UploadFileIcon />}
                                        size="small"
                                        color={formData.bankStatementUpload ? "success" : "primary"}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {formData.bankStatementUpload ? 'Change File' : 'Upload'}
                                        <input
                                            type="file"
                                            hidden
                                            name="bankStatementUpload"
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                </InputAdornment>
                            }
                        />
                        {formData.bankStatementUpload && (
                            <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                                Selected: {formData.bankStatementUpload.name}
                            </Typography>
                        )}
                    </FormControl>
                </Grid>
            </Grid>
        </Box>
    );
};

// Array to manage steps and their content/titles
const steps = [
    { title: 'Personal Info', component: PersonalInfo, requiredFields: ['name', 'personalNumber', 'email', 'dateOfBirth', 'gender'] },
    { title: 'Identity & Address', component: IdentityAddress, requiredFields: ['panNumber', 'aadharNumber', 'currentAddress'] },
    { title: 'Family Details', component: FamilyDetails, requiredFields: [] },
    { title: 'Document Upload', component: DocumentUploads, requiredFields: ['aadharUpload', 'panUpload'] },
    { title: 'Bank Details', component: BankDetails, requiredFields: ['bankName', 'accountNumber', 'ifscCode', 'accountHolderName'] },
];

// --- MAIN APPLICATION COMPONENT ---

const OnboardingForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Handle form input changes
    const handleChange = useCallback((e) => {
        const { name, value, type, files } = e.target;

        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'file' && files ? files[0] : value
        }));
    }, []);

    // Function to check if all required fields in the current step are filled
    const validateCurrentStep = useCallback(() => {
        const currentStepData = steps[currentStep - 1];
        let requiredFields = [...currentStepData.requiredFields];

        let isValid = true;
        const currentTab = document.getElementById(`step-content-${currentStep}`);

        requiredFields.forEach(fieldName => {
            const value = formData[fieldName];
            if (value === '' || value === null || value === undefined || (value instanceof File && !value.name)) {
                isValid = false;
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
        if (direction > 0 && !validateCurrentStep()) {
            showMessage('Please fill out all required fields in this section.', 'error');
            return;
        }

        let newStep = currentStep + direction;
        if (newStep >= 1 && newStep <= totalSteps) {
            setCurrentStep(newStep);
            setMessage({ text: '', type: '' });
        }
    };

    const jumpToStep = (stepIndex) => {
        if (stepIndex < currentStep) {
            setCurrentStep(stepIndex);
            setMessage({ text: '', type: '' });
            return;
        }

        if (validateCurrentStep()) {
             setCurrentStep(stepIndex);
             setMessage({ text: '', type: '' });
        } else {
            showMessage('Please complete the current step before proceeding.', 'error');
        }
    };

    // Submission Handler to Backend
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!validateCurrentStep()) {
            showMessage('Please fill out all required fields in the final section.', 'error');
            return;
        }

        setIsSubmitting(true);
        showMessage('Submitting onboarding form...', 'info');

        try {
            const formDataToSend = new FormData();

            Object.keys(formData).forEach(key => {
                if (formData[key] instanceof File) {
                    formDataToSend.append(key, formData[key]);
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const response = await fetch('http://localhost:5000/api/onboarding/submit', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();

            if (response.ok) {
                showMessage('Onboarding form submitted successfully. We are processing your details.', 'success');
                setTimeout(() => {
                    setFormData(initialFormData);
                    setCurrentStep(1);
                }, 2000);
            } else {
                showMessage(result.message || 'Error submitting form.', 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showMessage('Network error. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const CurrentStepComponent = steps[currentStep - 1].component;

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
            >
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
                            Employee Onboarding Form
                        </Typography>
                        <Typography color="text.secondary">
                            Complete all 5 steps to submit your onboarding details.
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
                            <CurrentStepComponent formData={formData} handleChange={handleChange} />
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
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    disabled={currentStep === 1 || isSubmitting}
                                    onClick={() => changeStep(-1)}
                                    startIcon={<ArrowBackIcon />}
                                    variant="outlined"
                                >
                                    Previous
                                </Button>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
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
                                        {isSubmitting ? 'Submitting...' : 'Submit Onboarding Form'}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </ThemeProvider>
    );
};

export default OnboardingForm;

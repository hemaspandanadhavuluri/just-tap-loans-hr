// OnboardingTraining.jsx
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Container, Paper, Box, Stepper, Step, StepLabel, Button, Typography,
  TextField, Grid, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
  Divider, StepButton, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Avatar, Stack, Tabs, Tab, ThemeProvider, createTheme
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import RoleForm from './RoleForm';

// Custom Theme
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    text: { primary: '#212121', secondary: '#757575' },
    success: { main: '#2e7d32' }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 700 }, h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 500 }
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } } },
    MuiStepper: { styleOverrides: { root: { padding: '24px 0' } } },
    MuiStepIcon: { styleOverrides: { root: { '&.Mui-active': { color: '#1976d2' }, '&.Mui-completed': { color: '#4caf50' } } } }
  },
});

// --- INITIAL STATE ---
const initialFormData = {
  zone: '', region: '', reporting_hr: '', reporting_fo: '', reporting_zonalHead: '', reporting_regionalHead: '', reporting_ceo: 'Bhaskar Davuluri',
  joiningDate: '', joiningTime: '', joiningLocation: '', salary: '', role: ''
};

const totalSteps = 1;
const zones = ['North Zone', 'South Zone', 'East Zone', 'West Zone'];
const regions = ['Delhi NCR', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad'];

// --- FORM STEP COMPONENTS ---
const OrganizationalDetails = ({ formData, handleChange }) => (
  <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
    <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '3px solid', borderColor: 'primary.main', pb: 1, color: 'text.primary', fontWeight: 'bold' }}>
      <BusinessIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
      Organizational & Joining Details
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Select organizational zone, region, and joining details.
    </Typography>
    <Grid container spacing={3}>
      {/* Zone */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
          <InputLabel id="zone-label">Zone</InputLabel>
          <Select
            labelId="zone-label"
            id="zone"
            name="zone"
            value={formData.zone ?? ''}
            label="Zone"
            onChange={handleChange}
          >
            <MenuItem value=""><em>Select Zone</em></MenuItem>
            {zones.map(z => <MenuItem key={z} value={z}>{z}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
      {/* Region */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
          <InputLabel id="region-label">Region</InputLabel>
          <Select
            labelId="region-label"
            id="region"
            name="region"
            value={formData.region ?? ''}
            label="Region"
            onChange={handleChange}
          >
            <MenuItem value=""><em>Select Region</em></MenuItem>
            {regions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
    </Grid>

    <Typography variant="h6" gutterBottom sx={{ mt: 5, mb: 2, color: 'text.secondary' }}>Reporting Hierarchy</Typography>
    <Divider sx={{ mb: 3 }} />
    <RoleForm formData={formData} handleChange={handleChange} />

    <Typography variant="h6" gutterBottom sx={{ mt: 5, mb: 2, color: 'text.secondary' }}>Joining Details</Typography>
    <Divider sx={{ mb: 3 }} />
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth label="Joining Date" name="joiningDate" value={formData.joiningDate ?? ''} onChange={handleChange} required type="date" InputLabelProps={{ shrink: true }} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth label="Joining Time" name="joiningTime" value={formData.joiningTime ?? ''} onChange={handleChange} required type="time" InputLabelProps={{ shrink: true }} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth label="Joining Location" name="joiningLocation" value={formData.joiningLocation ?? ''} onChange={handleChange} required placeholder="Office Address or Meeting Point" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth label="Salary" name="salary" value={formData.salary ?? ''} onChange={handleChange} required type="number" placeholder="Salary Amount" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
      </Grid>
    </Grid>
  </Box>
);

// steps array
const steps = [
  { title: 'Org. Details', component: OrganizationalDetails, requiredFields: ['zone', 'region', 'role', 'joiningDate', 'joiningTime', 'joiningLocation', 'salary'] },
];

// --- MAIN COMPONENT ---
const OnboardingTraining = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [onboardings, setOnboardings] = useState([]);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  //added now
  const [salary, setSalary] = useState(0);

  // dialogs & inputs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issueDetails, setIssueDetails] = useState('');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedCandidateEmail, setSelectedCandidateEmail] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // trainings
  const [trainings, setTrainings] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [assignTrainerDialogOpen, setAssignTrainerDialogOpen] = useState(false);
  const [viewTrainingDialogOpen, setViewTrainingDialogOpen] = useState(false);
  const [completeTrainingDialogOpen, setCompleteTrainingDialogOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({ employeeId: '', employeeName: '', trainingType: '', trainer: '', date: '', time: '', location: '' });
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [acceptedOffers, setAcceptedOffers] = useState([]);
  const [completeOnboardDialogOpen, setCompleteOnboardDialogOpen] = useState(false);

  // fetch data when dashboard active
  const fetchOnboardings = async () => {
    try {
      const pendingResponse = await axios.get('http://localhost:5000/api/onboarding/pending');
      const approvedResponse = await axios.get('http://localhost:5000/api/onboarding/approved');
      const onboardedResponse = await axios.get('http://localhost:5000/api/onboarding/onboarded');
      const allOnboardings = [...(pendingResponse.data || []), ...(approvedResponse.data || []), ...(onboardedResponse.data || [])];
      setOnboardings(allOnboardings);
    } catch (error) { console.error('Error fetching onboardings:', error); showMessage('Failed to load onboardings', 'error'); }
  };

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        let trainingsData = [];
        try {
          const response = await axios.get('http://localhost:5000/api/training/pending');
          trainingsData = response.data || [];
        } catch (trainingError) {
          console.warn('Training API not available, proceeding without pending trainings:', trainingError);
        }
        const onboardedResponse = await axios.get('http://localhost:5000/api/onboarding/onboarded');
        const onboardedData = onboardedResponse.data || [];
        const onboardedTrainings = onboardedData.map(o => ({
          _id: o._id,
          employeeId: o.employeeId || o._id, // Use employeeId if available, fallback to _id
          employeeName: o.name,
          trainingType: 'Onboarding Training',
          trainer: o.trainer || '',
          status: o.onboardingStatus === 'completed' ? 'completed' : 'pending',
          progress: o.progress || 0,
          date: '',
          time: '',
          location: ''
        }));

        // Create training records for onboarded employees if they don't exist
        const trainingPromises = onboardedData.filter(o => o.onboardingStatus !== 'completed').map(async (o) => {
          try {
            const existingTraining = await axios.get(`http://localhost:5000/api/training/employee/${o.employeeId || o._id}`);
            if (existingTraining.data.length === 0) {
              // Create training record
              await axios.post('http://localhost:5000/api/training', {
                employeeId: o.employeeId || o._id,
                employeeName: o.name,
                trainingType: 'Onboarding Training',
                trainer: o.trainer || '',
                date: '',
                time: '',
                location: ''
              });
            }
          } catch (error) {
            console.warn('Error creating training record:', error);
          }
        });

        await Promise.all(trainingPromises);
        setTrainings([...trainingsData, ...onboardedTrainings]);
      } catch (error) { console.error('Error fetching onboarded data:', error); showMessage('Failed to load trainings', 'error'); }
    };
    const fetchAcceptedOffers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/offers/accepted/list');
        if (response.data) setAcceptedOffers(response.data);
      } catch (error) { console.error('Error fetching accepted offers:', error); showMessage('Failed to load accepted offers', 'error'); }
    };

    if (currentView === 'dashboard') {
      fetchOnboardings();
      fetchTrainings();
      fetchAcceptedOffers();
    }
  }, [currentView]);

  // robust handleChange (supports Selects and file inputs)
  const handleChange = useCallback((e) => {
    if (!e || !e.target) return;
    const { name, value, type, files } = e.target;
    if (!name) {
      console.warn('handleChange: input has no name', e.target);
      return;
    }
    setFormData(prev => ({ ...prev, [name]: type === 'file' && files ? files[0] : (value == null ? '' : value) }));
  }, []);

  // validate with formData (no DOM lookups)
  const validateCurrentStep = useCallback(() => {
    const currentStepData = steps[currentStep - 1];
    if (!currentStepData) return true;
    let requiredFields = [...currentStepData.requiredFields];

    if (currentStep === totalSteps) {
      const role = formData.role;
      if (role === 'FO') requiredFields.push('reporting_zonalHead', 'reporting_regionalHead');
      else if (role === 'RegionalHead') requiredFields.push('reporting_zonalHead');
    }

    for (const field of requiredFields) {
      const value = formData[field];
      if (value instanceof File) {
        if (!value.name) return false;
        continue;
      }
      if (value === '' || value === null || value === undefined) return false;
    }
    return true;
  }, [currentStep, formData]);

  // show message
  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Prefill form and open final onboard form
  const startFinalOnboard = useCallback(async (onboarding) => {
    setSelectedOnboarding(onboarding);
    let fetchedSalary = 0;
    try {
      const response = await axios.get(`http://localhost:5000/api/onboarding/${onboarding._id}/salary`);
      fetchedSalary = response.data.salary;
      setSalary(fetchedSalary);
    } catch (error) {
      console.error('Error fetching salary:', error);
      setSalary(0);
    }
    setFormData(prev => ({
      ...prev,
      zone: onboarding.zone ?? prev.zone,
      region: onboarding.region ?? prev.region,
      joiningDate: onboarding.joiningDate ?? prev.joiningDate,
      joiningTime: onboarding.joiningTime ?? prev.joiningTime,
      joiningLocation: onboarding.joiningLocation ?? prev.joiningLocation,
      role: onboarding.role ?? prev.role,
      salary: fetchedSalary || ''
    }));
    setCurrentView('form');
  }, []);

  // step navigation
  const changeStep = (direction) => {
    if (direction > 0 && !validateCurrentStep()) { showMessage('Please fill out all required fields in this section.', 'error'); return; }
    let newStep = currentStep + direction;
    if (newStep >= 1 && newStep <= totalSteps) { setCurrentStep(newStep); setMessage({ text: '', type: '' }); }
  };

  const jumpToStep = (stepIndex) => {
    if (stepIndex < currentStep) { setCurrentStep(stepIndex); setMessage({ text: '', type: '' }); return; }
    if (validateCurrentStep()) { setCurrentStep(stepIndex); setMessage({ text: '', type: '' }); }
    else showMessage('Please complete the current step before proceeding.', 'error');
  };

  // submit final onboard
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) { showMessage('Please fill out all required fields in the final section.', 'error'); return; }
    setIsSubmitting(true);
    showMessage('Submitting employee record...', 'info');
    try {
      const response = await fetch('http://localhost:5000/api/onboarding/final-onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingId: selectedOnboarding?._id,
          reportingHierarchy: {
            reporting_hr: formData.reporting_hr,
            reporting_fo: formData.reporting_fo,
            reporting_zonalHead: formData.reporting_zonalHead,
            reporting_regionalHead: formData.reporting_regionalHead,
            reporting_ceo: formData.reporting_ceo
          },
          zone: formData.zone,
          region: formData.region,
          salary: formData.salary,
          joiningDate: formData.joiningDate,
          joiningTime: formData.joiningTime,
          joiningLocation: formData.joiningLocation
        })
      });
      const result = await response.json();
      if (response.ok) {
        showMessage('Employee record successfully created.', 'success');
        setTimeout(() => {
          setFormData(initialFormData);
          setCurrentStep(1);
          setCurrentView('dashboard');
          setSelectedOnboarding(null);
        }, 1200);
      } else showMessage(result.message || 'Error creating employee record.', 'error');
    } catch (error) { console.error('Submission error:', error); showMessage('Network error. Please try again.', 'error'); }
    finally { setIsSubmitting(false); }
  };

  // dashboard actions
  const handleView = (onboarding) => { setSelectedOnboarding(onboarding); setViewDialogOpen(true); };
  const handleApprove = (onboarding) => { setSelectedOnboarding(onboarding); setApproveDialogOpen(true); };
  const confirmApprove = async () => {
    try {
      await axios.put(`http://localhost:5000/api/onboarding/${selectedOnboarding._id}/approve`);
      setApproveDialogOpen(false);
      showMessage('Onboarding approved successfully', 'success');
      fetchOnboardings();
    } catch (error) { console.error('Error approving onboarding:', error); showMessage('Failed to approve onboarding', 'error'); }
  };

  const handleRaiseIssue = (onboarding) => { setSelectedOnboarding(onboarding); setIssueDialogOpen(true); };

  const confirmRaiseIssue = async () => {
    if (!issueDetails.trim()) { showMessage('Please provide issue details', 'error'); return; }
    try {
      await axios.put(`http://localhost:5000/api/onboarding/${selectedOnboarding._id}/raise-issue`, { issueDetails });
      setOnboardings(prev => prev.map(o => o._id === selectedOnboarding._id ? { ...o, status: 'issue', issueDetails } : o));
      setIssueDialogOpen(false);
      setIssueDetails('');
      showMessage('Issue raised and email sent to candidate', 'success');
    } catch (error) { console.error('Error raising issue:', error); showMessage('Failed to raise issue', 'error'); }
  };

  const handleSendFormLink = (offer) => { setSelectedCandidateEmail(offer.email ?? ''); setEmailDialogOpen(true); };
  const confirmSendFormLink = async () => {
    try { await axios.post('http://localhost:5000/api/onboarding/send-form-link', { email: selectedCandidateEmail }); setEmailDialogOpen(false); showMessage('Form link sent successfully', 'success'); }
    catch (error) { console.error('Error sending form link:', error); showMessage('Failed to send form link', 'error'); }
  };

  // training handlers (same as your original)
  const handleViewTraining = (training) => { setSelectedTraining(training); setViewTrainingDialogOpen(true); };
  const handleScheduleTraining = (training) => {
    setSelectedTraining(training);
    setScheduleFormData({
      employeeId: training.employeeId, employeeName: training.employeeName, trainingType: training.trainingType,
      trainer: training.trainer || '', date: training.date || '', time: training.time || '', location: training.location || ''
    });
    setScheduleDialogOpen(true);
  };
  const confirmScheduleTraining = async () => {
    try {
      await axios.put(`http://localhost:5000/api/training/${selectedTraining._id}/schedule`, scheduleFormData);
      setTrainings(prev => prev.map(t => t._id === selectedTraining._id ? { ...t, ...scheduleFormData, status: 'scheduled' } : t));
      setScheduleDialogOpen(false);
      showMessage('Training scheduled successfully', 'success');
    } catch (error) { console.error('Error scheduling training:', error); showMessage('Failed to schedule training', 'error'); }
  };
  const handleAssignTrainer = (training) => { setSelectedTraining(training); setSelectedTrainer(training.trainer || ''); setAssignTrainerDialogOpen(true); };
  const confirmAssignTrainer = async () => {
    if (!selectedTrainer.trim()) { showMessage('Please select a trainer', 'error'); return; }
    try {
      await axios.put(`http://localhost:5000/api/training/${selectedTraining._id}/assign-trainer`, { trainer: selectedTrainer });
      setTrainings(prev => prev.map(t => t._id === selectedTraining._id ? { ...t, trainer: selectedTrainer } : t));
      setAssignTrainerDialogOpen(false);
      showMessage('Trainer assigned successfully', 'success');
    } catch (error) { console.error('Error assigning trainer:', error); showMessage('Failed to assign trainer', 'error'); }
  };
  const handleCompleteTraining = (training) => { setSelectedTraining(training); setCompleteTrainingDialogOpen(true); };
  const confirmCompleteTraining = async () => {
    try {
      await axios.put(`http://localhost:5000/api/training/${selectedTraining._id}/complete`);
      setTrainings(prev => prev.map(t => t._id === selectedTraining._id ? { ...t, status: 'completed' } : t));
      setCompleteTrainingDialogOpen(false);
      showMessage('Training completed successfully', 'success');
    } catch (error) { console.error('Error completing training:', error); showMessage('Failed to complete training', 'error'); }
  };

  const handleCompleteOnboard = (onboarding) => { setSelectedOnboarding(onboarding); setCompleteOnboardDialogOpen(true); };
  const confirmCompleteOnboard = async () => {
    try {
      await axios.put(`http://localhost:5000/api/onboarding/${selectedOnboarding._id}/complete`);
      setOnboardings(prev => prev.map(o => o._id === selectedOnboarding._id ? { ...o, status: 'onboarded' } : o));
      setCompleteOnboardDialogOpen(false);
      showMessage('Onboarding completed successfully', 'success');
      fetchOnboardings();
    } catch (error) { console.error('Error completing onboarding:', error); showMessage('Failed to complete onboarding', 'error'); }
  };

  // derived stats
  const stats = useMemo(() => {
    const total = onboardings.length;
    const pending = onboardings.filter(o => o.status === 'pending').length;
    const approved = onboardings.filter(o => o.status === 'approved').length;
    const issues = onboardings.filter(o => o.status === 'issue').length;
    return { total, pending, approved, issues };
  }, [onboardings]);

  const trainingStats = useMemo(() => {
    const total = trainings.length;
    const scheduled = trainings.filter(t => t.status === 'scheduled').length;
    const completed = trainings.filter(t => t.status === 'completed').length;
    const pending = trainings.filter(t => t.status === 'pending').length;
    return { total, scheduled, completed, pending };
  }, [trainings]);

  // styles injection
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

  // stable handler for issue input
  const handleIssueChange = useCallback((e) => {
    setIssueDetails(e.target.value);
  }, []);

  // issue input ref for diagnostics and focus-keep fallback
  const issueInputRef = useRef(null);

  // log mount/unmount/focus/blur for diagnostics
  useEffect(() => {
    const el = issueInputRef.current;
    if (!el) return;
    const onFocus = () => console.debug('[ISSUE INPUT] focus');
    const onBlur = () => console.debug('[ISSUE INPUT] blur');
    console.debug('[ISSUE INPUT] mounted (input element):', el);
    el.addEventListener && el.addEventListener('focus', onFocus);
    el.addEventListener && el.addEventListener('blur', onBlur);
    return () => {
      console.debug('[ISSUE INPUT] unmounting');
      el.removeEventListener && el.removeEventListener('focus', onFocus);
      el.removeEventListener && el.removeEventListener('blur', onBlur);
    };
  }, [issueInputRef.current]);

  // try to keep focus if blurred unexpectedly while dialog open (small fallback)
  useEffect(() => {
    if (!issueDialogOpen) return;
    const el = issueInputRef.current;
    if (!el) return;
    const handleKeepFocus = () => {
      setTimeout(() => {
        if (document.activeElement !== el) {
          try { el.focus(); console.debug('[ISSUE INPUT] refocused by keepAlive'); } catch (e) { /* ignore */ }
        }
      }, 8);
    };
    el.addEventListener && el.addEventListener('blur', handleKeepFocus);
    return () => { el.removeEventListener && el.removeEventListener('blur', handleKeepFocus); };
  }, [issueDialogOpen, issueInputRef.current]);

  // --- RENDER VIEWS ---
  const renderDashboard = () => (
    <Box sx={{ width: '100%', maxWidth: 1200, marginTop: -4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Onboarding & Training Dashboard</Typography>
        <Box>
          <Button variant="outlined" startIcon={<EmailIcon />} onClick={() => setEmailDialogOpen(true)}>Send Form Link</Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Onboardings" />
        <Tab label="Next Trainings" />
        <Tab label="Accepted Offers" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}><Box className="stat-card stat-blue"><Typography variant="subtitle2">Total Onboardings</Typography><Typography variant="h5">{stats.total}</Typography></Box></Grid>
            <Grid item xs={12} sm={6} md={3}><Box className="stat-card stat-orange"><Typography variant="subtitle2">Pending Review</Typography><Typography variant="h5">{stats.pending}</Typography></Box></Grid>
            <Grid item xs={12} sm={6} md={3}><Box className="stat-card stat-green"><Typography variant="subtitle2">Approved</Typography><Typography variant="h5">{stats.approved}</Typography></Box></Grid>
            <Grid item xs={12} sm={6} md={3}><Box className="stat-card stat-purple"><Typography variant="subtitle2">Issues Raised</Typography><Typography variant="h5">{stats.issues}</Typography></Box></Grid>
          </Grid>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Onboarding Submissions</Typography>
            <Table size="small">
              <TableHead>
                <TableRow><TableCell>Candidate</TableCell><TableCell>Status</TableCell><TableCell>Submitted</TableCell><TableCell>Actions</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {onboardings.map(o => (
                  <TableRow key={o._id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: '#1976d2' }}>{o.name?.slice(0,1)}</Avatar>
                        <Box><Typography variant="subtitle2">{o.name}</Typography><Typography variant="caption" color="text.secondary">{o.email}</Typography></Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={o.status} color={o.status === 'approved' ? 'success' : o.status === 'onboarded' ? 'warning' : o.status === 'issue' ? 'error' : 'default'} size="small" icon={o.status === 'approved' ? <CheckCircleIcon /> : o.status === 'onboarded' ? <CheckCircleIcon /> : o.status === 'issue' ? <ErrorIcon /> : null} />
                    </TableCell>
                    <TableCell>{o.submittedAt ? new Date(o.submittedAt).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => handleView(o)} startIcon={<VisibilityIcon />}>View</Button>
                        {o.status === 'pending' && <>
                          <Button size="small" variant="contained" color="success" onClick={() => handleApprove(o)}>Approve</Button>
                          <Button size="small" variant="contained" color="error" onClick={() => handleRaiseIssue(o)}>Raise Issue</Button>
                        </>}
                        {o.status === 'approved' && !o.finalOnboardSubmitted && (
                          <Button size="small" variant="contained" onClick={() => startFinalOnboard(o)}>Final Onboard</Button>
                        )}
                        {o.status === 'approved' && o.finalOnboardSubmitted && (
                          <Button size="small" variant="contained" color="success" onClick={() => handleCompleteOnboard(o)}>Complete Onboard</Button>
                        )}
                        {o.status === 'onboarded' && (
                          <Chip label="Onboarded" color="success" size="small" />
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}

      {tabValue === 1 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}><Box className="stat-card stat-blue"><Typography variant="subtitle2">Total Trainings</Typography><Typography variant="h5">{trainingStats.total}</Typography></Box></Grid>
            <Grid item xs={12} sm={6} md={3}><Box className="stat-card stat-orange"><Typography variant="subtitle2">Scheduled</Typography><Typography variant="h5">{trainingStats.scheduled}</Typography></Box></Grid>
            <Grid item xs={12} sm={6} md={3}><Box className="stat-card stat-green"><Typography variant="subtitle2">Completed</Typography><Typography variant="h5">{trainingStats.completed}</Typography></Box></Grid>
            <Grid item xs={12} sm={6} md={3}><Box className="stat-card stat-purple"><Typography variant="subtitle2">Pending</Typography><Typography variant="h5">{trainingStats.pending}</Typography></Box></Grid>
          </Grid>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Training Sessions</Typography>
            <Table size="small">
              <TableHead>
                <TableRow><TableCell>Employee</TableCell><TableCell>Training Type</TableCell><TableCell>Trainer</TableCell><TableCell>Status</TableCell><TableCell>Scheduled Date</TableCell><TableCell>Actions</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {trainings.map(t => (
                  <TableRow key={t._id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: '#1976d2' }}>{t.employeeName?.slice(0,1)}</Avatar>
                        <Box><Typography variant="subtitle2">{t.employeeName}</Typography><Typography variant="caption" color="text.secondary">{t.employeeId}</Typography></Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{t.trainingType}</TableCell>
                    <TableCell>{t.trainer}</TableCell>
                    <TableCell>
                      <Chip label={t.status} color={t.status === 'completed' ? 'success' : t.status === 'scheduled' ? 'primary' : 'default'} size="small" icon={t.status === 'completed' ? <CheckCircleIcon /> : null} />
                    </TableCell>
                    <TableCell>{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}{t.time && ` ${t.time}`}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => handleViewTraining(t)} startIcon={<VisibilityIcon />}>View</Button>
                        {t.status === 'pending' && <>
                          <Button size="small" variant="contained" onClick={() => handleScheduleTraining(t)}>Schedule</Button>
                          <Button size="small" variant="contained" color="secondary" onClick={() => handleAssignTrainer(t)}>Assign Trainer</Button>
                        </>}
                        {t.status === 'scheduled' && <Button size="small" variant="contained" color="success" onClick={() => handleCompleteTraining(t)}>Complete</Button>}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}

      {tabValue === 2 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}><Box className="stat-card stat-blue"><Typography variant="subtitle2">Total Accepted Offers</Typography><Typography variant="h5">{acceptedOffers.length}</Typography></Box></Grid>
          </Grid>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Accepted Offers - Ready for Onboarding</Typography>
            <Table size="small">
              <TableHead><TableRow><TableCell>Candidate</TableCell><TableCell>Position</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {acceptedOffers.map(offer => (
                  <TableRow key={offer._id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: '#1976d2' }}>{offer.candidateName?.slice(0,1)}</Avatar>
                        <Box><Typography variant="subtitle2">{offer.candidateName}</Typography><Typography variant="caption" color="text.secondary">{offer.email}</Typography></Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{offer.position}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" onClick={() => handleSendFormLink(offer)} startIcon={<EmailIcon />}>Send Onboarding Form</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );

  const renderEmployeeForm = () => {
    const CurrentStepComponent = steps[currentStep - 1].component;
    return (
      <Paper elevation={10} sx={{ width: '100%', maxWidth: 1000, p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" component="h1" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
            Final Onboarding - {selectedOnboarding?.name}
          </Typography>
          <Typography color="text.secondary">Complete the final step to onboard the employee.</Typography>
        </Box>

        <Stepper activeStep={currentStep - 1} alternativeLabel sx={{ mb: 6 }}>
          {steps.map((step, index) => (
            <Step key={step.title} completed={currentStep - 1 > index}>
              <StepButton onClick={() => jumpToStep(index + 1)}>
                <StepLabel>{step.title}</StepLabel>
              </StepButton>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleFormSubmit}>
          <Box id={`step-content-${currentStep}`}>
            <CurrentStepComponent formData={formData} handleChange={handleChange} />
          </Box>

          {message.text && (
            <Alert severity={message.type === 'info' ? 'info' : (message.type === 'success' ? 'success' : 'error')} sx={{ mt: 4, mb: 2 }} onClose={() => setMessage({ text: '', type: '' })}>
              {message.text}
            </Alert>
          )}

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" color="inherit" onClick={() => setCurrentView('dashboard')} startIcon={<DashboardIcon />}>Back to Dashboard</Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentStep === totalSteps && (
                <Button type="submit" variant="contained" color="success" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}>
                  {isSubmitting ? 'Onboarding...' : 'Complete Onboarding'}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    );
  };

  // Read-only components (same as original)
  const ReadOnlyPersonalInfo = ({ data }) => (
    <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '3px solid', borderColor: 'primary.main', pb: 1, color: 'text.primary', fontWeight: 'bold' }}>
        <AccountCircleIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} /> 1. Personal & Contact Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Full Name</Typography><Typography>{data.name || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Personal Phone Number</Typography><Typography>{data.personalNumber || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Email Address</Typography><Typography>{data.email || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Date of Birth</Typography><Typography>{data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Gender</Typography><Typography>{data.gender || 'N/A'}</Typography></Grid>
        {data.profilePictureUrl && <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Profile Picture</Typography><img src={`http://localhost:5000${data.profilePictureUrl}`} alt="Profile" style={{ maxWidth: '100px', maxHeight: '100px' }} /></Grid>}
      </Grid>
    </Box>
  );

  const ReadOnlyIdentityAddress = ({ data }) => (
    <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '3px solid', borderColor: 'primary.main', pb: 1, color: 'text.primary', fontWeight: 'bold' }}>
        <BadgeIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} /> 2. Identity & Address Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">PAN Number</Typography><Typography>{data.panNumber || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Aadhar Number</Typography><Typography>{data.aadharNumber || 'N/A'}</Typography></Grid>
        <Grid item xs={12}><Typography variant="body2" color="text.secondary">Current Address</Typography><Typography>{data.currentAddress || 'N/A'}</Typography></Grid>
        <Grid item xs={12}><Typography variant="body2" color="text.secondary">Permanent Address</Typography><Typography>{data.permanentAddress || 'N/A'}</Typography></Grid>
      </Grid>
    </Box>
  );

  const ReadOnlyFamilyDetails = ({ data }) => (
    <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '3px solid', borderColor: 'primary.main', pb: 1, color: 'text.primary', fontWeight: 'bold' }}>
        <FamilyRestroomIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} /> 3. Family Details
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2, color: 'text.secondary' }}>Father's Information</Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}><Typography variant="body2" color="text.secondary">Full Name</Typography><Typography>{data.fatherName || 'N/A'}</Typography></Grid>
        <Grid item xs={12} md={4}><Typography variant="body2" color="text.secondary">Date of Birth</Typography><Typography>{data.fatherDob ? new Date(data.fatherDob).toLocaleDateString() : 'N/A'}</Typography></Grid>
        <Grid item xs={12} md={4}><Typography variant="body2" color="text.secondary">Mobile Number</Typography><Typography>{data.fatherMobile || 'N/A'}</Typography></Grid>
      </Grid>
      <Typography variant="h6" gutterBottom sx={{ mt: 5, mb: 2, color: 'text.secondary' }}>Mother's Information</Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}><Typography variant="body2" color="text.secondary">Full Name</Typography><Typography>{data.motherName || 'N/A'}</Typography></Grid>
        <Grid item xs={12} md={4}><Typography variant="body2" color="text.secondary">Date of Birth</Typography><Typography>{data.motherDob ? new Date(data.motherDob).toLocaleDateString() : 'N/A'}</Typography></Grid>
        <Grid item xs={12} md={4}><Typography variant="body2" color="text.secondary">Mobile Number</Typography><Typography>{data.motherMobile || 'N/A'}</Typography></Grid>
      </Grid>
    </Box>
  );

  const ReadOnlyDocumentUploads = ({ data }) => (
    <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '3px solid', borderColor: 'primary.main', pb: 1, color: 'text.primary', fontWeight: 'bold' }}>
        <UploadFileIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} /> 4. Document Uploads
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Aadhar Card Copy</Typography>{data.aadharUpload ? <img src={`http://localhost:5000${data.aadharUpload}`} alt="Aadhar" style={{ maxWidth: '200px', maxHeight: '200px' }} /> : <Typography>N/A</Typography>}</Grid>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">PAN Card Copy</Typography>{data.panUpload ? <img src={`http://localhost:5000${data.panUpload}`} alt="PAN" style={{ maxWidth: '200px', maxHeight: '200px' }} /> : <Typography>N/A</Typography>}</Grid>
      </Grid>
    </Box>
  );

  const ReadOnlyBankDetails = ({ data }) => (
    <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '3px solid', borderColor: 'primary.main', pb: 1, color: 'text.primary', fontWeight: 'bold' }}>
        <BusinessIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} /> 5. Bank Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Bank Name</Typography><Typography>{data.bankName || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Account Number</Typography><Typography>{data.accountNumber || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">IFSC Code</Typography><Typography>{data.ifscCode || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Account Holder Name</Typography><Typography>{data.accountHolderName || 'N/A'}</Typography></Grid>
        {data.bankStatementUpload && <Grid item xs={12}><Typography variant="body2" color="text.secondary">Bank Statement</Typography><img src={`http://localhost:5000${data.bankStatementUpload}`} alt="Bank Statement" style={{ maxWidth: '200px', maxHeight: '200px' }} /></Grid>}
      </Grid>
    </Box>
  );

  // View Dialog
  const ViewDialog = () => (
    <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle>Onboarding Form - {selectedOnboarding?.name}</DialogTitle>
      <DialogContent>
        {selectedOnboarding && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <ReadOnlyPersonalInfo data={selectedOnboarding} />
            <ReadOnlyIdentityAddress data={selectedOnboarding} />
            <ReadOnlyFamilyDetails data={selectedOnboarding} />
            <ReadOnlyDocumentUploads data={selectedOnboarding} />
            <ReadOnlyBankDetails data={selectedOnboarding} />
            {selectedOnboarding.status === 'issue' && (
              <Alert severity="error">
                <Typography variant="subtitle2">Issue Details:</Typography>
                <Typography>{selectedOnboarding.issueDetails}</Typography>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions><Button onClick={() => setViewDialogOpen(false)}>Close</Button></DialogActions>
    </Dialog>
  );

  // Approve Dialog
  const ApproveDialog = () => (
    <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
      <DialogTitle>Approve Onboarding</DialogTitle>
      <DialogContent><Typography>Are you sure you want to approve the onboarding for {selectedOnboarding?.name}?</Typography></DialogContent>
      <DialogActions><Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button><Button variant="contained" color="success" onClick={confirmApprove}>Approve</Button></DialogActions>
    </Dialog>
  );

  // Memoized Issue Dialog (stable subtree + focus fixes)
  const IssueDialogMemo = useMemo(() => (
    <Dialog
      open={issueDialogOpen}
      onClose={() => setIssueDialogOpen(false)}
      maxWidth="sm"
      fullWidth
      keepMounted
      ModalProps={{ disableEnforceFocus: true, disableRestoreFocus: true }}
    >
      <DialogTitle>Raise Issue</DialogTitle>
      <DialogContent>
        <TextField
          inputRef={issueInputRef}
          autoFocus
          fullWidth
          multiline
          rows={4}
          label="Issue Details"
          value={issueDetails ?? ''}
          onChange={handleIssueChange}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Describe the issues found in the onboarding form..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
        <Button variant="contained" color="error" onClick={confirmRaiseIssue}>Raise Issue</Button>
      </DialogActions>
    </Dialog>
  ), [issueDialogOpen, issueDetails, handleIssueChange, confirmRaiseIssue]);

  // Email Dialog
  const EmailDialog = () => (
    <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)}>
      <DialogTitle>Send Onboarding Form Link</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Candidate Email" value={selectedCandidateEmail ?? ''} onChange={(e) => setSelectedCandidateEmail(e.target.value)} type="email" />
      </DialogContent>
      <DialogActions><Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button><Button variant="contained" onClick={confirmSendFormLink}>Send Link</Button></DialogActions>
    </Dialog>
  );

  // View Training Dialog
  const ViewTrainingDialog = () => (
    <Dialog open={viewTrainingDialogOpen} onClose={() => setViewTrainingDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Training Details - {selectedTraining?.employeeName}</DialogTitle>
      <DialogContent>
        {selectedTraining && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Employee Info</Typography>
              <Typography>Name: {selectedTraining.employeeName}</Typography>
              <Typography>ID: {selectedTraining.employeeId}</Typography>
              <Typography>Training Type: {selectedTraining.trainingType}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Training Details</Typography>
              <Typography>Trainer: {selectedTraining.trainer || 'Not Assigned'}</Typography>
              <Typography>Status: {selectedTraining.status}</Typography>
              <Typography>Date: {selectedTraining.date ? new Date(selectedTraining.date).toLocaleDateString() : 'Not Scheduled'}</Typography>
              <Typography>Time: {selectedTraining.time || 'Not Scheduled'}</Typography>
              <Typography>Location: {selectedTraining.location || 'Not Specified'}</Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions><Button onClick={() => setViewTrainingDialogOpen(false)}>Close</Button></DialogActions>
    </Dialog>
  );

  // Schedule Dialog
  const ScheduleDialog = () => (
    <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Training</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}><TextField fullWidth label="Employee Name" value={scheduleFormData.employeeName ?? ''} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Training Type" value={scheduleFormData.trainingType ?? ''} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Date" name="date" type="date" value={scheduleFormData.date ?? ''} onChange={(e) => setScheduleFormData(prev => ({ ...prev, date: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Time" name="time" type="time" value={scheduleFormData.time ?? ''} onChange={(e) => setScheduleFormData(prev => ({ ...prev, time: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Location" name="location" value={scheduleFormData.location ?? ''} onChange={(e) => setScheduleFormData(prev => ({ ...prev, location: e.target.value }))} placeholder="Training location" /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions><Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button><Button variant="contained" onClick={confirmScheduleTraining}>Schedule</Button></DialogActions>
    </Dialog>
  );

  // Assign Trainer Dialog
  const AssignTrainerDialog = () => (
    <Dialog open={assignTrainerDialogOpen} onClose={() => setAssignTrainerDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Trainer</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}><TextField fullWidth label="Employee Name" value={selectedTraining?.employeeName ?? ''} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Training Type" value={selectedTraining?.trainingType ?? ''} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Trainer Name" value={selectedTrainer ?? ''} onChange={(e) => setSelectedTrainer(e.target.value)} placeholder="Enter trainer name" /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions><Button onClick={() => setAssignTrainerDialogOpen(false)}>Cancel</Button><Button variant="contained" onClick={confirmAssignTrainer}>Assign</Button></DialogActions>
    </Dialog>
  );

  // Complete Training Dialog
  const CompleteTrainingDialog = () => (
    <Dialog open={completeTrainingDialogOpen} onClose={() => setCompleteTrainingDialogOpen(false)}>
      <DialogTitle>Complete Training</DialogTitle>
      <DialogContent><Typography>Are you sure you want to mark this training as completed for {selectedTraining?.employeeName}?</Typography></DialogContent>
      <DialogActions><Button onClick={() => setCompleteTrainingDialogOpen(false)}>Cancel</Button><Button variant="contained" color="success" onClick={confirmCompleteTraining}>Complete</Button></DialogActions>
    </Dialog>
  );

  // Complete Onboard Dialog
  const CompleteOnboardDialog = () => (
    <Dialog open={completeOnboardDialogOpen} onClose={() => setCompleteOnboardDialogOpen(false)}>
      <DialogTitle>Complete Onboarding</DialogTitle>
      <DialogContent><Typography>Are you sure you want to mark this onboarding as completed for {selectedOnboarding?.name}?</Typography></DialogContent>
      <DialogActions><Button onClick={() => setCompleteOnboardDialogOpen(false)}>Cancel</Button><Button variant="contained" color="success" onClick={confirmCompleteOnboard}>Complete</Button></DialogActions>
    </Dialog>
  );

  // return render
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth={false} sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', py: 4 }}>
        {currentView === 'dashboard' ? renderDashboard() : renderEmployeeForm()}
        <ViewDialog />
        <ApproveDialog />
        {/* render memoized issue dialog */}
        {IssueDialogMemo}
        <EmailDialog />
        <ScheduleDialog />
        <AssignTrainerDialog />
        <ViewTrainingDialog />
        <CompleteTrainingDialog />
        <CompleteOnboardDialog />
        {/* small global message */}
        {message.text && <Box sx={{ position: 'fixed', right: 20, bottom: 20, width: 320 }}><Alert severity={message.type === 'success' ? 'success' : (message.type === 'info' ? 'info' : 'error')}>{message.text}</Alert></Box>}
      </Container>
    </ThemeProvider>
  );
};

export default OnboardingTraining;

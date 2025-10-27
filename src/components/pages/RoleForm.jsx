import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  FormHelperText,
  useTheme,
} from '@mui/material';

const RoleForm = ({ formData, handleChange }) => {
  const theme = useTheme();

  // State for employee role and selected reporting managers
  const [employeeType, setEmployeeType] = useState(formData.role || '');
  const [selectedZH, setSelectedZH] = useState(formData.reporting_zonalHead || '');
  const [selectedRH, setSelectedRH] = useState(formData.reporting_regionalHead || '');
  const [reportingSummary, setReportingSummary] = useState('Select an employee type to see the required hierarchy fields.');
  const [managers, setManagers] = useState({ zonalHeads: [], regionalHeads: [] });
  const [jobTitles, setJobTitles] = useState([]);

  // Role options for the dropdown
  const roles = [
    { value: 'FO', label: 'FO (Field Officer)' },
    { value: 'RegionalHead', label: 'Regional Head' },
    { value: 'ZonalHead', label: 'Zonal Head' },
    { value: 'CEO', label: 'CEO (Top Level)' },
  ];

  // Combine existing roles with job titles, avoiding duplicates
  const allRoles = [
    ...roles,
    ...jobTitles.filter(title => !roles.some(role => role.label === title)).map(title => ({ value: title, label: title })),
  ];

  // Fetch managers and job titles on component mount
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/managers');
        const data = await response.json();
        setManagers(data);
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    const fetchJobTitles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs/active/titles');
        const data = await response.json();
        setJobTitles(data);
      } catch (error) {
        console.error('Error fetching job titles:', error);
      }
    };

    fetchManagers();
    fetchJobTitles();
  }, []);

  /**
   * Effect to run whenever employeeType changes.
   * This handles the core logic of conditional rendering and summary updates.
   */
  useEffect(() => {
    let summaryText = 'Selected Role: ';

    // Reset selected reporting managers when the role changes
    setSelectedZH(formData.reporting_zonalHead || '');
    setSelectedRH(formData.reporting_regionalHead || '');

    switch (employeeType) {
      case 'FO':
        // FO (Field Officer) requires Regional Head and Zonal Head
        summaryText += `<span style="font-weight: 700; color: ${theme.palette.primary.main};">FO</span>. Requires selection of Regional Head and Zonal Head. (CEO → ZH → RH → FO)`;
        break;
      case 'RegionalHead':
        // RH (Regional Head) requires Zonal Head
        summaryText += `<span style="font-weight: 700; color: ${theme.palette.primary.main};">Regional Head</span>. Requires selection of Zonal Head. (CEO → ZH → RH)`;
        break;
      case 'ZonalHead':
        // ZH (Zonal Head) reports directly to CEO
        summaryText += `<span style="font-weight: 700; color: ${theme.palette.primary.main};">Zonal Head</span>. Reports directly to the CEO. (CEO → ZH)`;
        break;
      case 'CEO':
        // CEO (Top Level) requires no reports
        summaryText += `<span style="font-weight: 700; color: ${theme.palette.primary.main};">CEO</span>. No reporting managers are required.`;
        break;
      default:
        summaryText = 'Select an employee type to see the required hierarchy fields.';
        break;
    }

    setReportingSummary(summaryText);
  }, [employeeType, theme.palette.primary.main, formData.reporting_zonalHead, formData.reporting_regionalHead]);

  // Handler for main employee type change
  const handleEmployeeTypeChange = (event) => {
    const value = event.target.value;
    setEmployeeType(value);
    // Update parent formData
    handleChange({ target: { name: 'role', value } });
  };

  // Handler for Zonal Head change
  const handleZHChange = (event) => {
    const value = event.target.value;
    setSelectedZH(value);
    // Update parent formData
    handleChange({ target: { name: 'reporting_zonalHead', value } });
  };

  // Handler for Regional Head change
  const handleRHChange = (event) => {
    const value = event.target.value;
    setSelectedRH(value);
    // Update parent formData
    handleChange({ target: { name: 'reporting_regionalHead', value } });
  };

  /**
   * Renders the dynamic reporting fields based on employeeType state.
   */
  const renderReportingFields = () => {
    if (!employeeType || employeeType === 'CEO') {
      return null;
    }

    // 1. Zonal Head Field (Required for RH and FO)
    const zonalHeadField = (
      <FormControl fullWidth key="zh-select">
        <InputLabel id="zonal-head-label">Zonal Head</InputLabel>
        <Select
          labelId="zonal-head-label"
          id="zonalHead"
          value={selectedZH}
          label="Zonal Head"
          onChange={handleZHChange}
        >
          {managers.zonalHeads.map((zh) => (
            <MenuItem key={zh.id} value={zh.id}>{zh.name}</MenuItem>
          ))}
        </Select>
        <FormHelperText>Required supervisor for Regional Heads and FOs.</FormHelperText>
      </FormControl>
    );

    // 2. Regional Head Field (Required only for FO)
    const regionalHeadField = (
      <FormControl fullWidth key="rh-select">
        <InputLabel id="regional-head-label">Regional Head</InputLabel>
        <Select
          labelId="regional-head-label"
          id="regionalHead"
          value={selectedRH}
          label="Regional Head"
          onChange={handleRHChange}
        >
          {managers.regionalHeads.map((rh) => (
            <MenuItem key={rh.id} value={rh.id}>{rh.name}</MenuItem>
          ))}
        </Select>
        <FormHelperText>Required supervisor for Field Officers (FO).</FormHelperText>
      </FormControl>
    );

    // 3. CEO Field (Static display for ZH)
    const ceoField = (
      <Box key="ceo-display" sx={{ p: 2, bgcolor: theme.palette.info.light, borderRadius: 1, border: `1px solid ${theme.palette.info.main}` }}>
        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold' }}>Reports to CEO</Typography>
        <Typography variant="subtitle1" color="primary">Jane D. Rockefeller</Typography>
      </Box>
    );

    if (employeeType === 'ZonalHead') {
      return ceoField;
    } else if (employeeType === 'RegionalHead') {
      return zonalHeadField;
    } else if (employeeType === 'FO') {
      return (
        <Stack spacing={3}>
          {zonalHeadField}
          {regionalHeadField}
        </Stack>
      );
    }

    return null;
  };

  return (
    // Use Box and Tailwind utilities for simple, centered layout
    <Box className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
    
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>
          HR Panel: Reporting Structure Setup
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4, pb: 2, borderBottom: '1px solid #eee' }}>
          Select an employee type to define their reporting line.
        </Typography>

        {/* Employee Type Selection */}
        <Stack spacing={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="employee-type-label">Select Employee Type</InputLabel>
            <Select
              labelId="employee-type-label"
              id="employeeType"
              value={employeeType}
              label="Select Employee Type"
              onChange={handleEmployeeTypeChange}
            >
              <MenuItem value="">
                <em>-- Choose Role --</em>
              </MenuItem>
              {allRoles.map((role) => (
                <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Dynamic Reporting Fields Container */}
          <Box className="space-y-6">
            {renderReportingFields()}
          </Box>
        </Stack>

        {/* Summary Box */}
        <Box sx={{ mt: 5, p: 2, bgcolor: theme.palette.grey[100], borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            Current Reporting Requirement:
          </Typography>
          <Typography 
            variant="body2" 
            color="textSecondary" 
            dangerouslySetInnerHTML={{ __html: reportingSummary }} 
          />
        </Box>
    </Box>
  );
};

export default RoleForm;

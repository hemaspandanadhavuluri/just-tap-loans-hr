import React, { useState, useEffect } from 'react';
import { useActivity } from './ActivityContext';
import '../../Stylesheets/Employee_management.css';

function Employee_Management() {
    const { addActivity } = useActivity();
    const [activeTab, setActiveTab] = useState('active');
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fireReason, setFireReason] = useState('');
    const [resignationReason, setResignationReason] = useState('');
    const [resignationLetter, setResignationLetter] = useState(null);

    // New states for enhanced modal
    const [editingFields, setEditingFields] = useState({});
    const [editedValues, setEditedValues] = useState({});
    const [showSubModal, setShowSubModal] = useState(null); // 'generateLetter', 'assignProject', 'manageCredentials'
    const [assignProjectData, setAssignProjectData] = useState({ projectName: '', startDate: '', endDate: '', description: '' });
    const [manageCredentialsData, setManageCredentialsData] = useState({ username: '', password: '', role: '' });
    const [letterTemplate, setLetterTemplate] = useState('');

    // Hardcoded data for pending edits and resignation
    const [pendingEdits] = useState({
        fullName: 'John Doe Updated',
        email: 'john.updated@example.com',
        phoneNumber: '+1234567891'
    });
    const [pendingResignation] = useState({
        reason: 'Personal reasons',
        letter: 'Sample resignation letter content...'
    });

    useEffect(() => {
        fetchEmployees();
    }, [activeTab]);

    useEffect(() => {
        filterEmployees();
    }, [employees, searchTerm]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'active' ? '/api/users/active' : '/api/users/inactive';
            const response = await fetch(`http://localhost:5000${endpoint}`);
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterEmployees = () => {
        if (!searchTerm) {
            setFilteredEmployees(employees);
        } else {
            const filtered = employees.filter(employee =>
                employee.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEmployees(filtered);
        }
    };

    const calculateYearsOfService = (dateOfJoining) => {
        if (!dateOfJoining) return 'N/A';
        const joinDate = new Date(dateOfJoining);
        const today = new Date();
        const years = today.getFullYear() - joinDate.getFullYear();
        const months = today.getMonth() - joinDate.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < joinDate.getDate())) {
            return years - 1;
        }
        return years;
    };

    const handleViewEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowModal(true);
    };

    const handleFireEmployee = async () => {
        if (!fireReason.trim()) {
            alert('Please enter a reason for firing.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/users/${selectedEmployee._id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'fired',
                    reason: fireReason,
                }),
            });

            if (response.ok) {
                addActivity(`Employee ${selectedEmployee.fullName} was fired`, 'employee');
                setShowModal(false);
                fetchEmployees();
            } else {
                alert('Failed to fire employee.');
            }
        } catch (error) {
            console.error('Error firing employee:', error);
            alert('Error firing employee.');
        }
    };

    const handleApproveResignation = async () => {
        if (!resignationReason.trim()) {
            alert('Please enter the resignation reason.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('status', 'resigned');
            formData.append('reason', resignationReason);
            if (resignationLetter) {
                formData.append('resignationLetter', resignationLetter);
            }

            const response = await fetch(`http://localhost:5000/api/users/${selectedEmployee._id}/status`, {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                addActivity(`Resignation approved for ${selectedEmployee.fullName}`, 'employee');
                setShowModal(false);
                fetchEmployees();
            } else {
                alert('Failed to approve resignation.');
            }
        } catch (error) {
            console.error('Error approving resignation:', error);
            alert('Error approving resignation.');
        }
    };

    // New handlers for enhanced modal
    const handleEditField = (field) => {
        setEditingFields(prev => ({ ...prev, [field]: true }));
        setEditedValues(prev => ({ ...prev, [field]: selectedEmployee[field] || '' }));
    };

    const handleSaveField = (field) => {
        // In a real app, this would save to backend
        console.log(`Saving ${field}: ${editedValues[field]}`);
        setEditingFields(prev => ({ ...prev, [field]: false }));
        // Update selectedEmployee for display
        setSelectedEmployee(prev => ({ ...prev, [field]: editedValues[field] }));
        addActivity(`Field ${field} updated for ${selectedEmployee.fullName}`, 'employee');
    };

    const handleCancelEdit = (field) => {
        setEditingFields(prev => ({ ...prev, [field]: false }));
        setEditedValues(prev => ({ ...prev, [field]: selectedEmployee[field] || '' }));
    };

    const handleOpenSubModal = (modalType) => {
        setShowSubModal(modalType);
        if (modalType === 'generateLetter') {
            setLetterTemplate(`Experience Letter Template for ${selectedEmployee.fullName}\n\nDear ${selectedEmployee.fullName},\n\nThis is to certify that ${selectedEmployee.fullName} has been employed with our company from ${selectedEmployee.dateOfJoining ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString() : 'N/A'} to [End Date].\n\nDuring their tenure, they served as ${selectedEmployee.position || 'N/A'} in the ${selectedEmployee.department || 'N/A'} department.\n\nWe wish them the best in their future endeavors.\n\nSincerely,\nHR Department`);
        }
    };

    const handleCloseSubModal = () => {
        setShowSubModal(null);
        setAssignProjectData({ projectName: '', startDate: '', endDate: '', description: '' });
        setManageCredentialsData({ username: '', password: '', role: '' });
        setLetterTemplate('');
    };

    const handleSendLetter = () => {
        // Simulate sending email with PDF
        addActivity(`Experience letter sent to ${selectedEmployee.email}`, 'employee');
        alert('Experience letter sent successfully!');
        handleCloseSubModal();
    };

    const handleAssignProject = () => {
        if (!assignProjectData.projectName.trim()) {
            alert('Please enter project name.');
            return;
        }
        addActivity(`Project "${assignProjectData.projectName}" assigned to ${selectedEmployee.fullName}`, 'employee');
        alert('Project assigned successfully!');
        handleCloseSubModal();
    };

    const handleManageCredentials = () => {
        if (!manageCredentialsData.username.trim() || !manageCredentialsData.password.trim()) {
            alert('Please enter username and password.');
            return;
        }
        addActivity(`Credentials updated for ${selectedEmployee.fullName}`, 'employee');
        alert('Credentials managed successfully!');
        handleCloseSubModal();
    };

    const handleAcceptEdits = () => {
        // Accept pending edits
        setSelectedEmployee(prev => ({ ...prev, ...pendingEdits }));
        addActivity(`Personal details accepted for ${selectedEmployee.fullName}`, 'employee');
        alert('Edits accepted successfully!');
    };

    const handleRejectEdits = () => {
        addActivity(`Personal details rejected for ${selectedEmployee.fullName}`, 'employee');
        alert('Edits rejected.');
    };

    const handleAcceptResignation = () => {
        addActivity(`Resignation accepted for ${selectedEmployee.fullName}`, 'employee');
        alert('Resignation accepted successfully!');
    };

    const handleRejectResignation = () => {
        addActivity(`Resignation rejected for ${selectedEmployee.fullName}`, 'employee');
        alert('Resignation rejected.');
    };

    const handleAction = (action) => {
        switch (action) {
            case 'generateLetter':
                handleOpenSubModal('generateLetter');
                break;
            case 'assignProject':
                handleOpenSubModal('assignProject');
                break;
            case 'manageCredentials':
                handleOpenSubModal('manageCredentials');
                break;
            case 'acceptEdits':
                handleAcceptEdits();
                break;
            default:
                break;
        }
    };

    return (
        <div className="employee-management">
            <h1>Employee Management</h1>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={activeTab === 'active' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('active')}
                >
                    Active Employees
                </button>
                <button
                    className={activeTab === 'inactive' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('inactive')}
                >
                    Inactive Employees
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Employee Table */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="table-container">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Employee ID</th>
                                <th>Department</th>
                                <th>Position</th>
                                <th>Years of Service</th>
                                {activeTab === 'inactive' && <th>Status</th>}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(employee => (
                                <tr key={employee._id}>
                                    <td>{employee.fullName}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.employeeId || 'N/A'}</td>
                                    <td>{employee.department || 'N/A'}</td>
                                    <td>{employee.position || 'N/A'}</td>
                                    <td>{calculateYearsOfService(employee.dateOfJoining)}</td>
                                    {activeTab === 'inactive' && <td>{employee.status}</td>}
                                    <td>
                                        <button
                                            className="view-btn"
                                            onClick={() => handleViewEmployee(employee)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Employee Details Modal */}
            {showModal && selectedEmployee && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Employee Details</h2>
                        <div className="employee-details">
                            {/* Personal Information Section */}
                            <div className="personal-info">
                                <h3>Personal Information</h3>
                                <div className="field">
                                    <label>Full Name:</label>
                                    {editingFields.fullName ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editedValues.fullName || ''}
                                                onChange={(e) => setEditedValues(prev => ({ ...prev, fullName: e.target.value }))}
                                                className="value editing"
                                            />
                                            <button onClick={() => handleSaveField('fullName')}>Save</button>
                                            <button onClick={() => handleCancelEdit('fullName')}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="value">{selectedEmployee.fullName}</span>
                                            <button onClick={() => handleEditField('fullName')}>Edit</button>
                                        </>
                                    )}
                                </div>

                                <div className="field">
                                    <label>Email:</label>
                                    {editingFields.email ? (
                                        <>
                                            <input
                                                type="email"
                                                value={editedValues.email || ''}
                                                onChange={(e) => setEditedValues(prev => ({ ...prev, email: e.target.value }))}
                                                className="value editing"
                                            />
                                            <button onClick={() => handleSaveField('email')}>Save</button>
                                            <button onClick={() => handleCancelEdit('email')}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="value">{selectedEmployee.email}</span>
                                            <button onClick={() => handleEditField('email')}>Edit</button>
                                        </>
                                    )}
                                </div>

                                <div className="field">
                                    <label>Phone Number:</label>
                                    {editingFields.phoneNumber ? (
                                        <>
                                            <input
                                                type="tel"
                                                value={editedValues.phoneNumber || ''}
                                                onChange={(e) => setEditedValues(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                                className="value editing"
                                            />
                                            <button onClick={() => handleSaveField('phoneNumber')}>Save</button>
                                            <button onClick={() => handleCancelEdit('phoneNumber')}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="value">{selectedEmployee.phoneNumber || 'N/A'}</span>
                                            <button onClick={() => handleEditField('phoneNumber')}>Edit</button>
                                        </>
                                    )}
                                </div>

                                <div className="field">
                                    <label>Date of Birth:</label>
                                    <span className="value">{selectedEmployee.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Gender:</label>
                                    <span className="value">{selectedEmployee.gender || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>PAN Number:</label>
                                    <span className="value">{selectedEmployee.panNumber || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Aadhar Number:</label>
                                    <span className="value">{selectedEmployee.aadharNumber || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Current Address:</label>
                                    <span className="value">{selectedEmployee.currentAddress || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Permanent Address:</label>
                                    <span className="value">{selectedEmployee.permanentAddress || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Profile Picture:</label>
                                    <span className="value">{selectedEmployee.profilePictureUrl ? <img src={selectedEmployee.profilePictureUrl} alt="Profile" style={{width: '50px', height: '50px'}} /> : 'N/A'}</span>
                                </div>
                            </div>

                            {/* Family Information Section */}
                            <div className="section">
                                <h3>Family Information</h3>
                                <div className="field">
                                    <label>Father's Name:</label>
                                    <span className="value">{selectedEmployee.fatherName || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Father's DOB:</label>
                                    <span className="value">{selectedEmployee.fatherDob ? new Date(selectedEmployee.fatherDob).toLocaleDateString() : 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Father's Mobile:</label>
                                    <span className="value">{selectedEmployee.fatherMobile || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Mother's Name:</label>
                                    <span className="value">{selectedEmployee.motherName || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Mother's DOB:</label>
                                    <span className="value">{selectedEmployee.motherDob ? new Date(selectedEmployee.motherDob).toLocaleDateString() : 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Mother's Mobile:</label>
                                    <span className="value">{selectedEmployee.motherMobile || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Employment Information Section */}
                            <div className="section">
                                <h3>Employment Information</h3>
                                <div className="field">
                                    <label>Employee ID:</label>
                                    <span className="value">{selectedEmployee.employeeId || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Role:</label>
                                    <span className="value">{selectedEmployee.role || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Department:</label>
                                    {editingFields.department ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editedValues.department || ''}
                                                onChange={(e) => setEditedValues(prev => ({ ...prev, department: e.target.value }))}
                                                className="value editing"
                                            />
                                            <button onClick={() => handleSaveField('department')}>Save</button>
                                            <button onClick={() => handleCancelEdit('department')}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="value">{selectedEmployee.department || 'N/A'}</span>
                                            <button onClick={() => handleEditField('department')}>Edit</button>
                                        </>
                                    )}
                                </div>

                                <div className="field">
                                    <label>Position:</label>
                                    {editingFields.position ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editedValues.position || ''}
                                                onChange={(e) => setEditedValues(prev => ({ ...prev, position: e.target.value }))}
                                                className="value editing"
                                            />
                                            <button onClick={() => handleSaveField('position')}>Save</button>
                                            <button onClick={() => handleCancelEdit('position')}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="value">{selectedEmployee.position || 'N/A'}</span>
                                            <button onClick={() => handleEditField('position')}>Edit</button>
                                        </>
                                    )}
                                </div>

                                <div className="field">
                                    <label>Date of Joining:</label>
                                    <span className="value">{selectedEmployee.dateOfJoining ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString() : 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Years of Service:</label>
                                    <span className="value">{calculateYearsOfService(selectedEmployee.dateOfJoining)}</span>
                                </div>

                                <div className="field">
                                    <label>Zone:</label>
                                    <span className="value">{selectedEmployee.zone || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Region:</label>
                                    <span className="value">{selectedEmployee.region || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Reporting Hierarchy Section */}
                            <div className="section">
                                <h3>Reporting Hierarchy</h3>
                                <div className="field">
                                    <label>Reporting HR:</label>
                                    <span className="value">{selectedEmployee.reporting_hr || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Reporting FO:</label>
                                    <span className="value">{selectedEmployee.reporting_fo || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Reporting Zonal Head:</label>
                                    <span className="value">{selectedEmployee.reporting_zonalHead || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Reporting Regional Head:</label>
                                    <span className="value">{selectedEmployee.reporting_regionalHead || 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>Reporting CEO:</label>
                                    <span className="value">{selectedEmployee.reporting_ceo || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="section">
                                <h3>Documents</h3>
                                <div className="field">
                                    <label>Aadhar File:</label>
                                    <span className="value">{selectedEmployee.aadharFilePath ? <a href={selectedEmployee.aadharFilePath} target="_blank" rel="noopener noreferrer">View Aadhar</a> : 'N/A'}</span>
                                </div>

                                <div className="field">
                                    <label>PAN File:</label>
                                    <span className="value">{selectedEmployee.panFilePath ? <a href={selectedEmployee.panFilePath} target="_blank" rel="noopener noreferrer">View PAN</a> : 'N/A'}</span>
                                </div>
                            </div>

                            {/* Status Information */}
                            {activeTab === 'inactive' && (
                                <div className="section">
                                    <h3>Status Information</h3>
                                    <div className="field">
                                        <label>Status:</label>
                                        <span className="value">{selectedEmployee.status}</span>
                                    </div>
                                    <div className="field">
                                        <label>Reason:</label>
                                        <span className="value">{selectedEmployee.reason || 'N/A'}</span>
                                    </div>
                                    <div className="field">
                                        <label>Resignation Letter:</label>
                                        <span className="value">{selectedEmployee.resignationLetter ? <a href={selectedEmployee.resignationLetter} target="_blank" rel="noopener noreferrer">View Letter</a> : 'N/A'}</span>
                                    </div>
                                </div>
                            )}

                            {/* Pending Edits Review */}
                            {activeTab === 'active' && (
                                <div className="review-section">
                                    <h3>Pending Personal Detail Edits</h3>
                                    <div className="changes">
                                        <p><strong>New Name:</strong> {pendingEdits.fullName}</p>
                                        <p><strong>New Email:</strong> {pendingEdits.email}</p>
                                        <p><strong>New Phone:</strong> {pendingEdits.phoneNumber}</p>
                                    </div>
                                    <div className="buttons">
                                        <button onClick={handleAcceptEdits} className="accept-btn">Accept</button>
                                        <button onClick={handleRejectEdits} className="reject-btn">Reject</button>
                                    </div>
                                </div>
                            )}

                            {/* Pending Resignation Review */}
                            {activeTab === 'active' && (
                                <div className="review-section">
                                    <h3>Pending Resignation</h3>
                                    <div className="changes">
                                        <p><strong>Reason:</strong> {pendingResignation.reason}</p>
                                        <p><strong>Resignation Letter:</strong></p>
                                        <textarea readOnly value={pendingResignation.letter} />
                                    </div>
                                    <div className="buttons">
                                        <button onClick={handleAcceptResignation} className="accept-btn">Accept</button>
                                        <button onClick={handleRejectResignation} className="reject-btn">Reject</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            {activeTab === 'active' && (
                                <>
                                    <button onClick={() => handleAction('generateLetter')}>Generate Experience Letter</button>
                                    <button onClick={() => handleAction('assignProject')}>Assign Project</button>
                                    <button onClick={() => handleAction('manageCredentials')}>Manage Credentials</button>
                                    <button onClick={() => handleAction('acceptEdits')}>Accept Personal Detail Edits</button>

                                    {/* Fire Employee Section */}
                                    <div className="fire-section">
                                        <h3>Fire Employee</h3>
                                        <textarea
                                            placeholder="Enter reason for firing..."
                                            value={fireReason}
                                            onChange={(e) => setFireReason(e.target.value)}
                                        />
                                        <button onClick={handleFireEmployee} className="fire-btn">Fire Employee</button>
                                    </div>

                                    {/* Approve Resignation Section */}
                                    <div className="resignation-section">
                                        <h3>Approve Resignation</h3>
                                        <textarea
                                            placeholder="Enter resignation reason..."
                                            value={resignationReason}
                                            onChange={(e) => setResignationReason(e.target.value)}
                                        />
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => setResignationLetter(e.target.files[0])}
                                        />
                                        <button onClick={handleApproveResignation} className="approve-btn">Approve Resignation</button>
                                    </div>
                                </>
                            )}
                        </div>

                        <button onClick={() => setShowModal(false)} className="close-btn">Close</button>
                    </div>

                    {/* Sub-modals */}
                    {showSubModal === 'generateLetter' && (
                        <div className="sub-modal">
                            <h3>Generate Experience Letter</h3>
                            <div className="form-group">
                                <label>Letter Template:</label>
                                <textarea value={letterTemplate} onChange={(e) => setLetterTemplate(e.target.value)} />
                            </div>
                            <div className="buttons">
                                <button onClick={handleSendLetter} className="send-btn">Send Letter</button>
                                <button onClick={handleCloseSubModal} className="close-btn">Close</button>
                            </div>
                        </div>
                    )}

                    {showSubModal === 'assignProject' && (
                        <div className="sub-modal">
                            <h3>Assign Project</h3>
                            <div className="form-group">
                                <label>Project Name:</label>
                                <input
                                    type="text"
                                    value={assignProjectData.projectName}
                                    onChange={(e) => setAssignProjectData(prev => ({ ...prev, projectName: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Start Date:</label>
                                <input
                                    type="date"
                                    value={assignProjectData.startDate}
                                    onChange={(e) => setAssignProjectData(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date:</label>
                                <input
                                    type="date"
                                    value={assignProjectData.endDate}
                                    onChange={(e) => setAssignProjectData(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description:</label>
                                <textarea
                                    value={assignProjectData.description}
                                    onChange={(e) => setAssignProjectData(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                            <div className="buttons">
                                <button onClick={handleAssignProject} className="send-btn">Assign Project</button>
                                <button onClick={handleCloseSubModal} className="close-btn">Close</button>
                            </div>
                        </div>
                    )}

                    {showSubModal === 'manageCredentials' && (
                        <div className="sub-modal">
                            <h3>Manage Credentials</h3>
                            <div className="form-group">
                                <label>Username:</label>
                                <input
                                    type="text"
                                    value={manageCredentialsData.username}
                                    onChange={(e) => setManageCredentialsData(prev => ({ ...prev, username: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    value={manageCredentialsData.password}
                                    onChange={(e) => setManageCredentialsData(prev => ({ ...prev, password: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role:</label>
                                <select
                                    value={manageCredentialsData.role}
                                    onChange={(e) => setManageCredentialsData(prev => ({ ...prev, role: e.target.value }))}
                                >
                                    <option value="">Select Role</option>
                                    <option value="employee">Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="buttons">
                                <button onClick={handleManageCredentials} className="send-btn">Update Credentials</button>
                                <button onClick={handleCloseSubModal} className="close-btn">Close</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Employee_Management;

import React, { useState, useEffect } from 'react';
import { useEmployeeAuth } from './EmployeeAuthContext';
import '../../Stylesheets/EmployeeProfile.css';

const EmployeeProfile = () => {
    const { employee } = useEmployeeAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (employee) {
            setFormData({
                fullName: employee.fullName || '',
                email: employee.email || '',
                phoneNumber: employee.phoneNumber || '',
                currentAddress: employee.currentAddress || '',
                permanentAddress: employee.permanentAddress || '',
            });
        }
    }, [employee]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/users/profile-edit-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId: employee._id,
                    requestedChanges: formData,
                    reason: 'Employee profile update request'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Profile edit request submitted successfully. HR will review your request.');
                setIsEditing(false);
            } else {
                setMessage(data.message || 'Failed to submit request.');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            setMessage('Network error. Please try again.');
        }

        setIsSubmitting(false);
    };

    if (!employee) {
        return <div>Loading...</div>;
    }

    return (
        <div className="employee-profile">
            <h2>My Profile</h2>

            {message && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            <div className="profile-info">
                <div className="info-section">
                    <h3>Personal Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Employee ID:</label>
                            <span>{employee.employeeId}</span>
                        </div>
                        <div className="info-item">
                            <label>Full Name:</label>
                            <span>{employee.fullName}</span>
                        </div>
                        <div className="info-item">
                            <label>Email:</label>
                            <span>{employee.email}</span>
                        </div>
                        <div className="info-item">
                            <label>Phone:</label>
                            <span>{employee.phoneNumber}</span>
                        </div>
                        <div className="info-item">
                            <label>Department:</label>
                            <span>{employee.department}</span>
                        </div>
                        <div className="info-item">
                            <label>Position:</label>
                            <span>{employee.position}</span>
                        </div>
                        <div className="info-item">
                            <label>Date of Joining:</label>
                            <span>{employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <label>Leave Balance:</label>
                            <span>{employee.leaveBalance} days</span>
                        </div>
                    </div>
                </div>

                <div className="info-section">
                    <h3>Address Information</h3>
                    <div className="info-grid">
                        <div className="info-item full-width">
                            <label>Current Address:</label>
                            <span>{employee.currentAddress || 'Not provided'}</span>
                        </div>
                        <div className="info-item full-width">
                            <label>Permanent Address:</label>
                            <span>{employee.permanentAddress || 'Not provided'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-actions">
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="edit-btn"
                >
                    {isEditing ? 'Cancel Edit' : 'Request Profile Update'}
                </button>
            </div>

            {isEditing && (
                <div className="edit-form-container">
                    <h3>Request Profile Changes</h3>
                    <p>Submit your requested changes. HR will review and approve them.</p>
                    <form onSubmit={handleSubmitRequest}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="fullName">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phoneNumber">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="currentAddress">Current Address</label>
                                <textarea
                                    id="currentAddress"
                                    name="currentAddress"
                                    value={formData.currentAddress}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="permanentAddress">Permanent Address</label>
                                <textarea
                                    id="permanentAddress"
                                    name="permanentAddress"
                                    value={formData.permanentAddress}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EmployeeProfile;

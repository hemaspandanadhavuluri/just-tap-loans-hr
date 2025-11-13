import React, { useState, useEffect } from 'react';
import { useEmployeeAuth } from './EmployeeAuthContext';
import '../../Stylesheets/EmployeeAttendance.css';

const EmployeeAttendance = () => {
    const { employee } = useEmployeeAuth();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentAttendance, setCurrentAttendance] = useState(null);
    const [exemptionMinutes, setExemptionMinutes] = useState(60);
    const [error, setError] = useState(null);

    const fetchEmployeeAttendance = async () => {
        if (!employee?._id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/attendance/employee/${employee._id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch attendance data.');
            }
            const data = await response.json();
            // set full attendance history
            setAttendanceRecords(data);

            // If there is no record for the selected date, create a default 'absent' record for display
            const todayIso = selectedDate; // e.g. '2025-10-29'
            const hasToday = data.some(record => {
                try {
                    return new Date(record.date).toISOString().split('T')[0] === todayIso;
                } catch (e) { return false; }
            });

            if (!hasToday) {
                const defaultRecord = {
                    _id: null,
                    employeeId: {
                        _id: employee._id,
                        fullName: employee.fullName,
                        email: employee.email
                    },
                    date: new Date(todayIso),
                    checkInTime: null,
                    checkOutTime: null,
                    status: 'absent',
                    isLate: false,
                    lateMinutes: 0,
                    workHours: 0
                };

                // Prepend default to attendanceRecords so filtered view shows it
                setAttendanceRecords(prev => [defaultRecord, ...prev]);
                setCurrentAttendance(defaultRecord);
            }

            // Calculate remaining exemption minutes for the current month
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyRecords = data.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
            });
            const usedMinutes = monthlyRecords.reduce((sum, record) => sum + (record.lateMinutes || 0), 0);
            setExemptionMinutes(Math.max(0, 60 - usedMinutes));

            // Find today's attendance record using local date comparison to avoid timezone mismatch
            const toYMD = (d) => {
                const dt = new Date(d);
                const y = dt.getFullYear();
                const m = String(dt.getMonth() + 1).padStart(2, '0');
                const dd = String(dt.getDate()).padStart(2, '0');
                return `${y}-${m}-${dd}`;
            };

            const today = new Date();
            const todayYMD = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const todayRecord = data.find(record => toYMD(record.date) === todayYMD || toYMD(record.date) === selectedDate);
            setCurrentAttendance(todayRecord);

        } catch (error) {
            console.error("Error fetching employee attendance:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceAction = async (action) => {
        if (!employee?._id) return;
        try {
            const now = new Date().toISOString();
            const payload = {
                employeeId: employee._id,
                [action === 'check-in' ? 'checkInTime' : 'checkOutTime']: now
            };

            const response = await fetch('http://localhost:5000/api/attendance/mark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                // Refresh data and user details (deductions/additions may have changed)
                fetchEmployeeAttendance(); // Refresh data
                fetchUserDetails();
            } else {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || `Error marking ${action}.`);
            }
        } catch (error) {
            console.error(`Error marking ${action}:`, error);
            setError(`Server error during ${action}.`);
        }
    };

    useEffect(() => {
        fetchEmployeeAttendance();
        fetchUserDetails();
    }, [employee]);

    // Fetch latest user info (deductions/additions/salary) from backend
    const fetchUserDetails = async () => {
        if (!employee?._id) return;
        try {
            const resp = await fetch('http://localhost:5000/api/users/active');
            if (!resp.ok) return;
            const users = await resp.json();
            const found = users.find(u => u._id === employee._id || u._id === (employee && employee._id));
            if (found) {
                // Update local currentAttendance related summary if needed
                // We don't overwrite auth context here - just update derived UI fields
                // For example if backend updated monthlyLateMinutes, deductions/additions
                setExemptionMinutes(Math.max(0, 60 - (found.monthlyLateMinutes || 0)));
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return '#4CAF50';
            case 'absent': return '#F44336';
            case 'late': return '#FF9800';
            case 'half-day': return '#FF5722';
            default: return '#9E9E9E';
        }
    };

    const filteredRecords = attendanceRecords.filter(record => {
        const dt = new Date(record.date);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        const recordYMD = `${y}-${m}-${dd}`;
        return recordYMD === selectedDate;
    });

    if (!employee) {
        return <div className="loading">Loading... Please log in to view attendance data.</div>;
    }

    console.log('Employee:', employee);
    console.log('Attendance Records:', attendanceRecords);

    return (
        <div className="employee-attendance-container">
            <h1>Your Attendance</h1>
            {error && <div className="error-message">{error}</div>}

            <div className="attendance-summary">
                <div className="exemption-card">
                    <div className="exemption-icon">🛡️</div>
                    <div className="exemption-content">
                        <h3>{exemptionMinutes} minutes</h3>
                        <p>Monthly Exemption Remaining</p>
                        <small>Late arrivals are deducted from this exemption</small>
                    </div>
                </div>

                <div className="attendance-actions">
                    <button
                        className="action-btn check-in"
                        onClick={() => handleAttendanceAction('check-in')}
                        disabled={currentAttendance?.checkInTime}
                    >
                        {currentAttendance?.checkInTime ? 'Already Checked In' : 'Check In'}
                    </button>
                    <button
                        className="action-btn check-out"
                        onClick={() => handleAttendanceAction('check-out')}
                        disabled={!currentAttendance?.checkInTime || currentAttendance?.checkOutTime}
                    >
                        {currentAttendance?.checkOutTime ? 'Already Checked Out' : 'Check Out'}
                    </button>
                </div>
            </div>

            <div className="date-selector">
                <label htmlFor="date-picker">Select Date:</label>
                <input
                    type="date"
                    id="date-picker"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="date-input"
                />
            </div>

            {loading ? (
                <div className="loading">Loading attendance records...</div>
            ) : (
                <div className="attendance-table-container">
                    <h2>Attendance Records - {formatDate(selectedDate)}</h2>
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Total Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                                <tr key={record._id}>
                                    <td>{formatDate(record.date)}</td>
                                    <td>{formatTime(record.checkInTime)}</td>
                                    <td>{formatTime(record.checkOutTime)}</td>
                                    <td>{record.workHours ? `${record.workHours.toFixed(2)}h` : '-'}</td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(record.status) }}
                                        >
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>
                                        No records for this date.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EmployeeAttendance;

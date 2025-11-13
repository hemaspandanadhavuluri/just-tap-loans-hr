import React, { useState, useEffect, useContext } from 'react';
import { useEmployeeAuth } from './EmployeeAuthContext';
import '../../Stylesheets/Attendance_Time_Tracking.css';

const Attendance_Time_Tracking = () => {
    const { employee } = useEmployeeAuth();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        present: 0,
        absent: 0,
        late: 0
    });
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [employeeAttendance, setEmployeeAttendance] = useState([]);
    const [exemptionMinutes, setExemptionMinutes] = useState(60);
    const [currentAttendance, setCurrentAttendance] = useState(null);

    // Fetch stats for HR view
    const fetchStats = async (date) => {
        try {
            const response = await fetch(`http://localhost:5000/api/attendance/stats?date=${date}`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Fetch attendance records for selected date
    const fetchAttendanceRecords = async (date) => {
        setLoading(true);
        try {
            // Fetch attendance records and active users in parallel so we can show email/name
            const [attResp, usersResp] = await Promise.all([
                fetch(`http://localhost:5000/api/attendance/all?date=${date}`),
                fetch('http://localhost:5000/api/users/active')
            ]);

            const [attData, usersData] = await Promise.all([attResp.json(), usersResp.json()]);

            // Build user map by id for quick lookup
            const userMap = new Map();
            if (Array.isArray(usersData)) {
                usersData.forEach(u => userMap.set(u._id.toString(), u));
                // Update totalEmployees in stats to reflect user table
                setStats(prev => ({ ...prev, totalEmployees: usersData.length }));
            }

            let merged = [];

            // If attendance data exists, merge user info into records
            if (Array.isArray(attData) && attData.length > 0) {
                merged = attData.map(record => {
                    try {
                        if (record.employeeId && typeof record.employeeId === 'object') {
                            const id = (record.employeeId._id && record.employeeId._id.toString && record.employeeId._id.toString()) || (record.employeeId.toString && record.employeeId.toString());
                            const user = userMap.get(id);
                            if (user) {
                                record.employeeId.email = record.employeeId.email || user.email;
                                record.employeeId.fullName = record.employeeId.fullName || user.fullName;
                            }
                        } else if (record.employeeId && typeof record.employeeId === 'string') {
                            const user = userMap.get(record.employeeId);
                            if (user) {
                                record.employeeId = user;
                            }
                        }
                    } catch (e) {
                        // ignore merge errors
                    }
                    return record;
                });
            } else if (Array.isArray(usersData) && usersData.length > 0) {
                // No attendance records for this date — create default absent rows from users
                merged = usersData.map(u => ({
                    _id: null,
                    employeeId: u,
                    date: new Date(date),
                    checkInTime: null,
                    checkOutTime: null,
                    status: 'absent',
                    isLate: false,
                    lateMinutes: 0,
                    workHours: 0,
                    overtimeHours: 0,
                    notes: null
                }));
            }

            setAttendanceRecords(merged);
        } catch (error) {
            console.error('Error fetching attendance records:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch employee's own attendance records
    const fetchEmployeeAttendance = async () => {
        try {
            if (!employee?._id) return;
            const response = await fetch(`http://localhost:5000/api/attendance/employee/${employee._id}`);
            const data = await response.json();
            setEmployeeAttendance(data);

            // Calculate remaining exemption minutes
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyRecords = data.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
            });

            const usedMinutes = monthlyRecords.reduce((sum, record) => sum + (record.lateMinutes || 0), 0);
            setExemptionMinutes(Math.max(0, 60 - usedMinutes));

            // Check today's attendance
            const today = new Date().toISOString().split('T')[0];
            const todayRecord = data.find(record => record.date.split('T')[0] === today);
            setCurrentAttendance(todayRecord);
        } catch (error) {
            console.error('Error fetching employee attendance:', error);
        }
    };

    // Handle check-in/check-out
    const handleAttendanceAction = async (action) => {
        try {
            const now = new Date().toISOString();
            const payload = {
                employeeId: employee._id,
                [action === 'check-in' ? 'checkInTime' : 'checkOutTime']: now
            };

            const response = await fetch('http://localhost:5000/api/attendance/mark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert(`${action === 'check-in' ? 'Checked in' : 'Checked out'} successfully!`);
                // Refresh both employee attendance and HR data if visible
                fetchEmployeeAttendance(); // Refresh data
                fetchStats(selectedDate);
                fetchAttendanceRecords(selectedDate);
            } else {
                const err = await response.json().catch(() => ({}));
                alert(err.message || 'Error marking attendance');
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            alert('Error marking attendance');
        }
    };

    // Handle date change
    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (employee?.role === 'hr') {
            fetchStats(date);
            fetchAttendanceRecords(date);
        }
    };

    // Manual refresh helper
    const refreshAll = () => {
        fetchStats(selectedDate);
        fetchAttendanceRecords(selectedDate);
    };

    // Auto-poll for HR view so table updates when employees mark attendance
    useEffect(() => {
        if (employee?.role === 'hr') {
            // initial load already done in other effect; start a short polling interval
            const id = setInterval(() => {
                fetchStats(selectedDate);
                fetchAttendanceRecords(selectedDate);
            }, 15000); // 15s

            return () => clearInterval(id);
        }
    }, [employee, selectedDate]);

    // (Payroll is handled in the payroll/benefits page)

    useEffect(() => {
        if (employee) {
            if (employee.role === 'hr') {
                fetchStats(selectedDate);
                fetchAttendanceRecords(selectedDate);
            } else {
                fetchEmployeeAttendance();
            }
        }
    }, [employee, selectedDate]);

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
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

    // Always render HR view for this page (separate HR page)
    return (
        <div className="attendance-container">
            <div className="attendance-header">
                <h1>Attendance Time Tracking</h1>
                <div className="date-selector">
                    <label htmlFor="date-picker">Select Date:</label>
                    <input
                        type="date"
                        id="date-picker"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="date-input"
                    />
                </div>
                <div style={{ marginLeft: 12 }}>
                    <button className="request-btn" onClick={refreshAll} style={{ padding: '8px 12px' }}>Refresh</button>
                </div>
            </div>

            {/* (Payroll controls removed - payroll is managed on Payroll/Benefits page) */}

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{stats.totalEmployees}</h3>
                        <p>Total Employees</p>
                    </div>
                </div>
                <div className="stat-card present">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats.present}</h3>
                        <p>Present Today</p>
                    </div>
                </div>
                <div className="stat-card absent">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                        <h3>{stats.absent}</h3>
                        <p>Absent Today</p>
                    </div>
                </div>
                <div className="stat-card late">
                    <div className="stat-icon">⏰</div>
                    <div className="stat-content">
                        <h3>{stats.late}</h3>
                        <p>Late Today</p>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="attendance-table-container">
                <h2>Attendance Records - {formatDate(selectedDate)}</h2>
                {loading ? (
                    <div className="loading">Loading attendance records...</div>
                ) : (
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Date</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Total Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRecords.map((record, index) => (
                                <tr key={index}>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 700 }}>{(record.employeeId && (record.employeeId.fullName || record.employeeId.name)) || (typeof record.employeeId === 'string' ? record.employeeId : 'N/A')}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#666' }}>{(record.employeeId && record.employeeId.email) || ''}</span>
                                        </div>
                                    </td>
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
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Payroll is displayed/managed in the Payroll & Benefits page */}
        </div>
    );
};

export default Attendance_Time_Tracking;

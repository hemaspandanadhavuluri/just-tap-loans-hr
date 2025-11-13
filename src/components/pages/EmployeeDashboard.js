import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeProfile from './EmployeeProfile';
import EmployeeAttendance from './EmployeeAttendance';
import EmployeeLeave from './EmployeeLeave';
import EmployeePayroll from './EmployeePayroll';
import EmployeeTraining from './EmployeeTraining';
import { useEmployeeAuth } from './EmployeeAuthContext';
import '../../Stylesheets/EmployeeDashboard.css';

const EmployeeDashboard = () => {
    const { employee, logout } = useEmployeeAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/employee/login');
    };

    return (
        <div className="employee-dashboard">
            <header className="employee-header">
                <div className="header-left">
                    <h1>Employee Portal</h1>
                </div>
                <div className="header-right">
                    <span>Welcome, {employee?.fullName}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>
            <div className="employee-content">
                <EmployeeSidebar />
                <div className="employee-main">
                    <Routes>
                        <Route path="/" element={<EmployeeProfile />} />
                        <Route path="/profile" element={<EmployeeProfile />} />
                        <Route path="/attendance" element={<EmployeeAttendance />} />
                        <Route path="/leave" element={<EmployeeLeave />} />
                        <Route path="/payroll" element={<EmployeePayroll />} />
                        <Route path="/training" element={<EmployeeTraining />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;

import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../Stylesheets/EmployeeSidebar.css';

const EmployeeSidebar = () => {
    return (
        <div className="employee-sidebar">
            <ul>
                <li>
                    <NavLink
                        to="/employee/dashboard"
                        className={({ isActive }) => isActive ? "active-link" : ""}
                        end
                    >
                        <i className="fas fa-user"></i>
                        Profile
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/employee/dashboard/attendance"
                        className={({ isActive }) => isActive ? "active-link" : ""}
                    >
                        <i className="fas fa-clock"></i>
                        Attendance
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/employee/dashboard/leave"
                        className={({ isActive }) => isActive ? "active-link" : ""}
                    >
                        <i className="fas fa-calendar-alt"></i>
                        Leave
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/employee/dashboard/payroll"
                        className={({ isActive }) => isActive ? "active-link" : ""}
                    >
                        <i className="fas fa-money-bill-wave"></i>
                        Payroll
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/employee/dashboard/training"
                        className={({ isActive }) => isActive ? "active-link" : ""}
                    >
                        <i className="fas fa-graduation-cap"></i>
                        Training
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default EmployeeSidebar;

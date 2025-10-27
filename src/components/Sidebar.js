import React from 'react';
import "../Stylesheets/Sidebar.css";
import { NavLink } from 'react-router-dom'; // For navigation NavLinks

function Sidebar() {
    return (
        <div className="sidebar">
            <ul>
                <li>
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => isActive ? "active-link" : ""}
                        end
                    >Dashboard</NavLink>
                </li>
                <li>
                    <NavLink  className={({ isActive }) => isActive ? "active-link" : ""}
                        end to="/Employee_Management">Employees Management</NavLink>
                </li>
                <li>
                    <NavLink  className={({ isActive }) => isActive ? "active-link" : ""}
                        end to="/Attendance_Time_Tracking">Attendance & Time Tracking</NavLink>
                </li>

                <li>
                    <NavLink  className={({ isActive }) => isActive ? "active-link" : ""}
                        end to="/Leave_Holiday_Management">Leave & Holiday Management</NavLink>
                </li>
                <li>
                    <NavLink className={({ isActive }) => isActive ? "active-link" : ""}
                        end to="/Payroll_Benifits">Payroll & Benifits</NavLink>
                </li>
                <li>
                    <NavLink  className={({ isActive }) => isActive ? "active-link" : ""}
                        end to="/Recruitment">Recruitment & Hiring</NavLink>
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;

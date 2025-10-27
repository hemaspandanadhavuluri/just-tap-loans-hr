import React from 'react';
import '../Stylesheets/Header.css';
import { FaBell, FaQuestionCircle, FaUserCircle } from 'react-icons/fa'; // Notification, Help, Profile icons

function Header() {
    return (
        <header className="app-header">
            <div className="Logo">
                <h2>JustTap</h2>
                <h2>LOANS</h2>
            </div>
            <div className="right-header">
                <h1>HR Management System</h1>
                <div className="icons">
                        <FaBell className="icon" title="Notifications" />
                        <FaQuestionCircle className="icon" title="Help" />
                        <FaUserCircle className="profile-icon" title="Profile"  />
                    </div>
                <div className="User-info">
                    <p>Welcome,</p>
                    <p>John Doe</p>
                    
                </div>
            </div>
        </header>
    )
}

export default Header;

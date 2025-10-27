import React from 'react';
import { useActivity } from './ActivityContext';

function Leave_Holiday_Management() {
    const { addActivity } = useActivity();

    const handleApplyLeave = () => {
        addActivity('Leave application submitted', 'leave');
    };

    const handleApproveLeave = () => {
        addActivity('Leave request approved', 'leave');
    };

    const handleRejectLeave = () => {
        addActivity('Leave request rejected', 'leave');
    };

    return (
        <div>
            <h1>Leave & Holiday Management</h1>
            <p>Manage employee leaves and holidays here.</p>
            <button onClick={handleApplyLeave}>Apply for Leave</button>
            <button onClick={handleApproveLeave}>Approve Leave</button>
            <button onClick={handleRejectLeave}>Reject Leave</button>
        </div>
    );
}

export default Leave_Holiday_Management;

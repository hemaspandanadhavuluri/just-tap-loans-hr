import React from 'react';
import { useActivity } from './ActivityContext';

function Attendance_Time_Tracking() {
    const { addActivity } = useActivity();

    const handleClockIn = () => {
        addActivity('Employee clocked in', 'attendance');
    };

    const handleClockOut = () => {
        addActivity('Employee clocked out', 'attendance');
    };

    const handleMarkAbsent = () => {
        addActivity('Employee marked as absent', 'attendance');
    };

    return (
        <div>
            <h1>Attendance & Time Tracking</h1>
            <p>Track employee attendance and time here.</p>
            <button onClick={handleClockIn}>Clock In</button>
            <button onClick={handleClockOut}>Clock Out</button>
            <button onClick={handleMarkAbsent}>Mark Absent</button>
        </div>
    );
}

export default Attendance_Time_Tracking;

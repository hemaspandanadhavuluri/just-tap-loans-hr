import React from 'react';
import { useActivity } from './ActivityContext';

function Payroll_Benifits() {
    const { addActivity } = useActivity();

    const handleProcessPayroll = () => {
        addActivity('Payroll processed for employees', 'payroll');
    };

    const handleUpdateBenefits = () => {
        addActivity('Employee benefits updated', 'benefits');
    };

    const handleGenerateReport = () => {
        addActivity('Payroll report generated', 'payroll');
    };

    return (
        <div>
            <h1>Payroll & Benefits</h1>
            <p>Manage payroll and employee benefits here.</p>
            <button onClick={handleProcessPayroll}>Process Payroll</button>
            <button onClick={handleUpdateBenefits}>Update Benefits</button>
            <button onClick={handleGenerateReport}>Generate Report</button>
        </div>
    );
}

export default Payroll_Benifits;

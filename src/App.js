import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/pages/Dashboard';
import Employee_Management from './components/pages/Employee_management';
import Attendance_Time_Tracking from './components/pages/Attendance_Time_Tracking';
import Leave_Holiday_Management from './components/pages/Leave_Holiday_Management';
import Payroll_Benifits from './components/pages/Payroll_Benifits';
import PublicJobListings from './components/pages/PublicJobListings';
import OnboardingForm from './components/pages/OnboardingForm';
import OnboardingEdit from './components/pages/OnboardingEdit';
import { RecruitmentProvider } from './components/pages/RecruitmentContext';
import { ActivityProvider } from './components/pages/ActivityContext';
import Recruitment from './components/pages/Recruitment';
import { EmployeeAuthProvider } from './components/pages/EmployeeAuthContext';
import EmployeeLogin from './components/pages/EmployeeLogin';
import EmployeeDashboard from './components/pages/EmployeeDashboard';



function AppContent() {
    const location = useLocation();
    const isPublicPage = location.pathname === '/careers' || location.pathname.startsWith('/employee') || location.pathname === '/onboarding-form' || location.pathname.startsWith('/onboarding/edit');

    return (
        <div className="App">
            {!isPublicPage && <Header />}
            <div className="content">
                {!isPublicPage && <Sidebar />}
                <div className="Routes">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/Employee_Management" element={<Employee_Management/>} />
                        <Route path="/Attendance_Time_Tracking" element={<Attendance_Time_Tracking />} />
                        <Route path="/Leave_Holiday_Management" element={<Leave_Holiday_Management />} />
                        <Route path="/Payroll_Benifits" element={<Payroll_Benifits />} />
                        <Route path="/Recruitment/*" element={<Recruitment />} />
                        <Route path="/careers" element={<PublicJobListings />} />
                        <Route path="/onboarding-form" element={<OnboardingForm />} />
                        <Route path="/onboarding/edit/:id" element={<OnboardingEdit />} />
                        <Route path="/employee/login" element={<EmployeeLogin />} />
                        <Route path="/employee/dashboard/*" element={<EmployeeDashboard />} />
                        <Route path="/employee" element={<Navigate to="/employee/login" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <ActivityProvider>
            <RecruitmentProvider>
                <EmployeeAuthProvider>
                    <Router>
                        <AppContent />
                    </Router>
                </EmployeeAuthProvider>
            </RecruitmentProvider>
        </ActivityProvider>
    );
}

export default App;
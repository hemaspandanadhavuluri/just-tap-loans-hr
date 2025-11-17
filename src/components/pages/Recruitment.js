import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { useRecruitment } from './RecruitmentContext';
import './Recruitment.css';

import RecruitmentDashboard from './RecruitmentDashboard';
import JobPostings from './JobPostings';
import ApplicationsScoring from './ApplicationsScoring';
import InterviewsFeedback from './InterviewsFeedback';
import JobOffers from './JobOffers';
import OnboardingTraining from './OnboardingTraining';

function Recruitment() {
  return (
    <div className="recruitment-page">
      {/* Navbar */}
      <nav class="recruitment-nav">
        <ul>
          <li>
            <NavLink to="/Recruitment" className={({ isActive }) => isActive ? "active" : ""} end>Recruitment Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/Recruitment/Postings" className={({ isActive }) => isActive ? "active" : ""}>Job Postings</NavLink>
          </li>
          <li>
            <NavLink to="/Recruitment/Applications" className={({ isActive }) => isActive ? "active" : ""}>Applications & Scoring</NavLink>
          </li>
          <li>
            <NavLink to="/Recruitment/Interviews" className={({ isActive }) => isActive ? "active" : ""}>Interviews & Feedback</NavLink>
          </li>
          <li>
            <NavLink to="/Recruitment/Offers" className={({ isActive }) => isActive ? "active" : ""}>Job Offers</NavLink>
          </li>
          <li>
            <NavLink to="/Recruitment/Onboarding" className={({ isActive }) => isActive ? "active" : ""}>Onboarding & Training</NavLink>
          </li>
         
        </ul>
      </nav>

      {/* Nested Routes */}
      <Routes>
        <Route path="/" element={<RecruitmentDashboard />} />
        <Route path="/Postings" element={<JobPostings />} />
        <Route path="/Applications" element={<ApplicationsScoring />} />
        <Route path="/Interviews" element={<InterviewsFeedback />} />
        <Route path="/Offers" element={<JobOffers />} />
        <Route path="/Onboarding" element={<OnboardingTraining />} />
      </Routes>
    </div>
  );
}

export default Recruitment;

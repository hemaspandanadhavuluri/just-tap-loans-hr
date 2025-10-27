import React from 'react';
import { useRecruitment } from './RecruitmentContext';
import './../../Stylesheets/RecruitmentDashboard.css';
import { useState, useEffect } from 'react';

function RecruitmentDashboard() {
  const { jobPostings, applications, interviews, offers, candidates } = useRecruitment();
  const [recentActivities, setRecentActivities] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);

  useEffect(() => {
    // Set recent activities from the latest 3 applications
    const latestApplications = applications.slice(0, 3).map(app => ({
      id: app._id,
      name: app.candidateName,
      position: app.position,
      date: new Date(app.appliedDate).toLocaleDateString(),
      status: app.status
    }));
    setRecentActivities(latestApplications);

    // Set top rated candidates from candidates sorted by score descending
    const sortedCandidates = [...candidates].sort((a, b) => b.score - a.score).slice(0, 3).map(candidate => ({
      id: candidate._id,
      name: candidate.name,
      position: candidate.position,
      status: candidate.stage,
      rating: candidate.score
    }));
    setTopCandidates(sortedCandidates);
  }, [applications, candidates]);
  return (
    <div className="recruitment-page">
     
    {/* Stats Section */}
    <div className="stats-section">
      <div className="stat-card blue">
        <h2>{jobPostings.filter(job => job.status === "Active").length}</h2>
        <p>Active Positions</p>
        <small>{jobPostings.filter(job => job.status === "Active").length} active</small>
       
      </div>
      <div className="stat-card purple">
        <h2>{applications.length}</h2>
        <p>Pending Applications</p>
        <small>applied for new positions</small>
      </div>
      <div className="stat-card gold">
        <h2>{interviews.length}</h2>
        <p>Interviews Scheduled</p>
        <small>Next 7 days</small>
      </div>
      <div className="stat-card green">
        <h2>{offers.filter(offer => offer.status === "Pending").length}</h2>
        <p>Offers Extended</p>
        <small>Awaiting Response</small>
      </div>
    </div>

    {/* Recent Activities */}
    <div className="section-content">
      <h2>Recent Activities</h2>
      <ul className="activities-list">
        {recentActivities.length > 0 ? (
          recentActivities.map(activity => (
            <li key={activity.id} className="activity-row">
              <div className="activity-left">
                <h3>{activity.name}</h3>
                <p>{activity.position}</p>
              </div>
              <div className="activity-right">
                <p className="applied-date">Applied: {activity.date}</p>
                <p className="status">Status: {activity.status}</p>
              </div>
            </li>
          ))
        ) : (
          <p>No recent activities available.</p>
        )}
      </ul>
    </div>

    {/* Top Rated Candidates */}
    <div className="section-content">
      <h2>Top Rated Candidates</h2>
      <ul className="top-rated-list">
        {topCandidates.length > 0 ? (
          topCandidates.map(candidate => (
            <li key={candidate.id} className="top-rated-row">
              <div className="left">
                <h3>{candidate.name}</h3>
                <p>{candidate.position}</p>
              </div>
              <div className="middle">
                <p>Status: {candidate.status}</p>
              </div>
              <div className="right">
                <h3>⭐ {candidate.rating}</h3>
              </div>
            </li>
          ))
        ) : (
          <p>No top-rated candidates available.</p>
        )}
      </ul>
    </div>
  </div>
);
};
 

export default RecruitmentDashboard;

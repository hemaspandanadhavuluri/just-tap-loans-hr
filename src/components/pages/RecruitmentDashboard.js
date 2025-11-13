import React from 'react';
import { useRecruitment } from './RecruitmentContext';
import './../../Stylesheets/RecruitmentDashboard.css';
import { useState, useEffect } from 'react';

function RecruitmentDashboard() {
  const { jobPostings, applications, interviews, offers, candidates } = useRecruitment();
  const [recentActivities, setRecentActivities] = useState([]);

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
  </div>
  );
}
 

export default RecruitmentDashboard;

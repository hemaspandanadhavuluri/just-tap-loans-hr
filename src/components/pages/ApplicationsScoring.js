import React, { useState } from "react";
import { useRecruitment } from "./RecruitmentContext";
import { useActivity } from "./ActivityContext";
import "../../Stylesheets/ApplicationsScoring.css";

function ApplicationsScoring() {
  const { applications, updateApplication, interviews } = useRecruitment();
  const { addActivity } = useActivity();
  const [activeTab, setActiveTab] = useState("recent");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredApplications = applications.filter(app => {
    // Exclude completed applications as they are handled in InterviewsFeedback
    if (app.status === "Completed") return false;
    if (activeTab === "recent") return app.status === "Applied";
    if (activeTab === "inprocess") return app.status === "Reviewing" || app.status === "Shortlisted";
    if (activeTab === "rejected") return app.status === "Rejected";
    return false;
  });

  // Open shortlist email modal
  const handleShortlist = () => {
    const defaultContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #1976d2; text-align: center;">Congratulations! You have been Shortlisted</h2>
        <p>Dear ${selectedApplication.candidateName},</p>
        <p>We are pleased to inform you that your application for the position of <strong>${selectedApplication.jobPosting?.title || 'N/A'}</strong> has been shortlisted.</p>
        <p>Please wait for further updates and get ready for the hiring process. The hiring process includes the following steps:</p>
        <ol>
          <li>Phone call interview</li>
          <li>Aptitude test</li>
          <li>Technical test</li>
          <li>Technical interview</li>
          <li>Manager round</li>
          <li>HR round</li>
          <li>Final round</li>
        </ol>
        <p>If you have any questions, please contact our HR team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">This is an automated message from the HR Portal.</p>
      </div>
    `;
    setEmailContent(defaultContent);
    setShowShortlistModal(true);
  };

  // Open reject email modal
  const handleReject = () => {
    const defaultContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #1976d2; text-align: center;">Application Update</h2>
        <p>Dear ${selectedApplication.candidateName},</p>
        <p>Thank you for your interest in the position of <strong>${selectedApplication.jobPosting?.title || 'N/A'}</strong>.</p>
        <p>We regret to inform you that we have decided to move forward with other candidates at this time.</p>
        <p>We appreciate your time and effort in applying for this position. We encourage you to apply for future opportunities that match your qualifications.</p>
        <p>If you have any questions, please contact our HR team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">This is an automated message from the HR Portal.</p>
      </div>
    `;
    setEmailContent(defaultContent);
    setShowRejectModal(true);
  };

  // Send shortlist email
  const sendShortlistEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/applications/send-shortlist-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: selectedApplication.candidateId,
          applicationIndex: selectedApplication.applicationIndex,
          emailContent: emailContent,
        }),
      });

      if (response.ok) {
        // Update application status to Shortlisted
        await updateApplication(selectedApplication.candidateId, selectedApplication.applicationIndex, { status: 'Shortlisted' });
        addActivity(`Shortlisted and emailed: ${selectedApplication.candidateName}`);
        setShowShortlistModal(false);
        setSelectedApplication(null);
      } else {
        alert('Failed to send shortlist email');
      }
    } catch (error) {
      console.error('Error sending shortlist email:', error);
      alert('Error sending email');
    }
    setLoading(false);
  };

  // Send reject email
  const sendRejectEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/applications/send-reject-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: selectedApplication.candidateId,
          applicationIndex: selectedApplication.applicationIndex,
          emailContent: emailContent,
        }),
      });

      if (response.ok) {
        addActivity(`Rejected and emailed: ${selectedApplication.candidateName}`);
        setShowRejectModal(false);
        setSelectedApplication(null);
        // Refresh applications list
        window.location.reload();
      } else {
        alert('Failed to send reject email');
      }
    } catch (error) {
      console.error('Error sending reject email:', error);
      alert('Error sending email');
    }
    setLoading(false);
  };

  return (
    <div className="applications-page">
      <div className="header">
        <h2>Application Management</h2>
      </div>

      {/* Status Boxes */}
      <div className="status-boxes">
        <div className={`status-card ${activeTab === "recent" ? "active" : ""}`} onClick={() => setActiveTab("recent")}>
          <h3>Recent Applications</h3>
          <p>{applications.filter(a => a.status === "Applied").length}</p>
        </div>
        <div className={`status-card ${activeTab === "inprocess" ? "active" : ""}`} onClick={() => setActiveTab("inprocess")}>
          <h3>In-Process Applications</h3>
          <p>{applications.filter(a => a.status === "Reviewing" || a.status === "Shortlisted").length}</p>
        </div>
        <div className={`status-card ${activeTab === "rejected" ? "active" : ""}`} onClick={() => setActiveTab("rejected")}>
          <h3>Rejected Applications</h3>
          <p>{applications.filter(a => a.status === "Rejected").length}</p>
        </div>
      </div>

      {/* Table */}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Experience</th>
            <th>Application Date</th>
            {activeTab !== "recent" && <th>Status</th>}
              {activeTab !== "recent" && <th>Avg Score</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplications.map(app => (
            <tr key={app._id}>
              <td>{app.candidateName}</td>
              <td>{app.jobPosting?.title || 'N/A'}</td>
              <td>{app.experience}</td>
              <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
              {activeTab !== "recent" && <td>{app.status}</td>}
              {activeTab !== "recent" && <td>{(() => {
                // Calculate average score from all interview rounds
                const candidateInterviews = interviews.filter(interview =>
                  interview.application && interview.application.toString() === app.candidateId.toString()
                );
                if (candidateInterviews.length > 0) {
                  const totalScore = candidateInterviews.reduce((sum, interview) => sum + (interview.rating || 0), 0);
                  const avgScore = totalScore / candidateInterviews.length;
                  return avgScore.toFixed(1);
                }
                return app.score || 'N/A';
              })()}</td>}
              <td>
                <button className="btn" onClick={() => setSelectedApplication(app)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* View Modal */}
      {selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setSelectedApplication(null)}>×</span>

            <h3>Candidate Information</h3>
            <div className="info-grid">
              <div><strong>Name:</strong> {selectedApplication.candidateName}</div>
              <div><strong>Email:</strong> {selectedApplication.email}</div>
              <div><strong>Phone:</strong> {selectedApplication.phone}</div>
              <div><strong>Experience:</strong> {selectedApplication.experience}</div>
            </div>

            <h4>Application Details</h4>
            <div className="info-grid">
              <div><strong>Position:</strong> {selectedApplication.jobPosting?.title || 'N/A'}</div>
              <div><strong>Applied Date:</strong> {new Date(selectedApplication.appliedDate).toLocaleDateString()}</div>
              <div><strong>Status:</strong> {selectedApplication.status}</div>
              <div><strong>Score:</strong> {(() => {
                // Calculate average score from all interview rounds
                const candidateInterviews = interviews.filter(interview =>
                  interview.application && interview.application.toString() === selectedApplication.candidateId.toString()
                );
                if (candidateInterviews.length > 0) {
                  const totalScore = candidateInterviews.reduce((sum, interview) => sum + (interview.rating || 0), 0);
                  const avgScore = totalScore / candidateInterviews.length;
                  return avgScore.toFixed(1);
                }
                return selectedApplication.score || 'N/A';
              })()}</div>
            </div>

            <h4>Skills</h4>
            <p>{selectedApplication.skills?.join(', ') || 'N/A'}</p>

            <h4>Cover Letter</h4>
            <p>{selectedApplication.coverLetter || 'N/A'}</p>

            <h4>Resume</h4>
            {selectedApplication.resume ? (
              <a href={`http://localhost:5000/uploads/${selectedApplication.resume.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
                View Resume
              </a>
            ) : (
              <p>No resume uploaded</p>
            )}

            {/* Actions */}
            {selectedApplication.status === "Applied" && (
              <div className="action-buttons">
                <button className="btn" onClick={async () => {
                  await updateApplication(selectedApplication.candidateId, selectedApplication.applicationIndex, { status: 'Reviewing' });
                  addActivity(`Moved to Reviewing: ${selectedApplication.candidateName}`);
                  setSelectedApplication({ ...selectedApplication, status: 'Reviewing' });
                }}>Move to Reviewing</button>
                <button className="btn btn-danger" onClick={handleReject}>Reject</button>
              </div>
            )}

            {selectedApplication.status === "Reviewing" && (
              <div className="action-buttons">
                <button className="btn" onClick={handleShortlist}>Shortlist</button>
                <button className="btn btn-danger" onClick={handleReject}>Reject</button>
              </div>
            )}

            {selectedApplication.status === "Shortlisted" && (
              <div className="action-buttons">
                <button className="btn btn-danger" onClick={handleReject}>Reject</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shortlist Email Modal */}
      {showShortlistModal && (
        <div className="modal-overlay">
          <div className="modal-content email-modal">
            <span className="close-btn" onClick={() => setShowShortlistModal(false)}>×</span>
            <h3>Shortlist Email Template</h3>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              rows="20"
              style={{ width: '100%', padding: '10px', fontFamily: 'monospace' }}
            />
            <div className="action-buttons" style={{ marginTop: '20px' }}>
              <button className="btn" onClick={sendShortlistEmail} disabled={loading}>
                {loading ? 'Sending...' : 'Send Email'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowShortlistModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Email Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content email-modal">
            <span className="close-btn" onClick={() => setShowRejectModal(false)}>×</span>
            <h3>Reject Email Template</h3>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              rows="20"
              style={{ width: '100%', padding: '10px', fontFamily: 'monospace' }}
            />
            <div className="action-buttons" style={{ marginTop: '20px' }}>
              <button className="btn" onClick={sendRejectEmail} disabled={loading}>
                {loading ? 'Sending...' : 'Send Email'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationsScoring;

import React, { useState, useEffect } from 'react';
import '../../Stylesheets/PublicJobListings.css';

function PublicJobListings() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    education: '',
    branch: '',
    coverLetter: '',
    experience: '',
    skills: '',
    resume: null
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  // Fetch active jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/jobs`);
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const allJobs = await response.json();
        // Filter only active jobs
        const activeJobs = allJobs.filter(job => job.status === 'Active');
        setJobs(activeJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      resume: e.target.files[0]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitMessage('');

    try {
      const submitData = new FormData();
      submitData.append('jobPosting', selectedJob._id);
      submitData.append('candidateName', formData.candidateName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('dateOfBirth', formData.dateOfBirth);
      submitData.append('education', formData.education);
      submitData.append('branch', formData.branch);
      submitData.append('coverLetter', formData.coverLetter);
      submitData.append('experience', formData.experience);
      submitData.append('skills', formData.skills);
      if (formData.resume) {
        submitData.append('resume', formData.resume);
      }

      const response = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage('Application submitted successfully!');
        // Reset form
        setFormData({
          candidateName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          education: '',
          branch: '',
          coverLetter: '',
          experience: '',
          skills: '',
          resume: null
        });
        // Close modal after success
        setTimeout(() => {
          setShowApplyModal(false);
          setSubmitMessage('');
        }, 2000);
      } else {
        setSubmitMessage(result.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitMessage('An error occurred while submitting your application');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="public-job-listings loading">Loading job listings...</div>;
  }

  if (error) {
    return <div className="public-job-listings error">Error: {error}</div>;
  }

  return (
    <div className="public-job-listings">
      <header className="careers-header">
        <h1>Join Our Team</h1>
        <p>Discover exciting career opportunities and be part of our growing company.</p>
      </header>

      <div className="jobs-container">
        {jobs.length === 0 ? (
          <div className="no-jobs">
            <h2>No active job openings at the moment</h2>
            <p>Please check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(job => (
              <div key={job._id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="department">{job.department}</span>
                </div>
                <div className="job-details">
                  <p><strong>Employment Type:</strong> {job.employmentType}</p>
                  <p><strong>Experience Level:</strong> {job.experienceLevel}</p>
                  <p><strong>Salary Range:</strong> {job.salaryMin}LPA - {job.salaryMax}LPA</p>
                  <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="job-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => setSelectedJob(job)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && !showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-content job-details-modal">
            <span className="close-btn" onClick={() => setSelectedJob(null)}>×</span>
            <h2>{selectedJob.title}</h2>
            <div className="job-info">
              <p><strong>Department:</strong> {selectedJob.department}</p>
              <p><strong>Employment Type:</strong> {selectedJob.employmentType}</p>
              <p><strong>Experience Level:</strong> {selectedJob.experienceLevel}</p>
              <p><strong>Salary Range:</strong> {selectedJob.salaryMin}LPA - {selectedJob.salaryMax}LPA</p>
              <p><strong>Number of Positions:</strong> {selectedJob.numPostings}</p>
              <p><strong>Application Deadline:</strong> {new Date(selectedJob.endDate).toLocaleDateString()}</p>
            </div>
            <div className="job-description">
              <h3>Job Description</h3>
              <p>{selectedJob.description}</p>
            </div>
            {selectedJob.skills && selectedJob.skills.length > 0 && (
              <div className="job-skills">
                <h3>Required Skills</h3>
                <ul>
                  {selectedJob.skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedJob.benefits && selectedJob.benefits.length > 0 && (
              <div className="job-benefits">
                <h3>Benefits</h3>
                <ul>
                  {selectedJob.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowApplyModal(true)}
              >
                Apply Now
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-content apply-modal">
            <span className="close-btn" onClick={() => setShowApplyModal(false)}>×</span>
            <h2>Apply for {selectedJob.title}</h2>
            <form onSubmit={handleSubmit} className="application-form">
              <div className="form-group">
                <label htmlFor="candidateName">Full Name *</label>
                <input
                  type="text"
                  id="candidateName"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="education">Education</label>
                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                >
                  <option value="">Select Education Level</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="branch">Branch/Stream</label>
                <input
                  type="text"
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Science, Mechanical Engineering"
                />
              </div>
              <div className="form-group">
                <label htmlFor="experience">Years of Experience *</label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 2-3 years"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="skills">Skills (comma-separated)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g., JavaScript, React, Node.js"
                />
              </div>
              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter</label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us why you're interested in this position..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="resume">Resume/CV *</label>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                <small>Accepted formats: PDF, JPG, PNG (max 5MB)</small>
              </div>
              {submitMessage && (
                <div className={`submit-message ${submitMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {submitMessage}
                </div>
              )}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicJobListings;

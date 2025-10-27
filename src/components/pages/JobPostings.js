import React, { useState, useEffect } from "react";
import { useRecruitment } from "./RecruitmentContext";
import { useActivity } from "./ActivityContext";
import "../../Stylesheets/JobPostings.css";

function JobPostings() {
  const {
    jobPostings,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    loading,
    error
  } = useRecruitment();
  const { addActivity } = useActivity();

  const [activeTab, setActiveTab] = useState("active"); // active | draft | closed
  const [departments, setDepartments] = useState(["Engineering", "HR", "Sales"]);
  const [showForm, setShowForm] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [formMode, setFormMode] = useState("create"); // create | edit | view
  const [currentJob, setCurrentJob] = useState(null);
  const [newDepartment, setNewDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    numPostings: 1,
    employmentType: "",
    endDate: "",
    priority: "Medium",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    skills: "",
    benefits: "",
    status: "Draft",
  });

  // 📊 Filter jobs by status
  const filteredJobs = jobPostings.filter(
    (job) => job.status && job.status.toLowerCase() === activeTab
  );

  // 📋 Count summary
  const counts = {
    active: jobPostings.filter((j) => j.status && j.status === "Active").length,
    draft: jobPostings.filter((j) => j.status && j.status === "Draft").length,
    closed: jobPostings.filter((j) => j.status && j.status === "Closed").length,
  };

  // 🧾 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🧱 Actions
  const handleCreate = () => {
    setFormMode("create");
    setFormData({
      title: "",
      department: "",
      numPostings: "",
      employmentType: "",
      endDate: "",
      priority: "Medium",
      experienceLevel: "",
      salaryMin: "",
      salaryMax: "",
      description: "",
      skills: "",
      benefits: "",
      status: "Draft",
      postedDate: new Date().toISOString().split("T")[0],
    });
    setShowForm(true);
  };

  const handleView = (job) => {
    setFormMode("view");
    setCurrentJob(job);
    setFormData(job);
    setShowForm(true);
  };

  const handleEdit = (job) => {
    setFormMode("edit");
    setCurrentJob(job);
    setFormData(job);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const job = jobPostings.find(j => j._id === id);
        await deleteJobPosting(id);
        addActivity(`Deleted job posting: ${job?.title || 'Unknown Job'}`);
        alert('Job posting deleted successfully');
      } catch (error) {
        alert('Error deleting job posting');
      }
    }
  };

  const handlePublish = async (id) => {
    try {
      await updateJobPosting(id, { status: "Active" });
      addActivity(`Published job posting for ${jobPostings.find(j => j._id === id)?.title || 'Unknown Job'}`);
      alert('Job posting published successfully');
    } catch (error) {
      alert('Error publishing job posting');
    }
  };

  const handleClose = async (id) => {
    try {
      await updateJobPosting(id, { status: "Closed" });
      addActivity(`Closed job posting: ${jobPostings.find(j => j._id === id)?.title || 'Unknown Job'}`);
      alert('Job posting closed successfully');
    } catch (error) {
      alert('Error closing job posting');
    }
  };

  // 💾 Save actions
  const handleSaveDraft = async () => {
    if (!formData.title) return alert("Enter Job Title");
    setSubmitting(true);
    try {
      await createJobPosting({ ...formData, status: "Draft" });
      addActivity(`Saved job posting as draft: ${formData.title}`);
      setShowForm(false);
      alert('Job posting saved as draft');
    } catch (error) {
      alert('Error saving job posting');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishNow = async () => {
    if (!formData.title) return alert("Enter Job Title");
    setSubmitting(true);
    try {
      await createJobPosting({ ...formData, status: "Active" });
      addActivity(`Created and published new job posting: ${formData.title}`);
      setShowForm(false);
      alert('Job posting published successfully');
    } catch (error) {
      alert('Error publishing job posting');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await updateJobPosting(currentJob._id, formData);
      addActivity(`Updated job posting: ${formData.title}`);
      setShowForm(false);
      alert('Job posting updated successfully');
    } catch (error) {
      alert('Error updating job posting');
    } finally {
      setSubmitting(false);
    }
  };

  // ➕ Add Department
  const handleAddDepartment = () => {
    if (!newDepartment.trim()) return;
    setDepartments([...departments, newDepartment.trim()]);
    setNewDepartment("");
    setShowDeptModal(false);
  };

  return (
    <div className="job-postings-page">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Job Postings Management</h2>
        <div>
          <button onClick={handleCreate}>Create Posting</button>
          <button onClick={() => setShowDeptModal(true)}>Add Department</button>
        </div>
      </div>

      {/* Summary Boxes */}
      <div className="stats-section">
        <div
          className={`stat-card blue ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          <h2>{counts.active}</h2>
          <p>Active Jobs</p>
        </div>
        <div
          className={`stat-card purple ${activeTab === "draft" ? "active" : ""}`}
          onClick={() => setActiveTab("draft")}
        >
          <h2>{counts.draft}</h2>
          <p>Draft Jobs</p>
        </div>
        <div
          className={`stat-card gold ${activeTab === "closed" ? "active" : ""}`}
          onClick={() => setActiveTab("closed")}
        >
          <h2>{counts.closed}</h2>
          <p>Closed Jobs</p>
        </div>
      </div>

      {/* Table Section */}
      <h3 style={{ marginTop: "16px" }}>
        {activeTab === "active"
          ? "Active Jobs"
          : activeTab === "draft"
          ? "Draft Jobs"
          : "Closed Jobs"}
      </h3>

      <table className="table">
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Department</th>
            <th>Applications</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Posted Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <tr key={job._id}>
                <td>{job.title}</td>
                <td>{job.department}</td>
                <td>{job.numPostings || 0}</td>
                <td>{job.priority}</td>
                <td>{job.status}</td>
                <td>{job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <button onClick={() => handleView(job)}>View</button>
                  {activeTab === "draft" && (
                    <button onClick={() => handlePublish(job._id)}>Publish</button>
                  )}
                  {activeTab === "active" && (
                    <button onClick={() => handleClose(job._id)}>Close</button>
                  )}
                  {activeTab === "closed" && (
                     <button onClick={() => handlePublish(job._id)}>Publish</button>
                  )}
                  <button onClick={() => handleEdit(job)}>Edit</button>
                  <button onClick={() => handleDelete(job._id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No jobs available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🧾 Job Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>
                {formMode === "view"
                  ? "View Job Posting"
                  : formMode === "edit"
                  ? "Edit Job Posting"
                  : "Create Job Posting"}
              </h3>
              <button onClick={() => setShowForm(false)}>❌</button>
            </div>

            {/* Form */}
            <div className="form-section">
              <div>
                <label>Job Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={formMode === "view"}
                />
              </div>

              <div>
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={formMode === "view"}
                >
                  <option value="">Select</option>
                  {departments.map((d, i) => (
                    <option key={i} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>No. of Postings</label>
                <input
                  name="numPostings"
                  value={formData.numPostings}
                  onChange={handleChange}
                  disabled={formMode === "view"}
                />
              </div>

              <div>
                <label>Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  disabled={formMode === "view"}
                >
                  <option value="">Select</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={formMode === "view"}
                />
              </div>

              <div>
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={formMode === "view"}
                >
                  <option>Urgent</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div>
                <label>Experience Level</label>
                <input
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  disabled={formMode === "view"}
                />
              </div>

              <div>
                <label>Salary Range</label>
                <input
                  name="salaryMin"
                  placeholder="Min"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  disabled={formMode === "view"}
                />
                <input
                  name="salaryMax"
                  placeholder="Max"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  disabled={formMode === "view"}
                />
              </div>

              <div>
                <label>Job Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={formMode === "view"}
                />
              </div>

              <div>
                <label>Required Skills</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  disabled={formMode === "view"}
                />
              </div>

              <div>
                <label>Benefits & Perks</label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  disabled={formMode === "view"}
                />
              </div>
            </div>

            {/* Buttons */}
            {formMode === "create" && (
              <div style={{ textAlign: "right" }}>
                <button onClick={() => setShowForm(false)}>Cancel</button>
                <button onClick={handleSaveDraft} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save as Draft'}
                </button>
                <button onClick={handlePublishNow} disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            )}
            {formMode === "edit" && (
              <div style={{ textAlign: "right" }}>
                <button onClick={() => setShowForm(false)}>Cancel</button>
                <button onClick={handleUpdate} disabled={submitting}>
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ➕ Add Department Modal */}
      {showDeptModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Department</h3>
            <input
              placeholder="Department Name"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
            />
            <div style={{ textAlign: "right" }}>
              <button onClick={() => setShowDeptModal(false)}>Cancel</button>
              <button onClick={handleAddDepartment}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobPostings;

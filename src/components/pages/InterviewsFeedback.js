import React, { useState, useMemo, useEffect } from "react";
import { useRecruitment } from "./RecruitmentContext";
import { useActivity } from "./ActivityContext";
import "./../../Stylesheets/InterviewsFeedback.css";

/**
 * InterviewsFeedback.jsx
 * HR Interview & Application Manager (professional, minimal color)
 *
 * Pipeline: Flexible - candidates can have different rounds based on position and requirements.
 * Common rounds: Phone Interview, Aptitude Test, Technical Test, Technical Interview, Manager Round, HR Interview, Final Round
 *
 * Behavior:
 * - Candidate stays In-Process until all scheduled rounds are passed
 * - Fail any round -> Rejected
 * - Schedule step for existing candidates only
 * - Clicking "Schedule Interview" inside View closes View and opens Schedule modal
 * - Feedback entered while marking completed; feedback stored and becomes read-only afterwards
 * - Automated emails sent for interview invitations and feedback
 */

const COMMON_PIPELINE = [
  "Phone Interview",
  "Aptitude Test",
  "Technical Test",
  "Technical Interview",
  "Manager Round",
  "HR Interview",
  "Final Interview",
];

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function startOfWeekDate(d = new Date()) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  date.setHours(0,0,0,0);
  return date;
}

function isoFromDate(d) {
  return new Date(d).toISOString().split("T")[0];
}

let nextAppId = 200;
let nextStepId = 5000;

export default function InterviewsFeedback() {
  const { addActivity } = useActivity();
  const { candidates, interviews, createInterview, updateInterview, updateApplication } = useRecruitment();

  // Transform backend data to component structure
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Filter candidates with interviews scheduled or shortlisted/completed applications
    const candidatesWithInterviewsOrShortlisted = candidates.filter(candidate =>
      interviews.some(interview => interview.application && interview.application.toString() === candidate._id.toString()) ||
      candidate.applications.some(app => app.status === 'Shortlisted' || app.status === 'Completed')
    );

    // Map to applications structure
    const mappedApplications = candidatesWithInterviewsOrShortlisted.map(candidate => {
      // Get the shortlisted application (if exists)
      const shortlistedApp = candidate.applications.find(app => app.status === 'Shortlisted');

      // Map interviews to steps
      const steps = interviews
        .filter(interview => interview.application && (interview.application._id || interview.application).toString() === candidate._id.toString())
        .map(interview => ({
          id: interview._id,
          type: interview.type,
          date: interview.date ? new Date(interview.date).toISOString().split('T')[0] : null,
          time: interview.time,
          duration: "30 mins", // Default, could be added to interview model
          interviewer: interview.interviewer,
          location: "Office", // Default, could be added to interview model
          notes: interview.notes || "",
          score: interview.rating,
          feedback: interview.feedback || "",
          result: interview.status === 'Completed' ? 'Pass' : 'Pending', // Map status to result
          completed: interview.status === 'Completed',
        }));

      return {
        id: candidate._id,
        name: candidate.name,
        dob: candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toISOString().split('T')[0] : "",
        experience: candidate.experience || "",
        education: candidate.education || "",
        position: candidate.position,
        appliedDate: new Date(candidate.appliedDate).toISOString().split('T')[0],
        resume: candidate.resume ? `http://localhost:5000/uploads/${candidate.resume.split('/').pop()}` : "",
        coverLetter: shortlistedApp ? shortlistedApp.coverLetter || "" : "",
        status: candidate.applications.some(app => app.status === 'Completed') ? 'Completed' : 'InProcess', // Map status correctly
        finalDecision: candidate.applications.some(app => app.status === 'Completed') ? 'Selected' : 'Pending',
        steps: steps,
      };
    });

    setApplications(mappedApplications);
  }, [candidates, interviews]);

  // ---------- UI state ----------
  const [activeTab, setActiveTab] = useState("inprocess");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [calendarDayModal, setCalendarDayModal] = useState({ open: false, date: null });

  const [currentApp, setCurrentApp] = useState(null);
  const [editingStepIndex, setEditingStepIndex] = useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    type: COMMON_PIPELINE[0],
    date: todayISO(),
    time: "10:00",
    duration: "30 mins",
    interviewer: "",
    location: "",
    notes: "",
  });

  const [feedbackForm, setFeedbackForm] = useState({
    score: 0,
    result: "Pass",
    feedback: "",
  });

  // ---------- Derived lists ----------
  const inProcessList = useMemo(() => applications.filter((a) => a.status === "Reviewing" || a.status === "InProcess"), [applications]);
  const completedList = useMemo(() => applications.filter((a) => a.status === "Completed"), [applications]);
  const rejectedList = useMemo(() => applications.filter((a) => a.status === "Rejected"), [applications]);

  const allScheduledSteps = useMemo(() =>
    applications.flatMap((a) =>
      a.steps
        .map((s) => ({ ...s, appId: a.id, appName: a.name, position: a.position }))
        .filter((s) => !s.completed && s.date)
    ), [applications]);

  const todaysSteps = allScheduledSteps.filter((s) => s.date === todayISO());

  const weekStart = useMemo(() => startOfWeekDate(new Date()), []);
  const weekDates = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      arr.push(isoFromDate(d));
    }
    return arr;
  }, [weekStart]);

  // ---------- Helpers ----------
  const badgeForStatus = (status) => {
    switch (status) {
      case "Reviewing": return <span className="badge badge-grey">Reviewing</span>;
      case "InProcess": return <span className="badge badge-blue">In Process</span>;
      case "Completed": return <span className="badge badge-green">Completed</span>;
      case "Rejected": return <span className="badge badge-red">Rejected</span>;
      default: return <span className="badge badge-grey">{status}</span>;
    }
  };

  // Determine next pipeline step for a candidate (first pipeline item that is not passed)
  const getNextStage = (app) => {
    for (const stepName of COMMON_PIPELINE) {
      const step = app.steps.find((s) => s.type === stepName);
      if (!step || step.result !== "Pass") {
        return stepName;
      }
    }
    return null; // all passed
  };

  // ---------- Actions ----------

  // open view overlay
  const openView = (app) => {
    setCurrentApp(app);
    setShowViewModal(true);
  };

  // open schedule overlay for existing candidate: close view overlay first (per requirement)
  const openScheduleFor = (app) => {
    // set current app for scheduling
    setCurrentApp(app);
    // prepare schedule form default to next stage for convenience
    const next = getNextStage(app) || COMMON_PIPELINE[0];
    setScheduleForm({
      type: next,
      date: todayISO(),
      time: "10:00",
      duration: "30 mins",
      interviewer: "",
      location: "",
      notes: "",
    });
    // close view and open schedule
    setShowViewModal(false);
    setShowScheduleModal(true);
  };

  // schedule step for app
  const scheduleStep = async (appId) => {
    try {
      const interviewData = {
        application: appId,
        candidateName: currentApp.name,
        position: currentApp.position,
        date: new Date(scheduleForm.date + 'T' + scheduleForm.time),
        time: scheduleForm.time,
        interviewer: scheduleForm.interviewer,
        type: scheduleForm.type,
        notes: scheduleForm.notes,
      };

      await createInterview(interviewData);
      addActivity(`Scheduled ${scheduleForm.type} for ${currentApp.name} on ${scheduleForm.date} at ${scheduleForm.time}`);
      setShowScheduleModal(false);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Failed to schedule interview');
    }
  };

  // open feedback modal to mark step completed
  const openFeedbackForStep = (app, stepIndex) => {
    setCurrentApp(app);
    setEditingStepIndex(stepIndex);
    const s = app.steps[stepIndex];
    setFeedbackForm({
      score: s.score !== null ? s.score : 0,
      result: s.result === "Pending" ? "Pass" : s.result,
      feedback: s.feedback || "",
    });
    setShowFeedbackModal(true);
  };

  // submit feedback -> update step and application status
  const submitFeedback = async () => {
    if (!currentApp || editingStepIndex === null) return;
    const { score, result, feedback } = feedbackForm;
    const clampedScore = Math.min(5, Math.max(0, Number(score) || 0));
    const step = currentApp.steps[editingStepIndex];

    try {
      const updateData = {
        rating: clampedScore,
        feedback: feedback,
        status: result === "Pass" ? "Completed" : "Failed", // Map to backend status
      };

      await updateInterview(step.id, updateData);
      addActivity(`Submitted feedback for ${step.type} of ${currentApp.name}: ${result}`);

      // If final round passed, move to completed and send selection email
      if (step.type === "Final Interview" && result === "Pass") {
        // Find the shortlisted application index
        const candidate = candidates.find(c => c._id === currentApp.id);
        const shortlistedAppIndex = candidate.applications.findIndex(app => app.status === 'Shortlisted');
        if (shortlistedAppIndex !== -1) {
          await updateApplication(candidate._id, shortlistedAppIndex, { status: 'Completed' });
          addActivity(`Candidate ${currentApp.name} moved to Completed after passing final round`);
          // Selection email is sent automatically in the backend when status is set to 'Completed'
        }
      }

      // close modals and reset
      setShowFeedbackModal(false);
      setShowViewModal(false);
      setEditingStepIndex(null);
      setCurrentApp(null);
      setFeedbackForm({ score: 0, result: "Pass", feedback: "" });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    }
  };

  const rejectApplication = (appId) => {
    setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: "Rejected", finalDecision: "Rejected" } : a)));
    setShowViewModal(false);
    setCurrentApp(null);
  };

  const removeStep = (appId, stepId) => {
    setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, steps: a.steps.filter((s) => s.id !== stepId) } : a)));
    if (currentApp && currentApp.id === appId) {
      setCurrentApp((c) => ({ ...c, steps: c.steps.filter((s) => s.id !== stepId) }));
    }
  };

  const openCalendarDay = (date) => {
    setCalendarDayModal({ open: true, date });
  };

  // ---------- Render ----------
  return (
    <div className="if-page">
      <header className="if-header">
        <h1>HR — Interview & Application Manager</h1>
      </header>

      <div className="if-tabs">
        <button className={`tab ${activeTab === "inprocess" ? "active" : ""}`} onClick={() => setActiveTab("inprocess")}>In Process</button>
        <button className={`tab ${activeTab === "completed" ? "active" : ""}`} onClick={() => setActiveTab("completed")}>Completed</button>
        <button className={`tab ${activeTab === "rejected" ? "active" : ""}`} onClick={() => setActiveTab("rejected")}>Rejected</button>
        <button className={`tab ${activeTab === "calendar" ? "active" : ""}`} onClick={() => setActiveTab("calendar")}>Calendar</button>
      </div>

      <div className="if-cards">
        <div className="card small"><div>In Process</div><div className="big-num">{inProcessList.length}</div></div>
        <div className="card small"><div>Today's Interviews</div><div className="big-num">{todaysSteps.length}</div><div className="small-link" onClick={() => setActiveTab("calendar")}>View calendar</div></div>
        <div className="card small"><div>Completed</div><div className="big-num">{completedList.length}</div></div>
        <div className="card small"><div>Rejected</div><div className="big-num">{rejectedList.length}</div></div>
      </div>

      <main className="if-main">
        {activeTab === "inprocess" && (
          <section>
            <h2>In-Process Applications</h2>
            <table className="if-table">
              <thead>
                <tr>
                  <th>Candidate</th><th>Position</th><th>Applied</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inProcessList.length === 0 && <tr><td colSpan="6" className="empty">No in-process applications</td></tr>}
                {inProcessList.map((a) => {
                  const nextStage = getNextStage(a);
                  return (
                    <tr key={a.id}>
                      <td>{a.name}</td>
                      <td>{a.position}</td>
                      <td>{a.appliedDate}</td>
                      <td>{badgeForStatus(a.status)}</td>
                      
                      <td className="actions-td">
                        <button className="btn-small" onClick={() => openView(a)}>View</button>
                        <button className="btn-small" onClick={() => openScheduleFor(a)}>Schedule Interview</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "completed" && (
          <section>
            <h2>Completed (Selected)</h2>
            <table className="if-table">
              <thead><tr><th>Candidate</th><th>Position</th><th>Final Decision</th><th>Actions</th></tr></thead>
              <tbody>
                {completedList.length === 0 && <tr><td colSpan="4" className="empty">No completed applications</td></tr>}
                {completedList.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{a.position}</td>
                    <td className="pass-text">{a.finalDecision}</td>
                    <td><button className="btn-small" onClick={() => openView(a)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "rejected" && (
          <section>
            <h2>Rejected</h2>
            <table className="if-table">
              <thead><tr><th>Candidate</th><th>Position</th><th>Rejected At</th><th>Reason</th><th>Actions</th></tr></thead>
              <tbody>
                {rejectedList.length === 0 && <tr><td colSpan="5" className="empty">No rejected applications</td></tr>}
                {rejectedList.map((a) => {
                  const last = a.steps.length ? a.steps[a.steps.length - 1] : null;
                  return (
                    <tr key={a.id}>
                      <td>{a.name}</td>
                      <td>{a.position}</td>
                      <td>{a.appliedDate}</td>
                      <td>{last ? `${last.type} — ${last.result}` : "-"}</td>
                      <td><button className="btn-small" onClick={() => openView(a)}>View</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "calendar" && (
          <section>
            <h2>Weekly Calendar</h2>
            <div className="calendar-week">
              {weekDates.map((d) => {
                const count = allScheduledSteps.filter((s) => s.date === d).length;
                const isToday = d === todayISO();
                return (
                  <div key={d} className={`calendar-day ${isToday ? "today" : ""}`} onClick={() => openCalendarDay(d)}>
                    <div className="calendar-date">{d}</div>
                    <div className="calendar-count">{count} interview{count !== 1 ? "s" : ""}</div>
                    <div className="calendar-link">Click to view</div>
                  </div>
                );
              })}
            </div>

            <div className="today-list">
              <h3>Today's Interviews — {todayISO()}</h3>
              {todaysSteps.length === 0 && <p className="empty">No interviews scheduled today.</p>}
              {todaysSteps.map((s) => (
                <div key={s.id} className="today-item">
                  <div><strong>{s.time}</strong> — {s.appName} • {s.type}</div>
                  <div>{s.interviewer || "TBD"} • {s.location || "TBD"}</div>
                  <div><button className="btn-small" onClick={() => openView(applications.find(a => a.id === s.appId))}>Open</button></div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ---------- Modals ---------- */}

      {/* Schedule Modal (for existing candidate) */}
      {showScheduleModal && currentApp && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Schedule Step — {currentApp.name}</h3>
            <div className="form-grid">
              <label>Step Type
                <select value={scheduleForm.type} onChange={(e) => setScheduleForm(prev => ({ ...prev, type: e.target.value }))}>
                  {COMMON_PIPELINE.map(p => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label>Date<input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))} /></label>
              <label>Time<input type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))} /></label>
              <label>Duration
                <select value={scheduleForm.duration} onChange={(e) => setScheduleForm(prev => ({ ...prev, duration: e.target.value }))}>
                  <option>30 mins</option><option>45 mins</option><option>60 mins</option>
                </select>
              </label>
              <label>Interviewer<input value={scheduleForm.interviewer} onChange={(e) => setScheduleForm(prev => ({ ...prev, interviewer: e.target.value }))} /></label>
              <label>Location<input value={scheduleForm.location} onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))} /></label>
              <label>Notes<textarea value={scheduleForm.notes} onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))} /></label>
            </div>

            <div className="modal-actions">
              <button className="btn" onClick={() => scheduleStep(currentApp.id)}>Schedule</button>
              <button className="btn btn-secondary" onClick={() => { setShowScheduleModal(false); setCurrentApp(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && currentApp && (
        <div className="modal-overlay">
          <div className="modal-large">
            <header className="modal-header">
              <h3>{currentApp.name} — {currentApp.position}</h3>
              <div className="modal-header-actions">
                {(currentApp.status === "InProcess" || currentApp.status === "Reviewing") && <button className="btn-small" onClick={() => openScheduleFor(currentApp)}>Schedule Interview</button>}
                {currentApp.status !== "Rejected" && <button className="btn-small btn-secondary" onClick={() => rejectApplication(currentApp.id)}>Reject</button>}
                <button className="btn-small" onClick={() => { setShowViewModal(false); setCurrentApp(null); }}>Close</button>
              </div>
            </header>

            <div className="details-grid">
              <div>
                <h4>Personal</h4>
                <p><strong>DOB:</strong> {currentApp.dob || "-"}</p>
                <p><strong>Experience:</strong> {currentApp.experience || "-"}</p>
                <p><strong>Education:</strong> {currentApp.education || "-"}</p>
              </div>
              <div>
                <h4>Application</h4>
                <p><strong>Applied:</strong> {currentApp.appliedDate}</p>
                <p><strong>Status:</strong> {badgeForStatus(currentApp.status)}</p>
                <p><strong>Final Decision:</strong> {currentApp.finalDecision}</p>
                <p><strong>Resume:</strong> {currentApp.resume ? <a href={currentApp.resume} target="_blank" rel="noreferrer">View</a> : "N/A"}</p>
              </div>
            </div>

            <section>
              <h4>Interview Steps</h4>
              <table className="if-table">
                <thead><tr><th>Type</th><th>Date</th><th>Time</th><th>Interviewer</th><th>Result</th><th>Score</th><th>Feedback</th><th>Actions</th></tr></thead>
                <tbody>
                  {currentApp.steps.length === 0 && <tr><td colSpan="8" className="empty">No steps scheduled</td></tr>}
                  {currentApp.steps.map((s, idx) => (
                    <tr key={s.id}>
                      <td>{s.type}</td>
                      <td>{s.date || "-"}</td>
                      <td>{s.time || "-"}</td>
                      <td>{s.interviewer || "-"}</td>
                      <td className={s.result === "Fail" ? "fail-text" : s.result === "Pass" ? "pass-text" : ""}>{s.result}</td>
                      <td>{s.score !== null ? s.score : "-"}</td>
                      <td className="feedback-td">{s.feedback || "-"}</td>
                      <td className="actions-td">
                        {(currentApp.status === "InProcess" || currentApp.status === "Reviewing") && (
                          <>
                            {!s.completed && <button className="btn-small" onClick={() => openFeedbackForStep(currentApp, idx)}>Mark Completed & Add Feedback</button>}
                            <button className="btn-small btn-secondary" onClick={() => removeStep(currentApp.id, s.id)}>Remove</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      )}

      {/* Feedback modal */}
      {showFeedbackModal && currentApp && editingStepIndex !== null && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Feedback — {currentApp.steps[editingStepIndex].type} ({currentApp.name})</h3>
            <div className="form-grid">
              <label>Score (0-5)
                <input type="number" min="0" max="5" value={feedbackForm.score} onChange={(e) => setFeedbackForm(prev => ({ ...prev, score: Math.min(5, Math.max(0, Number(e.target.value) || 0)) }))} />
              </label>
              <label>Result
                <select value={feedbackForm.result} onChange={(e) => setFeedbackForm(prev => ({ ...prev, result: e.target.value }))}>
                  <option>Pass</option>
                  <option>Fail</option>
                </select>
              </label>
              <label>Feedback
                <textarea value={feedbackForm.feedback} onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedback: e.target.value }))} />
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={submitFeedback}>Submit Feedback</button>
              <button className="btn btn-secondary" onClick={() => { setShowFeedbackModal(false); setEditingStepIndex(null); setCurrentApp(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar day modal */}
      {calendarDayModal.open && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Interviews on {calendarDayModal.date}</h3>
            <div>
              {allScheduledSteps.filter((s) => s.date === calendarDayModal.date).length === 0 && <p className="empty">No interviews on this day.</p>}
              {allScheduledSteps.filter((s) => s.date === calendarDayModal.date).map((s) => (
                <div key={s.id} className="today-item">
                  <div><strong>{s.time}</strong> • {s.appName} • {s.type}</div>
                  <div>{s.interviewer || "TBD"} • {s.location || "TBD"}</div>
                  <div><button className="btn-small" onClick={() => openView(applications.find(a => a.id === s.appId))}>Open</button></div>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setCalendarDayModal({ open: false, date: null })}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

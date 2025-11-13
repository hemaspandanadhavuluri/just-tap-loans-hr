import React, { useState, useRef } from 'react';
import { useRecruitment } from './RecruitmentContext';
import { useActivity } from './ActivityContext';
import './../../Stylesheets/JobOffers.css';

function JobOffers() {
  const { offers, createOffer, updateOffer, candidates } = useRecruitment();
  const { addActivity } = useActivity();
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showView, setShowView] = useState(false); // For View modal
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentOffer, setCurrentOffer] = useState(null);
  const letterRef = useRef(null);
  const [newOffer, setNewOffer] = useState({
    candidateName: "", email: "", position: "", salary: "", startDate: "", expiryDate: "",
    employmentType: "Full-time", benefits: "", serviceAgreement: "", hrName: ""
  });

  // Get completed candidates for dropdown
  const completedCandidates = candidates.filter(candidate =>
    candidate.applications.some(app => app.status === 'Completed')
  );

  const handleAddOffer = async () => {
    try {
      if (newOffer.id) {
        // Editing existing
        await updateOffer(newOffer.id, {
          candidateName: newOffer.candidateName,
          email: newOffer.email,
          position: newOffer.position,
          salary: newOffer.salary,
          startDate: newOffer.startDate,
          expiryDate: newOffer.expiryDate,
          employmentType: newOffer.employmentType,
          benefits: newOffer.benefits,
          serviceAgreement: newOffer.serviceAgreement,
          hrName: newOffer.hrName
        });
        addActivity(`Edited offer for ${newOffer.candidateName}`);
      } else {
        // New
        await createOffer({
          candidateName: newOffer.candidateName,
          email: newOffer.email,
          position: newOffer.position,
          salary: newOffer.salary,
          startDate: newOffer.startDate,
          expiryDate: newOffer.expiryDate,
          employmentType: newOffer.employmentType,
          benefits: newOffer.benefits,
          serviceAgreement: newOffer.serviceAgreement,
          hrName: newOffer.hrName
        });
        addActivity(`Created new offer for ${newOffer.candidateName}`);
      }
      setNewOffer({ candidateName: "", email: "", position: "", salary: "", startDate: "", expiryDate: "", employmentType: "Full-time", benefits: "", serviceAgreement: "", hrName: "" });
      setShowOfferForm(false);
    } catch (error) {
      console.error('Error saving offer:', error);
    }
  };

  const filteredOffers = statusFilter === "All" ? offers : offers.filter(o => o.status === statusFilter);

  const counts = {
    pending: offers.filter(o => o.status === "Pending").length,
    accepted: offers.filter(o => o.status === "Accepted").length,
    declined: offers.filter(o => o.status === "Declined").length,
    withdrawn: offers.filter(o => o.status === "Withdrawn").length
  };

  return (
    <div className="recruitment-page">
      <div className="section-header">
        <h2>Job Offers Management</h2>
        <div>
          <button className="btn" onClick={() => setShowOfferForm(true)}>Create Offer</button>
          <button className="btn btn-secondary" onClick={() => {
            if (offers.length > 0) {
              setCurrentOffer(offers[0]);
            }
            setShowTemplate(true);
          }}>Offer Template</button>
        </div>
      </div>

      <div className="status-cards">
        <div className="card" onClick={() => setStatusFilter("Pending")}>
          <h2>Pending</h2><h3>{counts.pending}</h3>
        </div>
        <div className="card" onClick={() => setStatusFilter("Accepted")}>
          <h2>Accepted</h2><h3>{counts.accepted}</h3>
        </div>
        <div className="card" onClick={() => setStatusFilter("Declined")}>
          <h2>Declined</h2><h3>{counts.declined}</h3>
        </div>
        <div className="card" onClick={() => setStatusFilter("Withdrawn")}>
          <h2>Withdrawn</h2><h3>{counts.withdrawn}</h3>
        </div>
      </div>

      <div className="table-section">
        <table className="table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Position</th>
              <th>Salary</th>
              {(statusFilter === "All" || statusFilter === "Pending") && <th>Offer Date</th>}
              {(statusFilter === "All" || statusFilter === "Pending") && <th>Expiry Date</th>}
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOffers.map(offer => (
              <tr key={offer._id}>
                <td>{offer.candidateName}<br/><small>{offer.email}</small></td>
                <td>{offer.position}</td>
                <td>{offer.salary}</td>
                {(statusFilter === "All" || offer.status === "Pending") && <td>{offer.offerDate ? new Date(offer.offerDate).toLocaleDateString() : 'N/A'}</td>}
                {(statusFilter === "All" || offer.status === "Pending") && <td>{offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString() : 'N/A'}</td>}
                <td>{offer.status}</td>
                <td>
                  <button className="btn btn-small" onClick={() => { setCurrentOffer(offer); setShowView(true); }}>View</button>
                  {offer.status === "Pending" && <>
                    <button className="btn btn-small" onClick={() => { setNewOffer({ ...offer, id: offer._id, candidateName: offer.candidateName }); setShowOfferForm(true); }}>Edit</button>
                    <button className="btn btn-small btn-secondary" onClick={async () => { console.log('Withdrawing offer:', offer._id); try { await updateOffer(offer._id, { status: "Withdrawn" }); addActivity(`Withdrew offer for ${offer.candidateName}`); console.log('Offer withdrawn successfully'); } catch (error) { console.error('Error withdrawing offer:', error); } }}>Withdraw</button>
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Offer Modal */}
      {showOfferForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{newOffer.id ? "Edit Offer" : "Create Job Offer"}</h3>
            <div className="form-row">
              <label>Candidate Name</label>
              <select value={newOffer.candidateName} onChange={(e) => {
                const selectedCandidate = completedCandidates.find(c => c.name === e.target.value);
                setNewOffer({
                  ...newOffer,
                  candidateName: e.target.value,
                  email: selectedCandidate ? selectedCandidate.email : "",
                  position: selectedCandidate ? selectedCandidate.position : ""
                });
              }}>
                <option value="">Select Candidate</option>
                {completedCandidates.map(candidate => (
                  <option key={candidate._id} value={candidate.name}>
                    {candidate.name} - {candidate.position}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Email</label>
              <input type="email" value={newOffer.email} onChange={(e) => setNewOffer({...newOffer, email: e.target.value})} />
            </div>
            <div className="form-row">
              <label>Position</label>
              <input type="text" value={newOffer.position} onChange={(e) => setNewOffer({...newOffer, position: e.target.value})} />
            </div>
            <div className="form-row">
              <label>Annual Salary</label>
              <input type="text" value={newOffer.salary} onChange={(e) => setNewOffer({...newOffer, salary: e.target.value})} />
            </div>
            <div className="form-row">
              <label>Start Date</label>
              <input type="date" value={newOffer.startDate} onChange={(e) => setNewOffer({...newOffer, startDate: e.target.value})} />
            </div>
            <div className="form-row">
              <label>Offer Expiry Date</label>
              <input type="date" value={newOffer.expiryDate} onChange={(e) => setNewOffer({...newOffer, expiryDate: e.target.value})} />
            </div>
            <div className="form-row">
              <label>Employment Type</label>
              <select value={newOffer.employmentType} onChange={(e) => setNewOffer({...newOffer, employmentType: e.target.value})}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
              </select>
            </div>
            <div className="form-row">
              <label>Benefits</label>
              <textarea value={newOffer.benefits} onChange={(e) => setNewOffer({...newOffer, benefits: e.target.value})}></textarea>
            </div>
            <div className="form-row">
              <label>Service Agreement Time</label>
              <select value={newOffer.serviceAgreement} onChange={(e) => setNewOffer({...newOffer, serviceAgreement: e.target.value})}>
                <option>6 Months</option>
                <option>12 Months</option>
                <option>24 Months</option>
              </select>
            </div>
            <div className="form-row">
              <label>HR Name</label>
              <input type="text" value={newOffer.hrName} onChange={(e) => setNewOffer({...newOffer, hrName: e.target.value})} />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={handleAddOffer}>{newOffer.id ? "Save" : "Create Offer"}</button>
              <button className="btn btn-secondary" onClick={() => setShowOfferForm(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* View Offer Letter Modal */}
      {showView && currentOffer && (
        <div className="modal">
          <div className="modal-content offer-letter-modal">
            <h3>Offer Letter - {currentOffer.candidateName}</h3>
            <div className="editable-offer-letter">
              <div
                dangerouslySetInnerHTML={{
                  __html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                      <div style="text-align:center; margin-bottom:20px;">
                        <img src="[Company Logo URL]" alt="Company Logo" style="max-width:150px;" />
                        <h2>Just Tap Loans</h2>
                        <p><strong>Human Resources Department</strong></p>
                      </div>

                      <p>Date: <strong>${new Date().toLocaleDateString()}</strong></p>
                      <p>To:</p>
                      <p><strong>${currentOffer.candidateName}</strong></p>
                      <p>Email: ${currentOffer.email}</p>

                      <h3 style="margin-top:20px;">Subject: Job Offer for ${currentOffer.position}</h3>

                      <p>Dear ${currentOffer.candidateName},</p>

                      <p>
                        We are delighted to offer you the position of <strong>${currentOffer.position}</strong> at <strong>Just Tap Loans</strong>.
                        Your start date will be <strong>${currentOffer.startDate ? new Date(currentOffer.startDate).toLocaleDateString() : 'N/A'}</strong> as a <strong>${currentOffer.employmentType}</strong> employee with an annual CTC of <strong>${currentOffer.salary}</strong>.
                      </p>

                      <h4>Key Details:</h4>
                      <ul>
                        <li>Position: <strong>${currentOffer.position}</strong></li>
                        <li>Start Date: <strong>${currentOffer.startDate ? new Date(currentOffer.startDate).toLocaleDateString() : 'N/A'}</strong></li>
                        <li>Employment Type: <strong>${currentOffer.employmentType}</strong></li>
                        <li>Annual CTC: <strong>${currentOffer.salary}</strong></li>
                        <li>Service Agreement: <strong>${currentOffer.serviceAgreement}</strong></li>
                        <li>Offer Expiry Date: <strong>${currentOffer.expiryDate ? new Date(currentOffer.expiryDate).toLocaleDateString() : 'N/A'}</strong></li>
                      </ul>

                      <h4>Terms & Conditions:</h4>
                      <ol>
                        <li>Your employment is subject to background verification and reference checks.</li>
                        <li>You are required to comply with company policies and code of conduct.</li>
                        <li>Early termination may involve applicable fees as per the service agreement.</li>
                        <li>This offer is valid until <strong>${currentOffer.expiryDate ? new Date(currentOffer.expiryDate).toLocaleDateString() : 'N/A'}</strong>. Kindly confirm your acceptance before this date.</li>
                      </ol>

                      <p>We are confident that your skills and experience will be a valuable addition to our team. We look forward to welcoming you aboard!</p>

                      <p>Sincerely,</p>
                      <p><strong>${currentOffer.hrName || '[HR Name]'}</strong></p>
                      <p>Human Resources Department</p>
                      <p>Just Tap Loans</p>
                    </div>
                  `
                }}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowView(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      
      {/* Professional Offer Letter Modal */}
{showTemplate && (
  <div className="modal">
    <div className="modal-content offer-letter-modal">
      <h3>Job Offer - Just Tap Loans</h3>

      <div
        className="editable-offer-letter"
        contentEditable={true}
        suppressContentEditableWarning={true}
        ref={letterRef}
        dangerouslySetInnerHTML={{
          __html: currentOffer ? `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="text-align:center; margin-bottom:20px;">
                <img src="[Company Logo URL]" alt="Company Logo" style="max-width:150px;" />
                <h2>Just Tap Loans</h2>
                <p><strong>Human Resources Department</strong></p>
              </div>

              <p>Date: <strong>${new Date().toLocaleDateString()}</strong></p>
              <p>To:</p>
              <p><strong>${currentOffer.candidateName}</strong></p>
              <p>Email: ${currentOffer.email}</p>

              <h3 style="margin-top:20px;">Subject: Job Offer for ${currentOffer.position}</h3>

              <p>Dear ${currentOffer.candidateName},</p>

              <p>
                We are delighted to offer you the position of <strong>${currentOffer.position}</strong> at <strong>Just Tap Loans</strong>.
                Your start date will be <strong>${currentOffer.startDate ? new Date(currentOffer.startDate).toLocaleDateString() : 'N/A'}</strong> as a <strong>${currentOffer.employmentType}</strong> employee with an annual CTC of <strong>${currentOffer.salary}</strong>.
              </p>

              <h4>Key Details:</h4>
              <ul>
                <li>Position: <strong>${currentOffer.position}</strong></li>
                <li>Start Date: <strong>${currentOffer.startDate ? new Date(currentOffer.startDate).toLocaleDateString() : 'N/A'}</strong></li>
                <li>Employment Type: <strong>${currentOffer.employmentType}</strong></li>
                <li>Annual CTC: <strong>${currentOffer.salary}</strong></li>
                <li>Service Agreement: <strong>${currentOffer.serviceAgreement}</strong></li>
                <li>Offer Expiry Date: <strong>${currentOffer.expiryDate ? new Date(currentOffer.expiryDate).toLocaleDateString() : 'N/A'}</strong></li>
              </ul>

              <h4>Benefits:</h4>
              <ul>
                <li>${currentOffer.benefits}</li>
              </ul>

              <h4>Terms & Conditions:</h4>
              <ol>
                <li>Your employment is subject to background verification and reference checks.</li>
                <li>You are required to comply with company policies and code of conduct.</li>
                <li>Early termination may involve applicable fees as per the service agreement.</li>
                <li>This offer is valid until <strong>${currentOffer.expiryDate ? new Date(currentOffer.expiryDate).toLocaleDateString() : 'N/A'}</strong>. Kindly confirm your acceptance before this date.</li>
              </ol>

              <p>We are confident that your skills and experience will be a valuable addition to our team. We look forward to welcoming you aboard!</p>

              <p>Sincerely,</p>
              <p><strong>[HR Name]</strong></p>
              <p>Human Resources Department</p>
              <p>Just Tap Loans</p>
            </div>
          ` : `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="text-align:center; margin-bottom:20px;">
                <img src="[Company Logo URL]" alt="Company Logo" style="max-width:150px;" />
                <h2>Just Tap Loans</h2>
                <p><strong>Human Resources Department</strong></p>
              </div>

              <p>Date: <strong>[Date]</strong></p>
              <p>To:</p>
              <p><strong>[Candidate Name]</strong></p>
              <p>Email: [Candidate Email]</p>

              <h3 style="margin-top:20px;">Subject: Job Offer for [Position]</h3>

              <p>Dear [Candidate Name],</p>

              <p>
                We are delighted to offer you the position of <strong>[Position]</strong> at <strong>Just Tap Loans</strong>.
                Your start date will be [Start Date] as a [Employment Type] employee with an annual CTC of [Annual Salary].
              </p>

              <h4>Key Details:</h4>
              <ul>
                <li>Position: [Position]</li>
                <li>Start Date: [Start Date]</li>
                <li>Employment Type: [Employment Type]</li>
                <li>Annual CTC: [Annual Salary]</li>
                <li>Service Agreement: [Service Agreement Period]</li>
                <li>Offer Expiry Date: [Offer Expiry Date]</li>
              </ul>

              <h4>Benefits:</h4>
              <ul>
                <li>[Benefit 1]</li>
                <li>[Benefit 2]</li>
              </ul>

              <h4>Terms & Conditions:</h4>
              <ol>
                <li>Your employment is subject to background verification and reference checks.</li>
                <li>You are required to comply with company policies and code of conduct.</li>
                <li>Early termination may involve applicable fees as per the service agreement.</li>
                <li>This offer is valid until [Offer Expiry Date]. Kindly confirm your acceptance before this date.</li>
              </ol>

              <p>We are confident that your skills and experience will be a valuable addition to our team. We look forward to welcoming you aboard!</p>

              <p>Sincerely,</p>
              <p><strong>[HR Name]</strong></p>
              <p>Human Resources Department</p>
              <p>Just Tap Loans</p>
            </div>
          `
        }}
      />

       <div className="modal-actions">
        <button className="btn" onClick={async () => {
          if (currentOffer) {
            try {
              const response = await fetch(`http://localhost:5000/api/offers/${currentOffer._id}/send-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              if (response.ok) {
                alert("Offer email sent successfully!");
                setShowTemplate(false);
              } else {
                alert("Failed to send offer email.");
              }
            } catch (error) {
              console.error('Error sending offer email:', error);
              alert("Error sending offer email.");
            }
          } else {
            alert("No offer selected!");
          }
        }}>Send</button>
        <button className="btn btn-secondary" onClick={() => setShowTemplate(false)}>Close</button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}

export default JobOffers;

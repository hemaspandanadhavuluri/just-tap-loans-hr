import React, { useEffect, useState } from 'react';
import '../../Stylesheets/Leave_Holiday_Management.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Leave_Holiday_Management() {
	const [requests, setRequests] = useState([]);
	const [holidays, setHolidays] = useState([]);
	const [viewReason, setViewReason] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function load() {
			setLoading(true);
			try {
				const res = await fetch(`${API_BASE}/api/leave/all`);
				if (!res.ok) throw new Error('Failed to fetch leave requests');
				const data = await res.json();
				// The controller populates employeeId — normalize for display
				const normalized = data.map((r) => ({
					...r,
					employeeName: r.employeeId?.fullName || r.employeeId,
				}));
				setRequests(normalized);

				// Try fetching holidays endpoint if exists, otherwise empty
				try {
					const hRes = await fetch(`${API_BASE}/api/holidays`);
					if (hRes.ok) {
						const hData = await hRes.json();
						setHolidays(hData);
					} else {
						setHolidays([]);
					}
				} catch (e) {
					setHolidays([]);
				}

				setError(null);
			} catch (err) {
				console.error(err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	const counts = requests.reduce(
		(acc, r) => {
			if (r.status === 'approved') acc.approved++;
			if (r.status === 'pending') acc.pending++;
			if (r.status === 'rejected') acc.rejected++;
			return acc;
		},
		{ approved: 0, pending: 0, rejected: 0 }
	);

	const currentMonth = new Date().getMonth();
	const holidaysThisMonth = holidays.filter((h) => new Date(h.date).getMonth() === currentMonth);

	async function updateStatus(id, status) {
		try {
			const body = { status, approvedBy: null, hrComments: '' };
			const res = await fetch(`${API_BASE}/api/leave/${id}/status`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || 'Failed to update status');
			}
			const updated = await res.json();
			// replace in state
			setRequests((prev) => prev.map((r) => (r._id === id ? updated.leaveRequest : r)));
		} catch (err) {
			console.error('Error updating status', err);
			setError(err.message || 'Error updating');
		}
	}

	return (
		<div className="hr-leave-page">
			<h2>Leave & Holiday Management</h2>

			{loading && <div>Loading...</div>}
			{error && <div className="error">{error}</div>}

			<div className="cards-row">
				<div className="card approved">
					<div className="card-title">Approved Leaves</div>
					<div className="card-number">{counts.approved}</div>
				</div>
				<div className="card pending">
					<div className="card-title">Pending Leaves</div>
					<div className="card-number">{counts.pending}</div>
				</div>
				<div className="card rejected">
					<div className="card-title">Rejected Leaves</div>
					<div className="card-number">{counts.rejected}</div>
				</div>
				<div className="card holidays">
					<div className="card-title">Holidays This Month</div>
					<div className="card-number">{holidaysThisMonth.length}</div>
				</div>
			</div>

			<h3>Leave Requests</h3>
			<div className="table-wrapper">
				<table className="requests-table">
					<thead>
						<tr>
							<th>Employee</th>
							<th>Leave Type</th>
							<th>Start Date</th>
							<th>End Date</th>
							<th>Days</th>
							<th>Status</th>
							<th>Actions</th>
							<th>View</th>
						</tr>
					</thead>
					<tbody>
						{requests.map((r) => (
							<tr key={r._id} className={`status-${r.status}`}>
								<td>{r.employeeId?.fullName || r.employeeName || 'Unknown'}</td>
								<td>{r.leaveType}</td>
								<td>{new Date(r.startDate).toLocaleDateString()}</td>
								<td>{new Date(r.endDate).toLocaleDateString()}</td>
								<td>{r.totalDays}</td>
								<td>{r.status}</td>
								<td>
									{r.status === 'pending' ? (
										<>
											<button className="btn-approve" onClick={() => updateStatus(r._id, 'approved')}>
												Approve
											</button>
											<button className="btn-reject" onClick={() => updateStatus(r._id, 'rejected')}>
												Reject
											</button>
										</>
									) : (
										<span>-</span>
									)}
								</td>
								<td>
									<button className="btn-view" onClick={() => setViewReason(r)}>
										View
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<h3>Holidays (this month)</h3>
			<ul className="holiday-list">
				{holidaysThisMonth.length ? (
					holidaysThisMonth.map((h) => (
						<li key={h.id}>
							<strong>{h.name}</strong> — {h.date}
						</li>
					))
				) : (
					<li>No holidays this month.</li>
				)}
			</ul>

			{viewReason && (
				<div className="modal-overlay" onClick={() => setViewReason(null)}>
					<div className="modal" onClick={(e) => e.stopPropagation()}>
						<h4>Reason for leave — {viewReason.employeeId?.fullName || viewReason.employeeName}</h4>
						<p><strong>Type:</strong> {viewReason.leaveType}</p>
						<p><strong>Period:</strong> {new Date(viewReason.startDate).toLocaleDateString()} to {new Date(viewReason.endDate).toLocaleDateString()} ({viewReason.totalDays} days)</p>
						<p><strong>Reason:</strong></p>
						<div className="reason-box">{viewReason.reason}</div>
						<div className="modal-actions">
							<button onClick={() => setViewReason(null)}>Close</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}


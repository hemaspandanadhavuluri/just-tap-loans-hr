import React, { useEffect, useState } from 'react';
import '../../Stylesheets/EmployeeLeave.css';
import { useEmployeeAuth } from './EmployeeAuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ALLOCATIONS = {
	casual: 6,
	annual: 12,
	sick: 6,
	public: 8,
	optional: 2,
	wfhPerMonth: 2,
};

export default function EmployeeLeave() {
	const { employee } = useEmployeeAuth();
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
	const [message, setMessage] = useState(null);

	useEffect(() => {
		if (!employee) return;
		fetchRequests();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [employee]);

	async function fetchRequests() {
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE}/api/leave/employee/${employee._id}`);
			if (!res.ok) throw new Error('Failed to load leave requests');
			const data = await res.json();
			setRequests(data);
		} catch (err) {
			console.error(err);
			setMessage({ type: 'error', text: err.message });
		} finally {
			setLoading(false);
		}
	}

	function totalsForYear() {
		const year = new Date().getFullYear();
		const used = { casual: 0, annual: 0, sick: 0, public: 0, optional: 0 };
		requests.forEach((r) => {
			const sd = new Date(r.startDate);
			if (sd.getFullYear() !== year) return;
			if (r.status !== 'approved') return; // count only approved
			const key = r.leaveType === 'work-from-home' ? 'wfh' : r.leaveType;
			if (key && used[key] !== undefined) {
				used[key] += r.totalDays || 0;
			}
		});
		return used;
	}

	const used = totalsForYear();

	async function submitRequest(e) {
		e.preventDefault();
		if (!employee) {
			setMessage({ type: 'error', text: 'You must be logged in.' });
			return;
		}

		try {
			const res = await fetch(`${API_BASE}/api/leave/request`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					employeeId: employee._id,
					leaveType: form.leaveType,
					startDate: form.startDate,
					endDate: form.endDate,
					reason: form.reason,
				}),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Failed to submit');
			setMessage({ type: 'success', text: data.message || 'Request submitted' });
			setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
			fetchRequests();
		} catch (err) {
			console.error(err);
			setMessage({ type: 'error', text: err.message });
		}
	}

	// Count WFH used this month (approved)
	function wfhUsedThisMonth() {
		const now = new Date();
		const m = now.getMonth();
		let used = 0;
		requests.forEach((r) => {
			if (r.leaveType !== 'work-from-home') return;
			if (r.status !== 'approved') return;
			const sd = new Date(r.startDate);
			if (sd.getMonth() === m && sd.getFullYear() === now.getFullYear()) used += r.totalDays || 0;
		});
		return used;
	}

	return (
		<div className="employee-leave-page">
			<h2>Your Leaves</h2>

			{loading && <div>Loading...</div>}
			{message && <div className={`message ${message.type}`}>{message.text}</div>}

			<div className="leave-summary-cards">
				<div className="summary-card">
					<div className="title">Casual</div>
					<div className="value">{ALLOCATIONS.casual} (used {used.casual || 0})</div>
				</div>
				<div className="summary-card">
					<div className="title">Earned / Annual</div>
					<div className="value">{ALLOCATIONS.annual} (used {used.annual || 0})</div>
				</div>
				<div className="summary-card">
					<div className="title">Sick</div>
					<div className="value">{ALLOCATIONS.sick} (used {used.sick || 0})</div>
				</div>
				<div className="summary-card">
					<div className="title">Public Holidays</div>
					<div className="value">{ALLOCATIONS.public}</div>
				</div>
				<div className="summary-card">
					<div className="title">Optional Holidays</div>
					<div className="value">{ALLOCATIONS.optional}</div>
				</div>
				<div className="summary-card">
					<div className="title">WFH this month</div>
					<div className="value">{wfhUsedThisMonth()} / {ALLOCATIONS.wfhPerMonth}</div>
				</div>
			</div>

			<h3>Request a Leave / WFH</h3>
			<form className="leave-form" onSubmit={submitRequest}>
				<label>
					Type
					<select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
						<option value="casual">Casual</option>
						<option value="annual">Earned / Annual</option>
						<option value="sick">Sick</option>
						<option value="work-from-home">Work from Home</option>
					</select>
				</label>

				<label>
					Start Date
					<input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
				</label>

				<label>
					End Date
					<input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
				</label>

				<label>
					Reason
					<textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
				</label>

				<div>
					<button type="submit">Submit Request</button>
				</div>
			</form>

			<h3>Your Requests</h3>
			<table className="employee-requests">
				<thead>
					<tr>
						<th>Type</th>
						<th>Start</th>
						<th>End</th>
						<th>Days</th>
						<th>Status</th>
						<th>Reason</th>
					</tr>
				</thead>
				<tbody>
					{requests.map((r) => (
						<tr key={r._id}>
							<td>{r.leaveType}</td>
							<td>{new Date(r.startDate).toLocaleDateString()}</td>
							<td>{new Date(r.endDate).toLocaleDateString()}</td>
							<td>{r.totalDays}</td>
							<td>{r.status}</td>
							<td>{r.reason}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}


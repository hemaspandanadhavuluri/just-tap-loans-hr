import React, { useEffect, useState } from 'react';
import { useEmployeeAuth } from './EmployeeAuthContext';
import '../../Stylesheets/Payroll_Benifits.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Payroll_Benifits() {
    const { employee } = useEmployeeAuth();

    const [allPayrolls, setAllPayrolls] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [processedCount, setProcessedCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [hrPayrollMonth, setHrPayrollMonth] = useState(new Date().getMonth() + 1);
    const [hrPayrollYear, setHrPayrollYear] = useState(new Date().getFullYear());
    const [allEmployees, setAllEmployees] = useState([]);
    const [benefitRequestsAll, setBenefitRequestsAll] = useState([]);
    const [payrollView, setPayrollView] = useState(null);
    const [declineModal, setDeclineModal] = useState({ open: false, id: null, reason: '' });
    const [payrollRejectModal, setPayrollRejectModal] = useState({ open: false, id: null, reason: '' });

    useEffect(() => {
        if (employee?.role === 'hr') loadHRData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employee, hrPayrollMonth, hrPayrollYear]);

    const loadHRData = async () => {
        try {
            const resp = await fetch(`${API_BASE}/api/users/active`);
            if (resp.ok) {
                const data = await resp.json();
                console.log('HR: fetched active employees', data);
                setTotalEmployees(data.length);
                setAllEmployees(data);
            }
        } catch (err) {
            console.error('Error fetching employees', err);
        }

        try {
            const resp = await fetch(`${API_BASE}/api/payroll/all?month=${hrPayrollMonth}&year=${hrPayrollYear}`);
            if (resp.ok) {
                const data = await resp.json();
                console.log(`HR: fetched payrolls for ${hrPayrollMonth}/${hrPayrollYear}`, data);
                setAllPayrolls(data);
                setProcessedCount(data.filter(p => p.status === 'processed' || p.status === 'paid').length);
                setPendingCount(data.filter(p => p.status === 'pending').length);
            }
        } catch (err) {
            console.error('Error fetching payrolls', err);
        }

        try {
            const bresp = await fetch(`${API_BASE}/api/payroll/benefit-requests/all`);
            if (bresp.ok) setBenefitRequestsAll(await bresp.json());
        } catch (err) {
            console.error('Error fetching benefit requests', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'green';
            case 'declined': return 'red';
            case 'pending': return 'orange';
            case 'paid': return 'green';
            case 'processed': return 'blue';
            case 'rejected': return 'red';
            default: return 'gray';
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    const handlePayrollAction = async (payrollId, action) => {
        try {
            if (action === 'paid') {
                const paymentDate = prompt('Enter payment date (YYYY-MM-DD) or leave empty for today:');
                const body = { status: 'paid' };
                if (paymentDate) body.paymentDate = paymentDate;
                const resp = await fetch(`${API_BASE}/api/payroll/${payrollId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                if (!resp.ok) throw new Error('Could not mark paid');
                await loadHRData();
                return;
            }
            if (action === 'process') {
                const resp = await fetch(`${API_BASE}/api/payroll/${payrollId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'processed' }) });
                if (!resp.ok) throw new Error('Could not process payroll');
                await loadHRData();
                return;
            }
        } catch (err) {
            console.error('Payroll action error', err);
            alert(err.message || 'Action failed');
        }
    };

    const openPayrollRejectModal = (id) => {
        if (!id || id === 'undefined') {
            alert('Invalid payroll ID');
            return;
        }
        setPayrollRejectModal({ open: true, id, reason: '' });
    };
    const closePayrollRejectModal = () => setPayrollRejectModal({ open: false, id: null, reason: '' });
    const submitPayrollReject = async () => {
        if (!payrollRejectModal.reason) { alert('Please enter reason'); return; }
        if (!payrollRejectModal.id) { alert('Invalid payroll ID'); return; }
        try {
            const resp = await fetch(`${API_BASE}/api/payroll/${payrollRejectModal.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected', notes: payrollRejectModal.reason }) });
            if (!resp.ok) { const d = await resp.json(); throw new Error(d.message || 'Failed'); }

            await loadHRData();
            closePayrollRejectModal();
            alert('Payroll rejected successfully.');
        } catch (err) {
            console.error('Error rejecting payroll', err);
            alert(err.message || 'Action failed');
        }
    };

    const viewPayroll = (p) => setPayrollView(p);
    const closePayrollView = () => setPayrollView(null);

    // Compute breakdown for a payroll/employee record for display
    const computeDisplay = (p) => {
        // p may be a payroll record returned from backend merged with employee data
        const emp = p.employeeId || {};
        const annual = Number(emp.salary || p.annualPackage || 0);
        const baseMonthly = Number(p.baseSalary ?? (annual ? annual / 12 : 0));

        // try to parse notes for explicit breakdown
        let parsed = {};
        try {
            parsed = typeof p.notes === 'string' ? JSON.parse(p.notes) : (p.notes || {});
        } catch (e) { parsed = p.notes || {}; }

        const pf = parsed.pf !== undefined ? Number(parsed.pf) : (baseMonthly * 0.12);
        const gratuity = parsed.gratuity !== undefined ? Number(parsed.gratuity) : (baseMonthly * 0.0481);
        const late = Number(parsed.late || 0);
        const absent = Number(parsed.absent || 0);
        const benefits = Number(parsed.benefits || 0);
        const increments = Number(parsed.increments || 0);
        const incentives = Number(parsed.incentives || 0);

        const totalDeductions = pf + gratuity + late + absent;
        const totalAdditions = benefits + increments + incentives;

        // totalSalary if backend provided, else compute
        const totalSalary = Number(p.totalSalary ?? (baseMonthly + totalAdditions - totalDeductions));

        // in-hand: monthly base minus statutory deductions (pf + gratuity) and attendance deductions
        const inHand = Math.max(0, baseMonthly - pf - gratuity - late - absent + totalAdditions);

        return {
            baseMonthly, pf, gratuity, late, absent, benefits, increments, incentives,
            totalDeductions, totalAdditions, totalSalary, inHand, parsed
        };
    };

    const handleBenefitAction = async (id, status, hrComments = '') => {
        try {
            const resp = await fetch(`${API_BASE}/api/payroll/benefit-request/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, hrComments, approvedBy: employee._id }) });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || 'Failed');
            await loadHRData();
        } catch (err) {
            console.error('Benefit action error', err);
            alert(err.message || 'Action failed');
        }
    };

    const openDeclineModal = (id) => setDeclineModal({ open: true, id, reason: '' });
    const closeDeclineModal = () => setDeclineModal({ open: false, id: null, reason: '' });
    const submitDecline = async () => {
        if (!declineModal.reason) { alert('Please enter reason'); return; }
        await handleBenefitAction(declineModal.id, 'declined', declineModal.reason);
        closeDeclineModal();
    };

    // Page is accessible to all users; HR-only actions are gated where needed.

    // helper to read reject reason from localStorage
    const getPayrollRejectReason = (id) => {
        try {
            const map = JSON.parse(localStorage.getItem('payroll_reject_reasons_v1') || '{}');
            return map[id] || null;
        } catch (e) { return null; }
    };

    return (
        <div className="employee-payroll">
            <h2>Payroll & Benefits - HR</h2>

            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div className="summary-card"><div style={{ fontWeight: 700, color: '#666' }}>Total Employees</div><div style={{ fontSize: 18, marginTop: 6 }}>{totalEmployees}</div></div>
                <div className="summary-card"><div style={{ fontWeight: 700, color: '#666' }}>Processed Payrolls</div><div style={{ fontSize: 18, marginTop: 6 }}>{processedCount}</div></div>
                <div className="summary-card"><div style={{ fontWeight: 700, color: '#666' }}>Pending Payrolls</div><div style={{ fontSize: 18, marginTop: 6 }}>{pendingCount}</div></div>
            </div>

            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ fontWeight: 600 }}>Month:</label>
                <select value={hrPayrollMonth} onChange={(e) => setHrPayrollMonth(parseInt(e.target.value))}>
                    {Array.from({ length: 12 }).map((_, i) => (<option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en-US', { month: 'long' })}</option>))}
                </select>
                <label style={{ fontWeight: 600 }}>Year:</label>
                <input type="number" value={hrPayrollYear} onChange={(e) => setHrPayrollYear(parseInt(e.target.value))} style={{ width: 100 }} />
                <button className="request-btn" onClick={loadHRData}>Refresh</button>
            </div>

            <div className="payroll-table">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Email</th>
                            <th>Salary (Annual)</th>
                            <th>Amount (In-hand)</th>
                            <th>Created</th>
                            <th>Payroll Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allEmployees.length > 0 ? allEmployees.map(emp => {
                            // find payroll record for this employee for selected month/year
                            const p = allPayrolls.find(x => {
                                if (!x) return false;
                                const pid = x.employeeId && x.employeeId._id ? x.employeeId._id.toString() : (x.employeeId ? x.employeeId.toString() : null);
                                const empId = emp._id ? emp._id.toString() : emp.id;
                                return pid === empId;
                            }) || null;

                            // merge employee into payroll object for compute
                            const merged = { ...(p || {}), employeeId: emp };
                            // ensure baseSalary exists if payroll missing it
                            if (!merged.baseSalary) {
                                const annual = Number(emp.salary || 0);
                                merged.baseSalary = annual ? annual / 12 : 0;
                            }

                            const display = computeDisplay(merged);
                            const empName = emp.fullName || emp.name || '-';
                            const empEmail = emp.email || '-';
                            const empAnnual = Number(emp.salary || 0);
                            const empPendingSalary = Number(emp.pendingSalary || 0);
                            const created = p && p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '';
                            const payrollStatus = p?.status || 'pending';
                            // map payment display: paid -> credited, rejected -> declined
                            const paymentDisplay = payrollStatus === 'paid' ? 'credited' : (payrollStatus === 'rejected' ? 'declined' : '');
                            const paymentDate = p?.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '';

                            return (
                                <tr key={emp._id}>
                                    <td>{empName}</td>
                                    <td>{empEmail}</td>
                                    <td>{empPendingSalary ? `${formatCurrency(empPendingSalary)} (Pending)` : (empAnnual ? formatCurrency(empAnnual) : '-')}</td>
                                    <td>{empAnnual ? formatCurrency(display.inHand) : '₹0.00'}</td>
                                    <td>{created}</td>
                                    <td><span className={`status-badge ${getStatusColor(payrollStatus)}`}>{payrollStatus}</span></td>
                                    <td>{paymentDisplay || paymentDate}</td>
                                    <td>
                                        <button className="small-btn" onClick={() => viewPayroll({ ...(p || {}), employeeId: emp, _computed: display })}>View</button>
                                        {empPendingSalary > 0 && (
                                            <>
                                                <button style={{ marginLeft: 4 }} className="small-btn" onClick={async () => {
                                                    try {
                                                        const resp = await fetch(`${API_BASE}/api/users/${emp._id}/salary/approve`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
                                                        if (!resp.ok) { const d = await resp.json(); throw new Error(d.message || 'Failed'); }
                                                        await loadHRData();
                                                        alert('Salary approved');
                                                    } catch (e) { console.error('Salary approve error', e); alert(e.message || 'Failed to approve salary'); }
                                                }}>Approve</button>
                                                <button style={{ marginLeft: 4 }} className="small-btn" onClick={async () => {
                                                    try {
                                                        const resp = await fetch(`${API_BASE}/api/users/${emp._id}/salary/decline`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
                                                        if (!resp.ok) { const d = await resp.json(); throw new Error(d.message || 'Failed'); }
                                                        await loadHRData();
                                                        alert('Salary declined');
                                                    } catch (e) { console.error('Salary decline error', e); alert(e.message || 'Failed to decline salary'); }
                                                }}>Decline</button>
                                            </>
                                        )}
                                        <button style={{ marginLeft: 4 }} className="small-btn" onClick={async () => {
                                            const val = prompt('Enter annual salary (number) for ' + (emp.fullName || emp.email) + ':', emp.salary || emp.pendingSalary || '');
                                            if (val === null) return;
                                            const num = Number(val);
                                            if (isNaN(num)) { alert('Invalid number'); return; }
                                            try {
                                                const resp = await fetch(`${API_BASE}/api/users/${emp._id}/salary`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ salary: num }) });
                                                if (!resp.ok) { const d = await resp.json(); throw new Error(d.message || 'Failed'); }
                                                await loadHRData();
                                                alert('Salary updated');
                                            } catch (e) { console.error('Salary update error', e); alert(e.message || 'Failed to update salary'); }
                                        }}>Edit Salary</button>
                                        {payrollStatus === 'pending' && p?._id && (
                                            <>
                                                <button style={{ marginLeft: 4 }} className="small-btn" onClick={() => handlePayrollAction(p._id, 'process')}>Approve Payroll</button>
                                                <button style={{ marginLeft: 4 }} className="small-btn" onClick={() => openPayrollRejectModal(p._id)}>Decline Payroll</button>
                                            </>
                                        )}
                                        {(payrollStatus === 'processed') && p?._id && <button style={{ marginLeft: 4 }} className="small-btn" onClick={() => handlePayrollAction(p._id, 'paid')}>Mark Paid</button>}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="7" className="no-data">No active employees found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: 18 }}>
                <h3>All Benefit Requests</h3>
                <div className="benefit-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Email</th>
                                <th>Amount</th>
                                <th>Purpose</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {benefitRequestsAll.length > 0 ? benefitRequestsAll.map(b => (
                                <tr key={b._id}>
                                    <td>{b.employeeId?.fullName}</td>
                                    <td>{b.employeeId?.email || '-'}</td>
                                    <td>{b.amount ? formatCurrency(b.amount) : 'N/A'}</td>
                                    <td>{b.description}</td>
                                    <td>{new Date(b.createdAt).toLocaleString()}</td>
                                    <td><span className={`status-badge ${getStatusColor(b.status)}`}>{b.status}</span></td>
                                    <td>
                                        {b.status === 'pending' ? (
                                            <>
                                                <button className="request-btn" onClick={() => handleBenefitAction(b._id, 'approved', 'Approved')}>Approve</button>
                                                <button style={{ marginLeft: 8 }} className="request-btn" onClick={() => openDeclineModal(b._id)}>Decline</button>
                                            </>
                                        ) : (
                                            <button className="request-btn" onClick={() => alert(`Action performed at: ${b.approvedAt ? new Date(b.approvedAt).toLocaleString() : 'N/A'}`)}>View</button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="no-data">No benefit requests found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {payrollView && (
                <div className="modal-overlay" onClick={closePayrollView}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h4>Payroll Details - {payrollView.employeeId?.fullName || ''}</h4>
                        <p><strong>Month/Year:</strong> {payrollView.month}/{payrollView.year}</p>
                        {(() => {
                            const c = payrollView._computed || (() => {
                                try {
                                    const parsed = typeof payrollView.notes === 'string' ? JSON.parse(payrollView.notes) : (payrollView.notes || {});
                                    const baseMonthly = Number(payrollView.baseSalary || 0);
                                    const pf = Number(parsed.pf ?? (baseMonthly * 0.12));
                                    const gratuity = Number(parsed.gratuity ?? (baseMonthly * 0.0481));
                                    const late = Number(parsed.late || 0);
                                    const absent = Number(parsed.absent || 0);
                                    const benefits = Number(parsed.benefits || 0);
                                    const increments = Number(parsed.increments || 0);
                                    const incentives = Number(parsed.incentives || 0);
                                    const totalDeductions = pf + gratuity + late + absent;
                                    const totalAdditions = benefits + increments + incentives;
                                    const totalSalary = Number(payrollView.totalSalary ?? (baseMonthly + totalAdditions - totalDeductions));
                                    const inHand = Math.max(0, baseMonthly - pf - gratuity - late - absent + totalAdditions);
                                    return { baseMonthly, pf, gratuity, late, absent, benefits, increments, incentives, totalDeductions, totalAdditions, totalSalary, inHand };
                                } catch (e) {
                                    return null;
                                }
                            })();

                            if (c) {
                                return (
                                    <>
                                        <p><strong>Base (Monthly):</strong> {formatCurrency(c.baseMonthly)}</p>
                                        <p><strong>PF (12%):</strong> {formatCurrency(c.pf)}</p>
                                        <p><strong>Gratuity (4.81%):</strong> {formatCurrency(c.gratuity)}</p>
                                        <p><strong>Late Deductions:</strong> {formatCurrency(c.late)}</p>
                                        <p><strong>Absent Deductions:</strong> {formatCurrency(c.absent)}</p>
                                        <p><strong>Additions (benefits/increments/incentives):</strong> {formatCurrency(c.totalAdditions)}</p>
                                        <p><strong>Total Deductions:</strong> {formatCurrency(c.totalDeductions)}</p>
                                        <p><strong>In-hand (after deductions):</strong> {formatCurrency(c.inHand)}</p>
                                        <p><strong>Total Payroll Amount:</strong> {formatCurrency(c.totalSalary)}</p>
                                    </>
                                );
                            }
                            return <p>No breakdown available</p>;
                        })()}
                        {getPayrollRejectReason(payrollView._id) && (
                            <div style={{ marginTop: 8, background: '#fff3f3', padding: 8, borderRadius: 4 }}>
                                <strong>Rejection reason (local):</strong>
                                <div>{getPayrollRejectReason(payrollView._id).reason}</div>
                                <div style={{ fontSize: 12, color: '#666' }}>Saved at {new Date(getPayrollRejectReason(payrollView._id).at).toLocaleString()}</div>
                            </div>
                        )}
                        <div style={{ marginTop: 12, textAlign: 'right' }}>
                            <button onClick={closePayrollView}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {declineModal.open && (
                <div className="modal-overlay" onClick={closeDeclineModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h4>Decline Benefit Request</h4>
                        <p>Please enter reason for declining:</p>
                        <textarea value={declineModal.reason} onChange={(e) => setDeclineModal(prev => ({ ...prev, reason: e.target.value }))} style={{ width: '100%', minHeight: 80 }} />
                        <div style={{ marginTop: 12, textAlign: 'right' }}>
                            <button onClick={closeDeclineModal} style={{ marginRight: 8 }}>Cancel</button>
                            <button onClick={submitDecline}>Submit Decline</button>
                        </div>
                    </div>
                </div>
            )}

            {payrollRejectModal.open && (
                <div className="modal-overlay" onClick={closePayrollRejectModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h4>Reject Payroll</h4>
                        <p>Please enter reason for rejecting this payroll (stored locally):</p>
                        <textarea value={payrollRejectModal.reason} onChange={(e) => setPayrollRejectModal(prev => ({ ...prev, reason: e.target.value }))} style={{ width: '100%', minHeight: 80 }} />
                        <div style={{ marginTop: 12, textAlign: 'right' }}>
                            <button onClick={closePayrollRejectModal} style={{ marginRight: 8 }}>Cancel</button>
                            <button onClick={submitPayrollReject}>Submit Rejection</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

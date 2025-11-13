import React, { useState, useEffect } from 'react';
import { useEmployeeAuth } from './EmployeeAuthContext';
import '../../Stylesheets/EmployeePayroll.css';

const EmployeePayroll = () => {
    const { employee } = useEmployeeAuth();
    const [payrollRecords, setPayrollRecords] = useState([]);
    const [benefitRequests, setBenefitRequests] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [hrPayrollMonth, setHrPayrollMonth] = useState(new Date().getMonth() + 1);
    const [hrPayrollYear, setHrPayrollYear] = useState(new Date().getFullYear());
    const [isRequesting, setIsRequesting] = useState(false);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        benefitType: 'health-insurance',
        description: '',
        amount: ''
    });

    useEffect(() => {
        fetchPayrollRecords();
        fetchBenefitRequests();
        if (employee?.role === 'hr') {
            fetchAllEmployees();
        }
    }, [employee]);

    // HR: fetch all payrolls for selected month/year and summary counts
    const [allPayrolls, setAllPayrolls] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [processedCount, setProcessedCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [payrollView, setPayrollView] = useState(null); // payroll record for modal
    const [benefitRequestsAll, setBenefitRequestsAll] = useState([]);
    const [declineModal, setDeclineModal] = useState({ open: false, id: null, reason: '' });

    useEffect(() => {
        if (employee?.role === 'hr') {
            loadHRData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employee, hrPayrollMonth, hrPayrollYear]);

    const loadHRData = async () => {
        // total employees
        try {
            const resp = await fetch('http://localhost:5000/api/users/active');
            if (resp.ok) {
                const data = await resp.json();
                setTotalEmployees(data.length);
                // keep allEmployees already set by fetchAllEmployees
            }
        } catch (err) {
            console.error('Error fetching total employees', err);
        }

        // payrolls for month/year
        try {
            const resp = await fetch(`http://localhost:5000/api/payroll/all?month=${hrPayrollMonth}&year=${hrPayrollYear}`);
            if (resp.ok) {
                const data = await resp.json();
                setAllPayrolls(data);
                const processed = data.filter(p => p.status === 'processed' || p.status === 'paid').length;
                const pending = data.filter(p => p.status === 'pending').length;
                setProcessedCount(processed);
                setPendingCount(pending);
            }
        } catch (err) {
            console.error('Error fetching payrolls', err);
        }

        // benefit requests (all)
        try {
            const bresp = await fetch('http://localhost:5000/api/payroll/benefit-requests/all');
            if (bresp.ok) {
                const bdata = await bresp.json();
                setBenefitRequestsAll(bdata);
            }
        } catch (err) {
            console.error('Error fetching benefit requests (all)', err);
        }
    };

    const fetchPayrollRecords = async () => {
        if (!employee) return;

        try {
            const response = await fetch(`http://localhost:5000/api/payroll/employee/${employee._id}`);
            const data = await response.json();

            if (response.ok) {
                setPayrollRecords(data);
            }
        } catch (error) {
            console.error('Error fetching payroll:', error);
        }
    };

    const fetchBenefitRequests = async () => {
        if (!employee) return;

        try {
            const response = await fetch(`http://localhost:5000/api/payroll/benefit-requests/employee/${employee._id}`);
            const data = await response.json();

            if (response.ok) {
                setBenefitRequests(data);
            }
        } catch (error) {
            console.error('Error fetching benefit requests:', error);
        }
    };

    const fetchAllEmployees = async () => {
        try {
            const resp = await fetch('http://localhost:5000/api/users/active');
            if (!resp.ok) return;
            const data = await resp.json();
            setAllEmployees(data);
            if (data.length > 0) setSelectedEmployeeId(data[0]._id);
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    const fetchPayrollForEmployeeMonth = async (employeeId, month, year) => {
        try {
            const resp = await fetch(`http://localhost:5000/api/payroll/all?employeeId=${employeeId}&month=${month}&year=${year}`);
            if (!resp.ok) return;
            const data = await resp.json();
            setPayrollRecords(data);
        } catch (err) {
            console.error('Error fetching payroll for employee:', err);
        }
    };

    const handlePayrollAction = async (payrollId, action) => {
        // action: 'process' -> processed, 'paid' -> paid (prompt for date), 'reject' -> set to pending (no backend note support)
        try {
            if (action === 'paid') {
                const paymentDate = prompt('Enter payment date (YYYY-MM-DD) or leave empty for today:');
                const body = { status: 'paid' };
                if (paymentDate) body.paymentDate = paymentDate;
                const resp = await fetch(`http://localhost:5000/api/payroll/${payrollId}/status`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
                });
                if (!resp.ok) throw new Error('Could not mark paid');
                await loadHRData();
                return;
            }

            if (action === 'process') {
                const resp = await fetch(`http://localhost:5000/api/payroll/${payrollId}/status`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'processed' })
                });
                if (!resp.ok) throw new Error('Could not process payroll');
                await loadHRData();
                return;
            }

            if (action === 'reject') {
                // Backend currently doesn't support storing rejection reason on payroll. We'll set status back to 'pending'.
                const reason = prompt('Enter rejection reason (note: backend does not currently persist this reason):');
                const resp = await fetch(`http://localhost:5000/api/payroll/${payrollId}/status`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'pending' })
                });
                if (!resp.ok) throw new Error('Could not change payroll to pending');
                await loadHRData();
                alert('Payroll marked pending. To persist rejection reason, backend support is required.');
                return;
            }
        } catch (err) {
            console.error('Payroll action error', err);
            alert(err.message || 'Action failed');
        }
    };

    const viewPayroll = (p) => {
        setPayrollView(p);
    };

    const closePayrollView = () => setPayrollView(null);

    // Benefit requests actions (HR)
    const handleBenefitAction = async (id, status, hrComments = '') => {
        try {
            const resp = await fetch(`http://localhost:5000/api/payroll/benefit-request/${id}/status`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, hrComments, approvedBy: employee._id })
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || 'Failed');
            await loadHRData();
            fetchBenefitRequests();
        } catch (err) {
            console.error('Benefit action error', err);
            alert(err.message || 'Action failed');
        }
    };

    const openDeclineModal = (id) => setDeclineModal({ open: true, id, reason: '' });
    const closeDeclineModal = () => setDeclineModal({ open: false, id: null, reason: '' });
    const submitDecline = async () => {
        if (!declineModal.reason) { alert('Please enter reason'); return; }
        await handleBenefitAction(declineModal.id, 'rejected', declineModal.reason);
        closeDeclineModal();
    };

    const generatePayrollForEmployee = async (employeeId) => {
        try {
            const resp = await fetch('http://localhost:5000/api/payroll/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId, month: hrPayrollMonth, year: hrPayrollYear })
            });
            const data = await resp.json();
            if (resp.ok) {
                alert('Payroll generated successfully.');
                fetchPayrollForEmployeeMonth(employeeId, hrPayrollMonth, hrPayrollYear);
            } else {
                alert(data.message || 'Failed to generate payroll');
            }
        } catch (err) {
            console.error('Error generating payroll:', err);
            alert('Network error generating payroll');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitBenefitRequest = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/payroll/benefit-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId: employee._id,
                    benefitType: formData.benefitType,
                    description: formData.description,
                    amount: formData.amount ? parseFloat(formData.amount) : undefined
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Benefit request submitted successfully.');
                setIsRequesting(false);
                setFormData({
                    benefitType: 'health-insurance',
                    description: '',
                    amount: ''
                });
                fetchBenefitRequests();
            } else {
                setMessage(data.message || 'Failed to submit benefit request.');
            }
        } catch (error) {
            console.error('Error submitting benefit request:', error);
            setMessage('Network error. Please try again.');
        }

        setIsSubmitting(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'green';
            case 'rejected': return 'red';
            case 'pending': return 'orange';
            case 'paid': return 'green';
            case 'processed': return 'blue';
            default: return 'gray';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return (
        <div className="employee-payroll">
            <h2>Payroll & Benefits</h2>

            {message && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            <div className="payroll-summary">
                {/* <div className="summary-card">
                    <h3>Current Salary</h3>
                    <p className="salary">{employee?.salary ? formatCurrency(employee.salary) : (employee?.pendingSalary ? `${formatCurrency(employee.pendingSalary)} (Pending Approval)` : 'Not set')}{employee?.salary && employee?.pendingSalary ? ` (Pending: ${formatCurrency(employee.pendingSalary)})` : ''}</p>
                </div>
                <div className="summary-card">
                    <h3>Current Deductions</h3>
                    <p className="deductions">{formatCurrency(employee?.deductions || 0)}</p>
                </div>
                <div className="summary-card">
                    <h3>Current Additions</h3>
                    <p className="additions">{formatCurrency(employee?.additions || 0)}</p>
                </div> */}
                <div className="request-action">
                    <button
                        onClick={() => setIsRequesting(!isRequesting)}
                        className="request-btn"
                    >
                        {isRequesting ? 'Cancel Request' : 'Request Benefit'}
                    </button>
                </div>
            </div>

            {/* HR payroll management */}
            {employee?.role === 'hr' && (
                <div style={{ margin: '1.5rem 0', background: 'white', padding: 16, borderRadius: 8 }}>
                    <h3>HR Payroll Management</h3>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        <div className="summary-card">
                            <div style={{ fontWeight: 700, color: '#666' }}>Total Employees</div>
                            <div style={{ fontSize: 18, marginTop: 6 }}>{totalEmployees}</div>
                        </div>
                        <div className="summary-card">
                            <div style={{ fontWeight: 700, color: '#666' }}>Processed Payrolls</div>
                            <div style={{ fontSize: 18, marginTop: 6 }}>{processedCount}</div>
                        </div>
                        <div className="summary-card">
                            <div style={{ fontWeight: 700, color: '#666' }}>Pending Payrolls</div>
                            <div style={{ fontSize: 18, marginTop: 6 }}>{pendingCount}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                        <label style={{ fontWeight: 600 }}>Employee:</label>
                        <select value={selectedEmployeeId || ''} onChange={(e) => setSelectedEmployeeId(e.target.value)}>
                            {allEmployees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.employeeId})</option>
                            ))}
                        </select>
                        <label style={{ fontWeight: 600 }}>Month:</label>
                        <select value={hrPayrollMonth} onChange={(e) => setHrPayrollMonth(parseInt(e.target.value))}>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en-US', { month: 'long' })}</option>
                            ))}
                        </select>
                        <label style={{ fontWeight: 600 }}>Year:</label>
                        <input type="number" value={hrPayrollYear} onChange={(e) => setHrPayrollYear(parseInt(e.target.value))} style={{ width: 100 }} />
                        <button className="request-btn" onClick={() => selectedEmployeeId && fetchPayrollForEmployeeMonth(selectedEmployeeId, hrPayrollMonth, hrPayrollYear)}>Load</button>
                        <button className="request-btn" onClick={() => selectedEmployeeId && generatePayrollForEmployee(selectedEmployeeId)}>Generate Payroll</button>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <h4>Payrolls for {new Date(hrPayrollYear, hrPayrollMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h4>
                        <div className="payroll-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Email</th>
                                        <th>Amount</th>
                                        <th>Created</th>
                                        <th>Status</th>
                                        <th>Credited</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allPayrolls.length > 0 ? (
                                        allPayrolls.map((p) => (
                                            <tr key={p._id}>
                                                <td>{p.employeeId?.fullName || p.employeeId}</td>
                                                <td>{(allEmployees.find(a => a._id === (p.employeeId?._id || p.employeeId)) || {}).email || '-'}</td>
                                                <td>{formatCurrency(p.totalSalary)}</td>
                                                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                                <td><span className={`status-badge ${getStatusColor(p.status)}`}>{p.status}</span></td>
                                                <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : ''}</td>
                                                <td>
                                                    <button className="request-btn" onClick={() => viewPayroll(p)}>View</button>
                                                    {p.status === 'pending' && <button style={{ marginLeft: 8 }} className="request-btn" onClick={() => handlePayrollAction(p._id, 'process')}>Process</button>}
                                                    {(p.status === 'processed' || p.status === 'pending') && <button style={{ marginLeft: 8 }} className="request-btn" onClick={() => handlePayrollAction(p._id, 'paid')}>Mark Paid</button>}
                                                    <button style={{ marginLeft: 8 }} className="request-btn" onClick={() => handlePayrollAction(p._id, 'reject')}>Reject</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="no-data">No payroll records for this month</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Benefit requests (all) for HR */}
                    <div style={{ marginTop: 18 }}>
                        <h4>All Benefit Requests</h4>
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
                                    {benefitRequestsAll.length > 0 ? (
                                        benefitRequestsAll.map((b) => (
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="no-data">No benefit requests found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {isRequesting && (
                <div className="benefit-request-form">
                    <h3>New Benefit Request</h3>
                    <form onSubmit={handleSubmitBenefitRequest}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="benefitType">Benefit Type</label>
                                <select
                                    id="benefitType"
                                    name="benefitType"
                                    value={formData.benefitType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="health-insurance">Health Insurance</option>
                                    <option value="gym-membership">Gym Membership</option>
                                    <option value="transport-allowance">Transport Allowance</option>
                                    <option value="meal-allowance">Meal Allowance</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="amount">Amount (Optional)</label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder="Enter amount if applicable"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    required
                                    placeholder="Please describe your benefit request"
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="payroll-history">
                <h3>Payroll History</h3>
                <div className="payroll-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Month/Year</th>
                                <th>Base Salary</th>
                                <th>Deductions</th>
                                <th>Additions</th>
                                <th>Total Salary</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrollRecords.length > 0 ? (
                                payrollRecords.map((record) => (
                                    <tr key={record._id}>
                                        <td>{`${record.month}/${record.year}`}</td>
                                        <td>{formatCurrency(record.baseSalary)}</td>
                                        <td>{formatCurrency(record.deductions)}</td>
                                        <td>{formatCurrency(record.additions)}</td>
                                        <td>{formatCurrency(record.totalSalary)}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-data">No payroll records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="benefit-history">
                <h3>Benefit Requests</h3>
                <div className="benefit-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {benefitRequests.length > 0 ? (
                                benefitRequests.map((request) => (
                                    <tr key={request._id}>
                                        <td>{request.benefitType.replace('-', ' ').toUpperCase()}</td>
                                        <td>{request.description}</td>
                                        <td>{request.amount ? formatCurrency(request.amount) : 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td>{request.hrComments || 'N/A'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">No benefit requests found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Payroll view modal */}
            {payrollView && (
                <div className="modal-overlay" onClick={closePayrollView}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h4>Payroll Details - {payrollView.employeeId?.fullName || ''}</h4>
                        <p><strong>Month/Year:</strong> {payrollView.month}/{payrollView.year}</p>
                        <p><strong>Base Salary:</strong> {formatCurrency(payrollView.baseSalary)}</p>
                        <p><strong>Deductions:</strong> {formatCurrency(payrollView.deductions)}</p>
                        <p><strong>Additions:</strong> {formatCurrency(payrollView.additions)}</p>
                        <p><strong>Total:</strong> {formatCurrency(payrollView.totalSalary)}</p>
                        <p><strong>Notes / Breakdown:</strong></p>
                        <div style={{ background: '#fafafa', padding: 8, borderRadius: 4 }}>{payrollView.notes || 'No breakdown available'}</div>
                        <div style={{ marginTop: 12, textAlign: 'right' }}>
                            <button onClick={closePayrollView}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Decline modal for benefit requests */}
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
        </div>
    );
};

export default EmployeePayroll;

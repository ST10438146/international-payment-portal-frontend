import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { paymentAPI } from '../services/api';

const EmployeePortal = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getAllPayments(statusFilter);
      setPayments(response.data.payments);
      setSelectedPayments([]);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setErrorMessage('Error fetching payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId) => {
    try {
      await paymentAPI.verifyPayment(paymentId);
      setSuccessMessage('Payment verified successfully');
      fetchPayments();
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error verifying payment');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentId)) {
        return prev.filter(id => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === payments.filter(p => p.status === 'verified').length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.filter(p => p.status === 'verified').map(p => p._id));
    }
  };

  const handleSubmitToSwift = async () => {
    if (selectedPayments.length === 0) {
      setErrorMessage('Please select at least one payment to submit');
      return;
    }

    if (!window.confirm(`Submit ${selectedPayments.length} payment(s) to SWIFT?`)) {
      return;
    }

    setSubmitLoading(true);
    try {
      await paymentAPI.submitToSwift(selectedPayments);
      setSuccessMessage(`Successfully submitted ${selectedPayments.length} payment(s) to SWIFT`);
      setSelectedPayments([]);
      fetchPayments();
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error submitting to SWIFT');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      verified: 'badge-info',
      submitted: 'badge-success',
      completed: 'badge-success',
      rejected: 'badge-error',
    };
    return badges[status] || 'badge-ghost';
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">
            🏦 International Bank - Employee Portal
          </a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost">
              <div className="flex items-center gap-2">
                <div className="avatar placeholder">
                  <div className="bg-secondary text-secondary-content rounded-full w-10">
                    <span className="text-xl">{user?.fullName?.charAt(0) || 'E'}</span>
                  </div>
                </div>
                <span className="hidden md:inline">{user?.fullName}</span>
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span>Employee Portal</span>
              </li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">International Payment Verification</h1>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-bordered"
            >
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="submitted">Submitted</option>
            </select>
            
            <button
              onClick={fetchPayments}
              className="btn btn-square"
              title="Refresh"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="alert alert-success mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit to SWIFT Button */}
        {statusFilter === 'verified' && selectedPayments.length > 0 && (
          <div className="card bg-primary text-primary-content mb-6">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="card-title">{selectedPayments.length} payment(s) selected</h3>
                  <p>Ready to submit to SWIFT</p>
                </div>
                <button
                  onClick={handleSubmitToSwift}
                  className={`btn btn-secondary btn-lg ${submitLoading ? 'loading' : ''}`}
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Submitting...' : 'Submit to SWIFT'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payments Table */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-base-content/60">No payments found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      {statusFilter === 'verified' && (
                        <th>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedPayments.length === payments.length && payments.length > 0}
                            onChange={handleSelectAll}
                          />
                        </th>
                      )}
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Payee Details</th>
                      <th>SWIFT Code</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment._id}>
                        {statusFilter === 'verified' && (
                          <td>
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={selectedPayments.includes(payment._id)}
                              onChange={() => handleSelectPayment(payment._id)}
                            />
                          </td>
                        )}
                        <td>
                          <div>{new Date(payment.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs opacity-50">
                            {new Date(payment.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td>
                          <div className="font-semibold">{payment.userId?.fullName}</div>
                          <div className="text-sm opacity-50">
                            Acc: {payment.userId?.accountNumber}
                          </div>
                        </td>
                        <td className="font-bold">
                          {formatCurrency(payment.amount, payment.currency)}
                        </td>
                        <td>
                          <div className="font-semibold">{payment.payeeAccountName}</div>
                          <div className="text-sm">{payment.payeeBankName}</div>
                          <div className="text-xs opacity-50">
                            Acc: {payment.payeeAccountNumber}
                          </div>
                        </td>
                        <td className="font-mono text-sm">{payment.swiftCode}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(payment.status)}`}>
                            {payment.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {payment.status === 'pending' && (
                            <button
                              onClick={() => handleVerify(payment._id)}
                              className="btn btn-sm btn-success"
                            >
                              Verify
                            </button>
                          )}
                          {payment.status === 'verified' && (
                            <span className="text-xs opacity-50">
                              Verified by {payment.verifiedBy?.fullName}
                            </span>
                          )}
                          {payment.status === 'submitted' && (
                            <span className="text-xs opacity-50">
                              Submitted on {new Date(payment.submittedAt).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-figure text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-title">Pending Payments</div>
            <div className="stat-value text-warning">
              {payments.filter(p => p.status === 'pending').length}
            </div>
          </div>

          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-title">Verified Payments</div>
            <div className="stat-value text-info">
              {payments.filter(p => p.status === 'verified').length}
            </div>
          </div>

          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-figure text-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="stat-title">Submitted to SWIFT</div>
            <div className="stat-value text-success">
              {payments.filter(p => p.status === 'submitted').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePortal;
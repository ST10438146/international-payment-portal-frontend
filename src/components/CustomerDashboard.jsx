import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { paymentAPI } from '../services/api';
import { validateField, sanitizeInput } from '../utils/validation';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('new-payment');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    provider: 'SWIFT',
    payeeAccountNumber: '',
    payeeAccountName: '',
    payeeBankName: '',
    swiftCode: '',
  });

  const currencies = ['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'AUD', 'CAD', 'CHF'];

  useEffect(() => {
    if (activeTab === 'my-payments') {
      fetchPayments();
    }
  }, [activeTab]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getMyPayments();
      setPayments(response.data.payments);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitized = sanitizeInput(value);
    
    if (name === 'swiftCode') {
      sanitized = sanitized.toUpperCase();
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitized
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(field => {
      if (field !== 'provider') {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitLoading(true);
    setSuccessMessage('');
    
    try {
      await paymentAPI.create(formData);
      
      setSuccessMessage('Payment submitted successfully! It will be reviewed by our staff.');
      
      setFormData({
        amount: '',
        currency: 'USD',
        provider: 'SWIFT',
        payeeAccountNumber: '',
        payeeAccountName: '',
        payeeBankName: '',
        swiftCode: '',
      });
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (err) {
      const message = err.response?.data?.message || 'Error submitting payment';
      setErrors({ general: message });
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

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">
            🏦 International Bank - Customer Portal
          </a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost">
              <div className="flex items-center gap-2">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-10">
                    <span className="text-xl">{user?.fullName?.charAt(0) || 'U'}</span>
                  </div>
                </div>
                <span className="hidden md:inline">{user?.fullName}</span>
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span>Account: {user?.accountNumber}</span>
              </li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab ${activeTab === 'new-payment' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('new-payment')}
          >
            New Payment
          </button>
          <button
            className={`tab ${activeTab === 'my-payments' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('my-payments')}
          >
            My Payments
          </button>
        </div>

        {/* New Payment Tab */}
        {activeTab === 'new-payment' && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Create International Payment</h2>
              
              {successMessage && (
                <div className="alert alert-success mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{successMessage}</span>
                </div>
              )}
              
              {errors.general && (
                <div className="alert alert-error mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Amount</span>
                    </label>
                    <input
                      type="text"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className={`input input-bordered ${errors.amount ? 'input-error' : ''}`}
                      placeholder="0.00"
                      required
                    />
                    {errors.amount && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.amount}</span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Currency</span>
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="select select-bordered"
                      required
                    >
                      {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Provider</span>
                  </label>
                  <input
                    type="text"
                    value="SWIFT"
                    className="input input-bordered"
                    disabled
                  />
                  <label className="label">
                    <span className="label-text-alt">Only SWIFT is supported</span>
                  </label>
                </div>

                <div className="divider">Payee Information</div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Payee Account Name</span>
                  </label>
                  <input
                    type="text"
                    name="payeeAccountName"
                    value={formData.payeeAccountName}
                    onChange={handleChange}
                    className={`input input-bordered ${errors.payeeAccountName ? 'input-error' : ''}`}
                    placeholder="Full name of account holder"
                    required
                  />
                  {errors.payeeAccountName && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.payeeAccountName}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Payee Account Number</span>
                  </label>
                  <input
                    type="text"
                    name="payeeAccountNumber"
                    value={formData.payeeAccountNumber}
                    onChange={handleChange}
                    className={`input input-bordered ${errors.payeeAccountNumber ? 'input-error' : ''}`}
                    placeholder="Account number"
                    required
                  />
                  {errors.payeeAccountNumber && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.payeeAccountNumber}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Payee Bank Name</span>
                  </label>
                  <input
                    type="text"
                    name="payeeBankName"
                    value={formData.payeeBankName}
                    onChange={handleChange}
                    className={`input input-bordered ${errors.payeeBankName ? 'input-error' : ''}`}
                    placeholder="Bank name"
                    required
                  />
                  {errors.payeeBankName && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.payeeBankName}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">SWIFT Code</span>
                  </label>
                  <input
                    type="text"
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleChange}
                    className={`input input-bordered ${errors.swiftCode ? 'input-error' : ''}`}
                    placeholder="AAAABBCCXXX"
                    maxLength="11"
                    required
                  />
                  {errors.swiftCode && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.swiftCode}</span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt">8 or 11 characters (e.g., ABNANL2A or ABNANL2AXXX)</span>
                  </label>
                </div>

                <div className="card-actions justify-end mt-6">
                  <button
                    type="submit"
                    className={`btn btn-primary btn-lg ${submitLoading ? 'loading' : ''}`}
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Processing...' : 'Pay Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Payments Tab */}
        {activeTab === 'my-payments' && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">My Payment History</h2>
              
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
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th>Payee</th>
                        <th>SWIFT Code</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment._id}>
                          <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                          <td>{payment.amount.toFixed(2)}</td>
                          <td>{payment.currency}</td>
                          <td>
                            <div className="font-semibold">{payment.payeeAccountName}</div>
                            <div className="text-sm opacity-50">{payment.payeeBankName}</div>
                          </td>
                          <td className="font-mono">{payment.swiftCode}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(payment.status)}`}>
                              {payment.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
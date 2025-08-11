import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI, paymentsAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useMetaMask } from '../hooks/useMetaMask';

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    salary: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentStep, setPaymentStep] = useState('requirements'); // requirements, payment, success
  const [paymentRequirements, setPaymentRequirements] = useState(null);
  const [transaction, setTransaction] = useState(null);
  
  const { user } = useAuth();
  const { account, isConnected, sendPayment } = useMetaMask();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPaymentRequirements();
  }, [user, navigate]);

  const fetchPaymentRequirements = async () => {
    try {
      const response = await paymentsAPI.getRequirements();
      setPaymentRequirements(response.data);
    } catch (err) {
      console.error('Failed to fetch payment requirements:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.salary) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const amountRequired = Number(paymentRequirements?.amount || 0);

      // Zero-amount flow: skip wallet/payment entirely
      if (amountRequired <= 0) {
        const paymentResponse = await paymentsAPI.initiatePayment({ amount: 0, fromAddress: 'N/A' });
        // Mark completed (verify without txHash)
        await paymentsAPI.verifyPayment({ transactionId: paymentResponse.data.transaction.id });
        // Create job posting
        const jobData = {
          ...formData,
          skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
          salary: parseFloat(formData.salary)
        };
        await jobsAPI.createJob(jobData);
        setPaymentStep('success');
        setSuccess('Job posted successfully!');
        return;
      }

      // Paid flow: require wallet
      if (!account) {
        setError('Please connect your wallet to post a job');
        setLoading(false);
        return;
      }

      // Initiate payment (send fromAddress)
      const paymentResponse = await paymentsAPI.initiatePayment({
        amount: amountRequired,
        fromAddress: account
      });

      setTransaction(paymentResponse.data.transaction);
      setPaymentStep('payment');
    } catch (err) {
      setError('Failed to initiate payment');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Send payment via MetaMask
      const paymentResult = await sendPayment(
        paymentRequirements.adminWallet,
        paymentRequirements.amount
      );

      if (!paymentResult.success) {
        setError(paymentResult.error || 'Payment failed');
        return;
      }

      // Verify payment with backend
      await paymentsAPI.verifyPayment({
        txHash: paymentResult.txHash,
        transactionId: transaction.id
      });

      // Create job posting
      const jobData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        salary: parseFloat(formData.salary)
      };

      await jobsAPI.createJob(jobData);
      
      setPaymentStep('success');
      setSuccess('Job posted successfully!');
    } catch (err) {
      setError('Failed to complete payment or post job');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRequirements = () => {
    setPaymentStep('requirements');
    setTransaction(null);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Post a New Job
        </h1>
        <p className="text-gray-600">
          Reach qualified candidates and find the perfect hire for your team
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
          {success}
        </div>
      )}

      {/* Payment Requirements Step */}
      {paymentStep === 'requirements' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Payment Requirements
          </h2>
          {paymentRequirements && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Amount:</strong> {paymentRequirements.amount} {paymentRequirements.currency}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {paymentRequirements.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">
                    Admin Wallet: {paymentRequirements.adminWallet.slice(0, 6)}...{paymentRequirements.adminWallet.slice(-4)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Connection Status */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Wallet Status</h3>
            {Number(paymentRequirements?.amount || 0) <= 0 ? (
              <div className="text-green-600">No payment required.</div>
            ) : account ? (
              <div className="flex items-center space-x-2 text-green-600">
                <span>✅ Connected</span>
                <span className="text-sm text-gray-600">
                  ({`${account.slice(0, 6)}...${account.slice(-4)}`})
                </span>
              </div>
            ) : (
              <div className="text-red-600">
                ❌ Wallet not connected. Please connect your MetaMask wallet to continue.
              </div>
            )}
          </div>

          {/* Job Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Senior React Developer"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows="6"
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe the role, responsibilities, and requirements..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., React, Node.js, MongoDB"
                />
              </div>

              <div>
                <label htmlFor="salary" className="block text sm font-medium text-gray-700 mb-1">
                  Annual Salary (USD) *
                </label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  required
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 120000"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., San Francisco, Remote"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Step */}
      {paymentStep === 'payment' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Complete Payment
          </h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Payment Details
            </h3>
            <div className="space-y-2 text-sm text-yellow-700">
              <p><strong>Amount:</strong> {paymentRequirements.amount} {paymentRequirements.currency}</p>
              <p><strong>To:</strong> {paymentRequirements.adminWallet}</p>
              <p><strong>From:</strong> {account}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={handleBackToRequirements}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Payment...' : 'Pay & Post Job'}
            </button>
          </div>
        </div>
      )}

      {/* Success Step */}
      {paymentStep === 'success' && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Job Posted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your job has been posted and is now visible to candidates. You can view and manage your job postings from your profile.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              View All Jobs
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Go to Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostJob; 
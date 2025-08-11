import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useMetaMask } from '../hooks/useMetaMask';

const Payments = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(null);
  
  const { user } = useAuth();
  const { account, getBalance } = useMetaMask();

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchBalance();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const response = await paymentsAPI.getPaymentHistory();
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transaction history');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const balance = await getBalance();
      setBalance(balance);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">🔐</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Login Required
        </h3>
        <p className="text-gray-600">
          Please log in to view your payment history.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment History
        </h1>
        <p className="text-gray-600">
          View your blockchain transactions and payment status
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Wallet Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Wallet Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-sm font-medium text-gray-500">Connected Wallet</span>
            <p className="text-gray-900 font-mono text-sm mt-1">
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}
            </p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Balance</span>
            <p className="text-gray-900 font-mono text-sm mt-1">
              {balance ? `${parseFloat(balance).toFixed(6)} ETH` : 'Loading...'}
            </p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Total Transactions</span>
            <p className="text-gray-900 text-lg font-semibold mt-1">
              {transactions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Transaction History
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-600 mb-4">
              Your payment history will appear here once you make your first transaction.
            </p>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium">
              Post a Job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Hash
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Job Posting Payment
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.txHash ? (
                        <a
                          href={`https://goerli.etherscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 font-mono text-xs"
                        >
                          {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                        </a>
                      ) : (
                        <span className="text-gray-500">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">
          Payment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">How Payments Work:</h4>
            <ul className="space-y-1">
              <li>• Job postings require a small fee (0.001 ETH)</li>
              <li>• Payments are processed via MetaMask</li>
              <li>• All transactions are recorded on the blockchain</li>
              <li>• You can view transaction details on Etherscan</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Payment Status:</h4>
            <ul className="space-y-1">
              <li>• <span className="font-medium">Completed:</span> Payment successful</li>
              <li>• <span className="font-medium">Pending:</span> Payment in progress</li>
              <li>• <span className="font-medium">Failed:</span> Payment failed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments; 
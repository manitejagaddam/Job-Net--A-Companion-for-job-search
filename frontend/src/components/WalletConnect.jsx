import React, { useState } from 'react';
import { useMetaMask } from '../hooks/useMetaMask';
import { profileAPI } from '../utils/api';

const WalletConnect = () => {
  const { account, isConnected, connectWallet, disconnectWallet, error } = useMetaMask();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await connectWallet();
      if (result.success && result.account) {
        // Update user profile with wallet address
        try {
          await profileAPI.connectWallet(result.account);
        } catch (err) {
          console.error('Failed to update profile with wallet:', err);
        }
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">
        {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connected'}
      </span>
      <button
        onClick={handleDisconnect}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
      >
        Disconnect
      </button>
    </div>
  );
};

export default WalletConnect; 
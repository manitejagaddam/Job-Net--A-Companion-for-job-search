import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useMetaMask = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum;
  };

  // Initialize connection state on mount if already connected
  useEffect(() => {
    const init = async () => {
      try {
        if (!isMetaMaskInstalled()) return;
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          const acc = accounts[0];
          const prov = new ethers.BrowserProvider(window.ethereum);
          const sign = await prov.getSigner();
          setAccount(acc);
          setProvider(prov);
          setSigner(sign);
          setIsConnected(true);
        }
      } catch (e) {
        console.error('MetaMask init failed:', e);
      }
    };
    init();
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setError(null);
      
      if (!isMetaMaskInstalled()) {
        setError('MetaMask is not installed. Please install MetaMask to continue.');
        return { success: false, error: 'MetaMask not installed' };
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        setError('No accounts found');
        return { success: false, error: 'No accounts found' };
      }

      const acc = accounts[0];
      
      // Create provider and signer
      const prov = new ethers.BrowserProvider(window.ethereum);
      const sign = await prov.getSigner();

      setAccount(acc);
      setProvider(prov);
      setSigner(sign);
      setIsConnected(true);

      return { success: true, account: acc };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setError(null);
  };

  // Send payment
  const sendPayment = async (toAddress, amount) => {
    try {
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amount.toString())
      });

      return {
        success: true,
        txHash: tx.hash,
        amount: amount
      };
    } catch (error) {
      console.error('Payment failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Get account balance
  const getBalance = async () => {
    try {
      if (!provider || !account) {
        return null;
      }

      const balance = await provider.getBalance(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          disconnectWallet();
        } else if (account !== accounts[0]) {
          // User switched accounts
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  return {
    account,
    provider,
    signer,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    sendPayment,
    getBalance,
    isMetaMaskInstalled
  };
}; 
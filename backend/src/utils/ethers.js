const { ethers } = require('ethers');

// Initialize provider (Goerli testnet)
const provider = new ethers.JsonRpcProvider(
  `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
);

// Admin wallet for receiving payments
const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

const verifyTransaction = async (txHash) => {
  try {
    const tx = await provider.getTransaction(txHash);
    const receipt = await tx.wait();

    return {
      success: receipt.status === 1,
      from: tx.from,
      to: tx.to,
      amount: ethers.formatEther(tx.value),
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Transaction verification failed:', error);
    return { success: false, error: error.message };
  }
};

const sendPayment = async (fromWallet, amount) => {
  try {
    const tx = await fromWallet.sendTransaction({
      to: process.env.ADMIN_WALLET_ADDRESS,
      value: ethers.parseEther(amount.toString())
    });

    return {
      success: true,
      txHash: tx.hash,
      amount: amount
    };
  } catch (error) {
    console.error('Payment failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  provider,
  adminWallet,
  verifyTransaction,
  sendPayment
}; 
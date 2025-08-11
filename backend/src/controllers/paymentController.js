const { verifyTransaction } = require('../utils/ethers');
const { v4: uuidv4 } = require('uuid');

// Get payment requirements
const getPaymentRequirements = async (req, res) => {
  try {
    const amountEnv = process.env.PAYMENT_REQUIRED_AMOUNT;
    const amount = amountEnv !== undefined ? parseFloat(amountEnv) : 0.001;
    const currency = process.env.PAYMENT_CURRENCY || 'ETH';
    const network = process.env.PAYMENT_NETWORK || 'Goerli Testnet';

    res.json({
      amount,
      currency,
      network,
      adminWallet: process.env.ADMIN_WALLET_ADDRESS,
      description: amount > 0 ? 'Payment required to post a job' : 'No payment required to post a job'
    });
  } catch (error) {
    console.error('Get payment requirements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Initiate payment
const initiatePayment = async (req, res) => {
  try {
    const { amount, fromAddress, jobId } = req.body;
    const supabase = req.app.locals.supabase;

    // If zero-amount, create a completed transaction immediately
    if (!amount || Number(amount) <= 0) {
      const placeholderHash = `zero-${uuidv4()}`;
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert([
          {
            from_address: fromAddress || 'N/A',
            to_address: process.env.ADMIN_WALLET_ADDRESS || 'N/A',
            amount: 0,
            tx_hash: placeholderHash,
            job_id: jobId || null,
            status: 'completed'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Transaction creation error (zero-amount):', error);
        return res.status(500).json({ message: 'Error creating transaction' });
      }

      return res.json({
        message: 'Zero-amount flow: payment skipped',
        transaction,
        paymentDetails: null
      });
    }

    // Normal paid flow: create pending transaction
    const placeholderHash = `pending-${uuidv4()}`;
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([
        {
          from_address: fromAddress,
          to_address: process.env.ADMIN_WALLET_ADDRESS,
          amount: parseFloat(amount),
          tx_hash: placeholderHash, // unique placeholder to satisfy unique constraint
          job_id: jobId || null,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Transaction creation error:', error);
      return res.status(500).json({ message: 'Error creating transaction' });
    }

    res.json({
      message: 'Payment initiated',
      transaction,
      paymentDetails: {
        to: process.env.ADMIN_WALLET_ADDRESS,
        amount: amount,
        network: process.env.PAYMENT_NETWORK || 'Goerli Testnet'
      }
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { txHash, transactionId } = req.body;
    const supabase = req.app.locals.supabase;

    // If no txHash provided, treat as already completed (zero-amount path)
    if (!txHash) {
      const { data: updatedTransaction, error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transactionId)
        .select()
        .single();

      if (updateError) {
        console.error('Transaction update error (zero-amount):', updateError);
        return res.status(500).json({ message: 'Error updating transaction' });
      }

      return res.json({
        message: 'Zero-amount: marked completed',
        transaction: updatedTransaction
      });
    }

    // Normal paid verification
    const verification = await verifyTransaction(txHash);
    
    if (!verification.success) {
      return res.status(400).json({ 
        message: 'Transaction verification failed',
        error: verification.error 
      });
    }

    // Update transaction record
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        tx_hash: txHash,
        status: 'completed',
        amount: parseFloat(verification.amount)
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (updateError) {
      console.error('Transaction update error:', updateError);
      return res.status(500).json({ message: 'Error updating transaction' });
    }

    res.json({
      message: 'Payment verified successfully',
      transaction: updatedTransaction,
      verification
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        jobs(title)
      `)
      .eq('from_address', req.user.wallet)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get payment history error:', error);
      return res.status(500).json({ message: 'Error fetching payment history' });
    }

    res.json({ transactions: transactions || [] });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check payment status for a job
const checkPaymentStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const supabase = req.app.locals.supabase;

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('job_id', jobId)
      .eq('from_address', req.user.wallet)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Check payment status error:', error);
      return res.status(500).json({ message: 'Error checking payment status' });
    }

    res.json({
      hasPaid: !!transaction && transaction.status === 'completed',
      transaction: transaction || null
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPaymentRequirements,
  initiatePayment,
  verifyPayment,
  getPaymentHistory,
  checkPaymentStatus
}; 
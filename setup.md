# JobNet - Full-Stack Job & Networking Web Application Setup Guide

## 🚀 Overview
JobNet is a comprehensive job and networking platform inspired by Upwork and AngelList, featuring:
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: Supabase (PostgreSQL)
- **Web3**: MetaMask integration with Ethereum/Polygon testnet
- **AI/ML**: Google Gemini API for NLP features

## 📋 Prerequisites

### Required Software
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **MetaMask** browser extension

### Required Accounts & API Keys
1. **Supabase Account** - [Sign up here](https://supabase.com)
2. **Google AI Studio** - [Get Gemini API key here](https://makersuite.google.com/app/apikey)
3. **Infura Account** - [Sign up here](https://infura.io) for Ethereum RPC access
4. **Etherscan API Key** - [Get here](https://etherscan.io/apis)
5. **MetaMask Wallet** with testnet ETH/MATIC

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose organization and enter project name (e.g., "jobnet")
4. Set database password (save this!)
5. Choose region closest to you
6. Wait for project to be ready (5-10 minutes)

### 2. Get Project Credentials
1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

### 3. Create Database Tables
Run these SQL commands in your Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  bio TEXT DEFAULT '',
  linkedin VARCHAR(500) DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  wallet VARCHAR(255) DEFAULT '',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  salary DECIMAL(10,2) NOT NULL,
  location VARCHAR(255) DEFAULT '',
  posted_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_address VARCHAR(255) NOT NULL,
  to_address VARCHAR(255) NOT NULL,
  amount DECIMAL(18,8) NOT NULL,
  tx_hash VARCHAR(255) UNIQUE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Jobs are viewable by everyone" ON jobs FOR SELECT USING (true);
CREATE POLICY "Users can create jobs" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE USING (auth.uid()::text = posted_by::text);
CREATE POLICY "Users can delete own jobs" ON jobs FOR DELETE USING (auth.uid()::text = posted_by::text);

CREATE POLICY "Transactions are viewable by sender" ON transactions FOR SELECT USING (from_address = auth.jwt() ->> 'wallet');
CREATE POLICY "Transactions can be created by anyone" ON transactions FOR INSERT WITH CHECK (true);
```

## 🔑 Environment Variables

### Backend (.env)
Create `backend/.env` file:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_super_secret_jwt_key_here
ADMIN_WALLET_ADDRESS=your_admin_wallet_address
ADMIN_PRIVATE_KEY=your_admin_wallet_private_key
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
GEMINI_API_KEY=your_gemini_api_key
```

**How to get these values:**

1. **SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY**: From your Supabase project dashboard → Settings → API
2. **JWT_SECRET**: Generate a random string: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
3. **ADMIN_WALLET_ADDRESS**: Your MetaMask wallet address (the one that will receive payments)
4. **ADMIN_PRIVATE_KEY**: Your MetaMask wallet's private key (⚠️ Keep this secret!)
5. **INFURA_PROJECT_ID**: From [Infura](https://infura.io) dashboard → Create new project → Copy Project ID
6. **ETHERSCAN_API_KEY**: From [Etherscan](https://etherscan.io/apis) → Create account → Get API key
7. **GEMINI_API_KEY**: From [Google AI Studio](https://makersuite.google.com/app/apikey) → Create API key

### Frontend (.env)
Create `frontend/.env` file:

```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CHAIN_ID=5
REACT_APP_ADMIN_WALLET=your_admin_wallet_address
```

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```
Server will start on `http://localhost:5000`

### 3. Start Frontend Development Server
```bash
cd frontend
npm start
```
Frontend will open on `http://localhost:3000`

## 🔗 MetaMask Configuration

### 1. Install MetaMask
- Install [MetaMask extension](https://metamask.io/download/)
- Create or import wallet

### 2. Add Test Networks
**Goerli Testnet (Ethereum):**
- Network Name: Goerli Testnet
- RPC URL: `https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID`
- Chain ID: 5
- Currency Symbol: ETH
- Block Explorer: `https://goerli.etherscan.io`

**Mumbai Testnet (Polygon):**
- Network Name: Mumbai Testnet
- RPC URL: `https://rpc-mumbai.maticvigil.com`
- Chain ID: 80001
- Currency Symbol: MATIC
- Block Explorer: `https://mumbai.polygonscan.com`

### 3. Get Testnet Tokens
- **Goerli ETH**: [Goerli Faucet](https://goerlifaucet.com/)
- **Mumbai MATIC**: [Mumbai Faucet](https://faucet.polygon.technology/)

## 🧪 Testing the Application

### 1. User Registration
1. Open `http://localhost:3000`
2. Click "Sign Up"
3. Fill in details and optionally connect MetaMask
4. Verify account creation

### 2. Job Posting with Payment
1. Login to your account
2. Click "Post a Job"
3. Fill job details
4. Connect MetaMask if not already connected
5. Pay 0.001 ETH (or 0.01 MATIC) to admin wallet
6. Verify job posting appears in feed

### 3. AI Features
1. Go to "AI Tools" page
2. Test skill extraction from bio text
3. Get job recommendations based on your skills
4. Test job matching scores

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect your repository
4. Set environment variables
5. Deploy

### Environment Variables for Production
Update your production `.env` files with:
- Production Supabase credentials
- Production JWT secret
- Production admin wallet address
- Production API URLs

## 🔧 Troubleshooting

### Common Issues

**1. Supabase Connection Failed**
- Verify environment variables
- Check Supabase project status
- Ensure RLS policies are correct

**2. MetaMask Connection Issues**
- Check if MetaMask is unlocked
- Verify network configuration
- Ensure testnet tokens are available

**3. AI Features Not Working**
- Verify Gemini API key
- Check API quota limits
- Review console for error messages

**4. Payment Verification Failed**
- Check blockchain network
- Verify transaction hash
- Ensure admin wallet address is correct

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
DEBUG=*
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [MetaMask Developer Docs](https://docs.metamask.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎯 Next Steps

After successful setup:
1. **Customize UI/UX** - Modify Tailwind classes and components
2. **Add More AI Features** - Implement advanced NLP capabilities
3. **Enhance Blockchain Features** - Add smart contracts, more payment options
4. **Scale Database** - Optimize queries, add indexes
5. **Add Testing** - Implement unit and integration tests
6. **Security Hardening** - Add rate limiting, input validation

---

**Happy Coding! 🚀**

Your JobNet application is now ready with Supabase and Gemini AI integration! 
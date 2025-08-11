# 🚀 JobNet - Full-Stack Job & Networking Web Application

A comprehensive job and networking platform inspired by Upwork and AngelList, built with modern web technologies and AI integration.

[![License](https://img.shields.io/github/license/manitejagaddam/Job-Net--A-Companion-for-job-search?style=for-the-badge)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/manitejagaddam/Job-Net--A-Companion-for-job-search/ci.yml?branch=main&style=for-the-badge)](https://github.com/manitejagaddam/Job-Net--A-Companion-for-job-search/actions)

![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=for-the-badge)
![GitHub Last Commit](https://img.shields.io/github/last-commit/manitejagaddam/Job-Net--A-Companion-for-job-search?style=for-the-badge&color=yellow)
![GitHub Stars](https://img.shields.io/github/stars/manitejagaddam/Job-Net--A-Companion-for-job-search?style=for-the-badge&color=ff69b4)
![GitHub Issues](https://img.shields.io/github/issues/manitejagaddam/Job-Net--A-Companion-for-job-search?style=for-the-badge)


---



##  Tech Stack
![React](https://img.shields.io/badge/Frontend-React.js-61DBFB?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Framework-Express.js-000000?style=for-the-badge&logo=express)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)
![MetaMask](https://img.shields.io/badge/Web3-MetaMask-F6851B?style=for-the-badge&logo=metamask)
![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge&logo=google)

---

## ✨ Features

### 🔐 Authentication & Profile Management
- JWT-based user authentication
- User profiles with bio, LinkedIn, skills, and wallet address
- MetaMask wallet integration for Web3 identity

### 💼 Job Posting & Management
- Create and manage job postings
- Rich job descriptions with skill requirements
- Location-based job filtering
- User dashboard for posted jobs

### 💰 Blockchain Payment Integration
- MetaMask wallet connection
- Ethereum/Polygon testnet support
- Payment verification for job postings
- Transaction history tracking

### 🤖 AI-Powered Features
- **Google Gemini AI** integration for skill extraction
- Smart job-candidate matching
- Personalized job recommendations
- NLP-based skill parsing from resumes/bios

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Clean, professional interface
- Mobile-first approach
- Intuitive user experience

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Ethers.js** - Ethereum blockchain interaction

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Supabase** - PostgreSQL database with real-time features
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing

### Database
- **Supabase** - PostgreSQL cloud database
- **Row Level Security (RLS)** - Advanced security policies
- **Real-time subscriptions** - Live data updates

### Web3 & AI
- **MetaMask** - Ethereum wallet integration
- **Ethers.js** - Blockchain interaction library
- **Google Gemini AI** - Advanced AI/NLP capabilities
- **Testnet Support** - Goerli (Ethereum) & Mumbai (Polygon)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MetaMask browser extension
- Supabase account
- Google AI Studio account

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd jobnet
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

4. **Database Setup**
- Create Supabase project
- Run SQL commands from `setup.md`
- Configure environment variables

### Environment Variables

**Backend (.env)**
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
ADMIN_WALLET_ADDRESS=your_admin_wallet
ETHERSCAN_API_KEY=your_etherscan_key
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend (.env)**
```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CHAIN_ID=5
REACT_APP_ADMIN_WALLET=your_admin_wallet
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
jobnet/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utilities (AI, blockchain)
│   │   └── app.js         # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   ├── package.json
│   └── .env.example
├── setup.md               # Detailed setup guide
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Profile Management
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `PUT /profile/password` - Change password
- `PUT /profile/wallet` - Connect wallet

### Jobs
- `GET /jobs` - Get all jobs (with filters)
- `POST /jobs` - Create new job
- `GET /jobs/:id` - Get specific job
- `PUT /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job

### Payments
- `GET /payments/requirements` - Get payment requirements
- `POST /payments/initiate` - Start payment process
- `POST /payments/verify` - Verify transaction
- `GET /payments/history` - Get payment history

### AI Features
- `POST /ai/extract-skills` - Extract skills from text
- `GET /ai/match/:jobId` - Calculate job match score
- `GET /ai/recommendations` - Get job recommendations
- `POST /ai/update-skills` - Update user skills

## 🌟 Key Features Explained

### AI-Powered Skill Extraction
The application uses Google's Gemini AI to intelligently extract technical skills from user bios, resumes, and job descriptions. This provides:

- **Automatic skill detection** from natural language
- **Consistent skill formatting** across the platform
- **Fallback to keyword matching** if AI fails
- **Smart skill suggestions** for better matching

### Blockchain Integration
MetaMask integration enables:

- **Secure wallet connection** for user identity
- **Cryptocurrency payments** for job postings
- **Transaction verification** on the blockchain
- **Payment history tracking** for transparency

### Real-time Database
Supabase provides:

- **PostgreSQL database** with advanced features
- **Row Level Security** for data protection
- **Real-time subscriptions** for live updates
- **Automatic API generation** from database schema

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

### Backend (Render)
1. Push code to GitHub
2. Create Web Service on Render
3. Configure environment variables
4. Deploy and scale

### Database (Supabase)
- Production-ready PostgreSQL
- Automatic backups
- Built-in monitoring
- Global CDN

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📚 Documentation

- **Setup Guide**: See `setup.md` for detailed installation instructions
- **API Documentation**: Check the routes and controllers for endpoint details
- **Database Schema**: Review the SQL commands in `setup.md`

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcrypt
- **Row Level Security** in Supabase
- **CORS Protection** for API endpoints
- **Input Validation** and sanitization

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- MetaMask extension required

## 📱 Mobile Support

- Responsive design
- Touch-friendly interface
- Mobile-optimized forms
- Progressive Web App ready

## 🎯 Roadmap

### Phase 2 Features
- [ ] Real-time messaging between users
- [ ] Advanced job search filters
- [ ] Company profiles and verification
- [ ] Smart contract integration
- [ ] Multi-language support

### Phase 3 Features
- [ ] Video interviews integration
- [ ] Advanced analytics dashboard
- [ ] Machine learning job matching
- [ ] Mobile app development
- [ ] Enterprise features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing database platform
- **Google AI** for Gemini API access
- **Ethereum Foundation** for blockchain technology
- **Tailwind CSS** for the beautiful UI framework
- **React Team** for the incredible frontend framework

## 📞 Support

- **Documentation**: Check `setup.md` for detailed setup
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

---

**Built with ❤️ Mani Teja**

Your JobNet application is ready to revolutionize job searching and networking! 🚀 
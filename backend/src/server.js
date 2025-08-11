require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const jobRoutes = require('./routes/jobs');
const paymentRoutes = require('./routes/payments');
const aiRoutes = require('./routes/ai');

const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Make supabase available to all routes
app.locals.supabase = supabase;

// CORS configuration — allow only your Vercel frontend & localhost for dev
app.use(cors({
  origin: [
    'http://localhost:3000', // local dev
    'https://job-net-a-companion-for-job-search.vercel.app' // production frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// API routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/jobs', jobRoutes);
app.use('/payments', paymentRoutes);
app.use('/ai', aiRoutes);

// Root route for Render health check / friendly message
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'JobNet Backend API is running 🚀',
    endpoints: [
      '/auth',
      '/profile',
      '/jobs',
      '/payments',
      '/ai'
    ]
  });
});

// Test Supabase connection & start server
const PORT = process.env.PORT || 5000;

supabase.auth.getUser()
  .then(() => {
    console.log('✅ Connected to Supabase successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Failed to connect to Supabase:', err);
    process.exit(1);
  });

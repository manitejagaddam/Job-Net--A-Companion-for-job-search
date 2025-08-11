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
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Make supabase available to all routes
app.locals.supabase = supabase;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/jobs', jobRoutes);
app.use('/payments', paymentRoutes);
app.use('/ai', aiRoutes);

// Test Supabase connection
const PORT = process.env.PORT || 5000;

supabase.auth.getUser()
  .then(() => {
    console.log('Connected to Supabase successfully');
    app.listen(PORT, () => console.log('Server running on port PORT'));
  })
  .catch(err => {
    console.error('Failed to connect to Supabase:', err);
    process.exit(1);
  }); 
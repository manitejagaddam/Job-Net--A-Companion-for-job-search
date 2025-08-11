const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  updatePassword, 
  connectWallet, 
  getUserById, 
  searchUsers 
} = require('../controllers/profileController');
const auth = require('../middleware/auth');

// GET /profile (protected route)
router.get('/', auth, getProfile);

// PUT /profile (protected route)
router.put('/', auth, updateProfile);

// PUT /profile/password (protected route)
router.put('/password', auth, updatePassword);

// POST /profile/wallet (protected route)
router.post('/wallet', auth, connectWallet);

// GET /profile/:id (public route)
router.get('/:id', getUserById);

// GET /profile/search (public route)
router.get('/search', searchUsers);

module.exports = router; 
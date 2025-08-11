const express = require('express');
const router = express.Router();
const { signup, login, getCurrentUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST /auth/signup
router.post('/signup', signup);

// POST /auth/login
router.post('/login', login);

// GET /auth/me (protected route)
router.get('/me', auth, getCurrentUser);

module.exports = router; 
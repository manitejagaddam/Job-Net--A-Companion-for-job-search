const express = require('express');
const router = express.Router();
const { 
  extractSkillsFromText, 
  calculateJobMatch, 
  getRecommendations, 
  updateSkillsFromText, 
  getSimilarJobs 
} = require('../controllers/aiController');
const auth = require('../middleware/auth');

// POST /ai/extract-skills (public route)
router.post('/extract-skills', extractSkillsFromText);

// GET /ai/match/:jobId (protected route)
router.get('/match/:jobId', auth, calculateJobMatch);

// GET /ai/recommendations (protected route)
router.get('/recommendations', auth, getRecommendations);

// POST /ai/update-skills (protected route)
router.post('/update-skills', auth, updateSkillsFromText);

// GET /ai/similar/:jobId (public route)
router.get('/similar/:jobId', getSimilarJobs);

module.exports = router; 
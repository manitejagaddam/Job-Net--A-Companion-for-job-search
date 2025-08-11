const express = require('express');
const router = express.Router();
const { 
  createJob, 
  getJobs, 
  getJobById, 
  updateJob, 
  deleteJob, 
  getUserJobs 
} = require('../controllers/jobController');
const auth = require('../middleware/auth');

// GET /jobs (public route)
router.get('/', getJobs);

// GET /jobs/:id (public route)
router.get('/:id', getJobById);

// POST /jobs (protected route)
router.post('/', auth, createJob);

// PUT /jobs/:id (protected route)
router.put('/:id', auth, updateJob);

// DELETE /jobs/:id (protected route)
router.delete('/:id', auth, deleteJob);

// GET /jobs/user/my (protected route)
router.get('/user/my', auth, getUserJobs);

module.exports = router; 
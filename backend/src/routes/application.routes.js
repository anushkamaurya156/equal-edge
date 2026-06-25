const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/application.controller');

router.post('/', auth, applyToJob);
router.get('/me', auth, getMyApplications);
router.get('/job/:jobId', auth, getJobApplications);
router.patch('/:id/status', auth, updateApplicationStatus);

module.exports = router;

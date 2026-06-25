const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  matchJobs,
  checkResume,
  matchSchemes
} = require('../controllers/ai.controller');

router.post('/match-jobs', auth, matchJobs);
router.post('/check-resume', auth, checkResume);
router.post('/match-schemes', auth, matchSchemes);

module.exports = router;

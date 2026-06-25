const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getMyProfile, 
  createOrUpdateProfile, 
  uploadResume, 
  upload 
} = require('../controllers/profile.controller');

router.get('/me', auth, getMyProfile);
router.put('/', auth, createOrUpdateProfile);
router.post('/', auth, createOrUpdateProfile);
router.post('/upload', auth, upload.single('resume'), uploadResume);
router.post('/upload-certificate', auth, upload.single('disabilityCertificate'), uploadResume);

module.exports = router;

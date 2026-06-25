const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getEmployerJobs
} = require('../controllers/job.controller');

router.get('/', getAllJobs);
router.post('/', auth, createJob);
router.get('/employer', auth, getEmployerJobs);
router.get('/:id', getJobById);
router.put('/:id', auth, updateJob);
router.delete('/:id', auth, deleteJob);

module.exports = router;

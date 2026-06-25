const Application = require('../models/Application');
const Job = require('../models/Job');
const Profile = require('../models/Profile');

// Apply to job (jobseeker only)
exports.applyToJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied. Job seekers only.' });
    }

    const { jobId, coverLetter } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      applicantId: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job.' });
    }

    const application = new Application({
      jobId,
      applicantId: req.user.id,
      coverLetter
    });

    await application.save();

    res.status(201).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// Get job seeker's own applications
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicantId: req.user.id })
      .populate({
        path: 'jobId',
        select: 'title company location workType jobType accessibilityFeatures'
      })
      .sort({ appliedAt: -1 });

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// Get all applications for a specific job (employer only, owns the job)
exports.getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Check if job exists and belongs to employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You do not own this job listing.' });
    }

    const applications = await Application.find({ jobId })
      .populate('applicantId', 'name email')
      .sort({ appliedAt: -1 });

    // Join profile details manually for each application
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const profile = await Profile.findOne({ userId: app.applicantId._id });
        return {
          _id: app._id,
          jobId: app.jobId,
          applicantId: app.applicantId,
          coverLetter: app.coverLetter,
          status: app.status,
          appliedAt: app.appliedAt,
          profile: profile || null
        };
      })
    );

    res.status(200).json({
      success: true,
      count: applicationsWithProfiles.length,
      applications: applicationsWithProfiles
    });
  } catch (error) {
    next(error);
  }
};

// Update application status (employer only)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['applied', 'reviewing', 'shortlisted', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify job owner
    if (application.jobId.employerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You do not own this job listing.' });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

const Job = require('../models/Job');

// Create job (employer only)
exports.createJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(430).json({ message: 'Access denied. Employers only.' }); // 430 is customized but standard 403 is better
    }

    const {
      title,
      company,
      description,
      responsibilities,
      requirements,
      skillsRequired,
      salaryMin,
      salaryMax,
      currency,
      location,
      workType,
      jobType,
      accessibilityFeatures
    } = req.body;

    const job = new Job({
      employerId: req.user.id,
      title,
      company,
      description,
      responsibilities,
      requirements,
      skillsRequired: Array.isArray(skillsRequired) 
        ? skillsRequired 
        : (skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : []),
      salaryMin,
      salaryMax,
      currency,
      location,
      workType,
      jobType,
      accessibilityFeatures
    });

    await job.save();
    res.status(201).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// Get all jobs (public, with pagination, filter by workType, jobType, accessibilityFeatures)
exports.getAllJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { isActive: true };

    if (req.query.workType) {
      query.workType = req.query.workType;
    }
    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }

    // Search query support
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Accessibility features
    if (req.query.wheelchairAccessible === 'true') {
      query['accessibilityFeatures.wheelchairAccessible'] = true;
    }
    if (req.query.screenReaderCompatible === 'true') {
      query['accessibilityFeatures.screenReaderCompatible'] = true;
    }
    if (req.query.flexibleHours === 'true') {
      query['accessibilityFeatures.flexibleHours'] = true;
    }
    if (req.query.signLanguageSupport === 'true') {
      query['accessibilityFeatures.signLanguageSupport'] = true;
    }
    if (req.query.workFromHome === 'true') {
      query['accessibilityFeatures.workFromHome'] = true;
    }
    if (req.query.assistiveTechProvided === 'true') {
      query['accessibilityFeatures.assistiveTechProvided'] = true;
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('employerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: jobs.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalJobs: total
      },
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// Get job by ID
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('employerId', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// Update job (employer, own jobs only)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only update your own jobs.' });
    }

    if (req.body.skillsRequired && !Array.isArray(req.body.skillsRequired)) {
      req.body.skillsRequired = req.body.skillsRequired.split(',').map(s => s.trim());
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// Delete job (employer, own jobs only)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only delete your own jobs.' });
    }

    await job.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (error) {
    next(error);
  }
};

// Get employer's own jobs
exports.getEmployerJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employerId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
};

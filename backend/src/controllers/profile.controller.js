const Profile = require('../models/Profile');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (Optional but good)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only document and image files are allowed.'));
  }
};

exports.upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Get profile
exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).populate('userId', 'name email role');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// Create or update profile
exports.createOrUpdateProfile = async (req, res, next) => {
  try {
    const profileFields = {
      userId: req.user.id,
      phone: req.body.phone,
      city: req.body.city,
      state: req.body.state,
      disabilityType: req.body.disabilityType,
      disabilitySeverity: req.body.disabilitySeverity,
      assistiveTech: Array.isArray(req.body.assistiveTech) 
        ? req.body.assistiveTech 
        : (req.body.assistiveTech ? req.body.assistiveTech.split(',').map(s => s.trim()) : []),
      preferredWorkType: req.body.preferredWorkType,
      accommodationsNeeded: req.body.accommodationsNeeded,
      headline: req.body.headline,
      bio: req.body.bio,
      skills: Array.isArray(req.body.skills) 
        ? req.body.skills 
        : (req.body.skills ? req.body.skills.split(',').map(s => s.trim()) : []),
      experienceLevel: req.body.experienceLevel,
      education: req.body.education,
      workHistory: typeof req.body.workHistory === 'string' 
        ? JSON.parse(req.body.workHistory) 
        : (req.body.workHistory || []),
      certifications: Array.isArray(req.body.certifications) 
        ? req.body.certifications 
        : (req.body.certifications ? req.body.certifications.split(',').map(s => s.trim()) : []),
      linkedinUrl: req.body.linkedinUrl,
      portfolioUrl: req.body.portfolioUrl
    };

    // If photos or urls are already uploaded separately they might be here
    if (req.body.profilePhoto) profileFields.profilePhoto = req.body.profilePhoto;
    if (req.body.resumeUrl) profileFields.resumeUrl = req.body.resumeUrl;
    if (req.body.disabilityCertificateUrl) profileFields.disabilityCertificateUrl = req.body.disabilityCertificateUrl;

    let profile = await Profile.findOne({ userId: req.user.id });

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.status(200).json({ success: true, profile });
    }

    // Create
    profile = new Profile(profileFields);
    await profile.save();
    res.status(201).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// Upload resume / certificate file
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const relativePath = `/uploads/${req.file.filename}`;
    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = new Profile({
        userId: req.user.id,
      });
    }

    // Save path depending on field name
    if (req.file.fieldname === 'disabilityCertificate') {
      profile.disabilityCertificateUrl = relativePath;
    } else {
      profile.resumeUrl = relativePath;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      fileUrl: relativePath,
      profile
    });
  } catch (error) {
    next(error);
  }
};

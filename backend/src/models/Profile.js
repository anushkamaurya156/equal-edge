const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  profilePhoto: {
    type: String
  },
  disabilityType: {
    type: String,
    enum: ['visual', 'hearing', 'mobility', 'cognitive', 'speech', 'other']
  },
  disabilitySeverity: {
    type: String,
    enum: ['mild', 'moderate', 'severe']
  },
  assistiveTech: {
    type: [String],
    default: []
  },
  preferredWorkType: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite']
  },
  accommodationsNeeded: {
    type: String
  },
  headline: {
    type: String
  },
  bio: {
    type: String
  },
  skills: {
    type: [String],
    default: []
  },
  experienceLevel: {
    type: String,
    enum: ['fresher', 'junior', 'mid', 'senior']
  },
  education: {
    type: String
  },
  workHistory: [
    {
      company: String,
      role: String,
      duration: String
    }
  ],
  certifications: {
    type: [String],
    default: []
  },
  linkedinUrl: {
    type: String
  },
  portfolioUrl: {
    type: String
  },
  resumeUrl: {
    type: String
  },
  disabilityCertificateUrl: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', ProfileSchema);

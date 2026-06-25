const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a job title']
  },
  company: {
    type: String,
    required: [true, 'Please add a company name']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  responsibilities: {
    type: String
  },
  requirements: {
    type: String
  },
  skillsRequired: {
    type: [String],
    default: []
  },
  salaryMin: {
    type: Number
  },
  salaryMax: {
    type: Number
  },
  currency: {
    type: String,
    default: 'INR'
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  workType: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite'],
    required: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: true
  },
  accessibilityFeatures: {
    wheelchairAccessible: { type: Boolean, default: false },
    screenReaderCompatible: { type: Boolean, default: false },
    flexibleHours: { type: Boolean, default: false },
    signLanguageSupport: { type: Boolean, default: false },
    workFromHome: { type: Boolean, default: false },
    assistiveTechProvided: { type: Boolean, default: false },
    otherAccommodations: { type: String, default: '' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', JobSchema);

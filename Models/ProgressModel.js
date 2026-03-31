
const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  chest: { type: Number, min: 0 },
  waist: { type: Number, min: 0 },
  hips: { type: Number, min: 0 },
  arms: { type: Number, min: 0 },
  thighs: { type: Number, min: 0 },
  calves: { type: Number, min: 0 }
}, { _id: false });

const performanceSchema = new mongoose.Schema({
  runTime: { type: Number, min: 0 }, // in seconds
  runDistance: { type: Number, min: 0 }, // in km
  benchPress: { type: Number, min: 0 }, // in kg
  squat: { type: Number, min: 0 }, // in kg
  deadlift: { type: Number, min: 0 } // in kg
}, { _id: false });

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  weight: {
    type: Number,
    min: 0,
    required: true
  },
  measurements: measurementSchema,
  performance: performanceSchema,
  notes: {
    type: String,
    maxlength: 500
  },
  workoutDone: {
    type: Boolean,
    default: false
  },
  dietFollowed: {
    type: Boolean,
    default: false
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'average', 'tired', 'sore'],
    default: 'good'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
progressSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Progress', progressSchema);
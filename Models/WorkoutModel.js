

  const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a workout name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  exercises: [
    {
      exerciseName: {
        type: String,
        required: [true, 'Please provide exercise name'],
        trim: true
      },
      sets: {
        type: Number,
        required: [true, 'Please provide number of sets'],
        min: [1, 'Sets must be at least 1']
      },
      reps: {
        type: Number,
        required: [true, 'Please provide number of reps'],
        min: [1, 'Reps must be at least 1']
      },
      weight: {
        type: Number,
        min: [0, 'Weight cannot be negative'],
        default: 0
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [200, 'Notes cannot be more than 200 characters']
      }
    }
  ],
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['strength', 'cardio', 'flexibility', 'hiit', 'other'],
    default: 'strength'
  },
   date: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative'],
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search functionality
workoutSchema.index({ name: 'text', 'exercises.exerciseName': 'text', tags: 'text' });

module.exports = mongoose.model('workouts', workoutSchema);
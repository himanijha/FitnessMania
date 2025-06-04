// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  height: {
    type: Number,
    min: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  age: {
    type: Number,
    min: 0
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  fitness_goal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'general_fitness']
  },
  profileImageUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  dailychallenge_score: {
    type: Number,
    default: 0
  },
  daily_activities: {
    completed: {
      type: Boolean,
      default: false
    },
    activity_type: {
      type: String,
      enum: ['Running', 'Biking', 'Doing Yoga', 'Swimming', 'Weight Lifting'],
      default: function() {
        // Set default based on current day
        const dailyChallenges = ['Running', 'Biking', 'Doing Yoga', 'Swimming', 'Weight Lifting'];
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return dailyChallenges[dayOfYear % dailyChallenges.length];
      }
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      default: function() {
        return new Date().toISOString().split('T')[0];
      }
    },
    points_earned: {
      type: Number,
      default: 0
    },
    completed_at: {
      type: Date,
      default: null
    },
    last_reset: {
      type: Date,
      default: Date.now
    }
  }
});

userSchema.methods.resetDailyActivity = function(newActivity) {
  const today = new Date().toISOString().split('T')[0];
  
  this.daily_activities = {
    completed: false,
    activity_type: newActivity,
    date: today,
    points_earned: 0,
    completed_at: null,
    last_reset: new Date()
  };
  
  return this.save();
};

userSchema.methods.completeDailyChallenge = function(points = 100) {
  if (this.daily_activities.completed) {
    throw new Error('Challenge already completed today');
  }
  
  this.daily_activities.completed = true;
  this.daily_activities.completed_at = new Date();
  this.daily_activities.points_earned = points;
  this.dailychallenge_score += points;
  
  return this.save();
};

userSchema.statics.getTodaysChallenge = function() {
  const dailyChallenges = ['Running', 'Biking', 'Doing Yoga', 'Swimming', 'Weight Lifting'];
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return dailyChallenges[dayOfYear % dailyChallenges.length];
};

userSchema.pre('save', function(next) {
  if (this.isNew && !this.daily_activities) {
    const today = new Date().toISOString().split('T')[0];
    this.daily_activities = {
      completed: false,
      activity_type: this.constructor.getTodaysChallenge(),
      date: today,
      points_earned: 0,
      completed_at: null,
      last_reset: new Date()
    };
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
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
  goals: {
    type: Object,
    default: {
      run: 1,
      bike: 1,
      yoga: 1,
      swim: 1,
      weights: 1,
    }
  }
});

module.exports = mongoose.model('User', userSchema);
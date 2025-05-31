const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  imageUrl: {
    type: String,
    required: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Post', postSchema); 
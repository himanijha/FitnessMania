const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    text: { type: String, required: true }
});

const postsSchema = new mongoose.Schema({
    username: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String, required: true },
    // commentstate: { type: Boolean, default: false },
    likeCount: { type: Number, default: 0 },
    comments: [commentSchema],
    imageUrl: { type: String },
    likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    tags: {type: String},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postsSchema);
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Post = require('./models/Post');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const http = require('http');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fitnessmania_posts', // Optional: specify a folder in your Cloudinary account
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());

// app.use((req, res, next) => {
//     const username = "admin"; 
//     const password = "password"; // hard coded password
//     if (req.headers.authorization == `Basic ${btoa(username + ":" + password)}`) {
//         return next();
//     } else {
//         res.set('WWW-Authenticate', 'Basic realm="Everything"');
//         res.status(401).send('Authentication required.');
//     }

//     // TODO: hash password instead of storing as text
// });

app.get('/', (req, res) => {
    res.json({ message: 'Hello from the backend' });
});

const PORT = process.env.PORT || 3000;


mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  app.post('/api/users', async (req, res) => {
    try {
      const { username, email } = req.body;
  
      const newUser = new User({ username, email });
      const savedUser = await newUser.save();
  
      res.status(201).json({ message: 'User created', user: savedUser });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Fetch all users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Fetch all posts
  app.get('/api/posts', async (req, res) => {
    console.log("Found it")
    try {
      const posts = await Post.find();
      console.log("Posts found:", posts.length);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Filter by tag
  app.get('/api/posts', async (req, res) => {
    try {
      const { tag } = req.query;
      let query = {};
      
      if (tag && tag !== 'all') {
        query = { tags: tag };
      }
      
      const posts = await Post.find(query);
      console.log(`Posts found for tag ${tag}:`, posts.length);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Handle creating a new post
  app.post('/api/posts', upload.single('image'), async (req, res) => {
    try {
      const { username, title, description } = req.body;
      // Get the image URL from the Cloudinary upload result
      const imageUrl = req.file ? req.file.path : null; 

      const newPost = new Post({ username, title, description, imageUrl });
      const savedPost = await newPost.save();

      res.status(201).json(savedPost);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(400).json({ error: error.message });
    }
  });


  // Fetch all posts
  app.patch('/api/posts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Find the post first to check existing likes
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Handle liking/unliking
      if (updates.hasOwnProperty('userId')) { // Check if userId is provided for liking/unliking
        const userId = updates.userId;
        const userLikedIndex = post.likes.findIndex(like => like.toString() === userId);

        if (userLikedIndex === -1) {
          // User hasn't liked, add their ID and increment likeCount
          post.likes.push(userId);
          post.likeCount = (post.likeCount || 0) + 1; // Ensure likeCount is treated as number
        } else {
          // User has liked, remove their ID and decrement likeCount
          post.likes.splice(userLikedIndex, 1);
          post.likeCount = Math.max(0, (post.likeCount || 0) - 1); // Ensure likeCount doesn't go below 0
        }
        // Remove userId from updates so it's not attempted to be set on the Post model directly
        delete updates.userId;
      }

      // Apply other updates (if any)
      Object.assign(post, updates);

      const updatedPost = await post.save(); // Save the updated post

      console.log('Updated post in server:', updatedPost);

      res.json(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: error.message });
    }
  });

// Handle updating user profile
app.patch('/api/users/:userId', upload.single('profileImage'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { username } = req.body; // Get username from body
    const profileImageUrl = req.file ? req.file.path : undefined; // Get image URL from Cloudinary

    const updates = {};
    if (username !== undefined) {
      updates.username = username;
    }
    if (profileImageUrl !== undefined) {
      updates.profileImageUrl = profileImageUrl;
    }

    // Find the user *before* updating to get the old username
    const oldUser = await User.findById(userId);
    if (!oldUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    const oldUsername = oldUser.username;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found after update' });
    }

    // If username was changed, update username in all of the user's posts
    if (username !== undefined && username !== oldUsername) {
      await Post.updateMany({ username: oldUsername }, { $set: { username: username } });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get current user profile (for demo: return first user)
app.get('/api/users/profile', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(404).json({ error: 'No user found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get posts by user ID
app.get('/api/users/:userId/posts', async (req, res) => {
  try {
    // Fetch the user by ID to get their username
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find posts by username
    const posts = await Post.find({ username: user.username })
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  
  
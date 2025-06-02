require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcrypt');
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

// Authentication middleware - skip for signup and signin endpoints
const authenticate = (req, res, next) => {
    // Skip authentication for signup and signin routes
    if (req.path === '/api/signup' || req.path === '/api/signin') {
        return next();
    }

    const username = "admin"; 
    const password = "password"; // hard coded password
    if (req.headers.authorization == `Basic ${btoa(username + ":" + password)}`) {
        return next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm="Everything"');
        res.status(401).send('Authentication required.');
    }
};

// Apply authentication middleware
app.use(authenticate);

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
  app.get('/api/posts/:tag', async (req, res) => {
    try {
      const { tag } = req.params;
      const posts = await Post.find({ tag: tag });
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

// Get current user profile by userId from query string
app.get('/api/users/profile', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
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

  // Signup endpoint
  app.post('/api/signup', async (req, res) => {
    try {
      const { first_name, last_name, username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }]
      });
      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.email === email ? 'User already exists with this email' : 'Username already taken'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const user = new User({
        first_name,
        last_name,
        username,
        email,
        password: hashedPassword,
      });

      // Save the user and store the result
      const savedUser = await user.save();

      res.status(201).json({ 
        message: 'User created successfully',
        userId: savedUser._id.toString(),
        user: {
          _id: savedUser._id.toString(),
          username: savedUser.username
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Error creating user: ' + error.message });
    }
  });

  // Update user fitness information
  app.post('/api/update-fitness-info', async (req, res) => {
    try {
      const { userId, height, weight, age, gender, fitness_goal } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user with fitness information
      user.height = height;
      user.weight = weight;
      user.age = age;
      user.gender = gender;
      user.fitness_goal = fitness_goal;

      await user.save();

      res.json({ 
        message: 'Fitness information updated successfully',
        user: {
          id: user._id,
          username: user.username,
          fitness_goal: user.fitness_goal
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating fitness information: ' + error.message });
    }
  });

  // Signin endpoint
  app.post('/api/signin', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Compare password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.json({ 
        message: 'Login successful',
        userId: user._id.toString(),
        user: {
          _id: user._id.toString(),
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ message: 'Error signing in: ' + error.message });
    }
  });
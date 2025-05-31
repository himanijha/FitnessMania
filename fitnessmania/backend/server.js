require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcrypt');

const app = express();
const http = require('http');

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

  // Create a new post
  app.post('/api/posts', async (req, res) => {
    try {
      const { userId, title, content } = req.body;
      const newPost = new Post({ userId, title, content });
      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get posts by user ID
  app.get('/api/users/:userId/posts', async (req, res) => {
    try {
      const posts = await Post.find({ userId: req.params.userId })
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
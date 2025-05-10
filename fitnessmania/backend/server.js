require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');

const app = express();
const http = require('http');

app.use(express.json());
app.use(cors());

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
  
  
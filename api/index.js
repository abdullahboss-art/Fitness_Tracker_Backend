const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// User Schema (directly here)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;
    console.log('Signup attempt:', { username, fullName, email });
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, fullName, email, password: hashedPassword });
    await user.save();
    
    console.log('User created:', user._id);
    res.json({ success: true, message: 'User created successfully' });
    
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Fitness Tracker Backend is running!' });
});

module.exports = app;
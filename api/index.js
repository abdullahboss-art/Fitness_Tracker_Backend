const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://fitness-tracker-ctr.vercel.app', 'https://fitness-tracker-kzyi.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined');
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is live!' });
});

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;
    
    console.log('Signup attempt:', { username, fullName, email });
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      username,
      fullName,
      email,
      password: hashedPassword
    });
    
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
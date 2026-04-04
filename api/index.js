const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined');
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// User Schema
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

// ✅ YEH ROUTE TUMHARA FRONTEND CALL KAR RAHA HAI
app.post('/User/register', async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    console.log('📝 Register attempt:', { username, name, email });
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user (frontend se 'name' aa raha hai, backend mein 'fullName' hai)
    const user = new User({ 
      username, 
      fullName: name, 
      email, 
      password: hashedPassword 
    });
    
    await user.save();
    
    console.log('✅ User created:', user._id);
    res.json({ success: true, message: 'User created successfully' });
    
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Fitness Tracker Backend is running!' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
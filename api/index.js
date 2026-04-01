const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Import your existing routes
const authRoutes = require('../Routes/authRoutes');
const workoutRoutes = require('../Routes/WorkoutRoutes');
const nutritionRoutes = require('../Routes/NutritionRoutes');
const progressRoutes = require('../Routes/ProgressRoutes');

// Middleware
app.use(cors({
  origin: ['https://fitness-tracker-phfz.vercel.app', 'https://fitness-tracker-ctr.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// Routes - Use your existing routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/progress', progressRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is live!',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
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
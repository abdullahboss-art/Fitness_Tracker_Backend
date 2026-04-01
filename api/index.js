const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error:', err));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is live!' });
});

// ========== YAHAN APNE SAARE ROUTES ADD KARO ==========
// Example:
// app.use('/api/users', require('./routes/users'));
// app.use('/api/workouts', require('./routes/workouts'));

module.exports = app;
const mongoose = require('mongoose');
require('dotenv').config();

const dbconnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
          
        
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
};

module.exports = dbconnect; // export the function correctly

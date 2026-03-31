

const express = require("express");
const Workoutroute = express.Router();

const workoutService = require("../Services/WorkoutServices");
const authMiddleware = require("../Middleware/authMiddleware");

// ✅ CREATE WORKOUT (ADD)
Workoutroute.post("/add", authMiddleware, async (req, res) => {
  try {
    console.log("req.user:", req.user); // Debug
    
    
    const userId = req.user.id || req.user._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID not found in token"
      });
    }
    
    // Service call with correct parameters
    const workout = await workoutService.createWorkout(req.body, userId);
    
    res.status(201).json({
      success: true,
      message: "Workout created successfully 💪",
      data: workout
    });
    
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ LIST ALL WORKOUTS
Workoutroute.get("/list", authMiddleware, async (req, res) => {
  try {
    const workouts = await workoutService.getUserWorkouts(req.user.id, req.query);
    
    res.status(200).json({
      success: true,
      count: workouts.length,
      message: "Workouts fetched successfully ✅",
      data: workouts
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ GET SINGLE WORKOUT BY ID
Workoutroute.get("/:id", authMiddleware, async (req, res) => {
  try {
    const workout = await workoutService.getWorkoutById(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: "Workout fetched successfully",
      data: workout
    });
    
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ UPDATE WORKOUT
Workoutroute.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const workout = await workoutService.updateWorkout(
      req.params.id,
      req.user.id,
      req.body
    );
    
    res.status(200).json({
      success: true,
      message: "Workout updated successfully ✏️",
      data: workout
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ DELETE WORKOUT
Workoutroute.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    await workoutService.deleteWorkout(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: "Workout deleted successfully 🗑️"
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = Workoutroute;
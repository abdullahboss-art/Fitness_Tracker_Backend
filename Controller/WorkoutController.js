// controllers/WorkoutController.js

const WorkoutService = require("../Services/WorkoutServices");

class WorkoutController {
  // Create workout
  static createWorkout(req, res) {
    WorkoutService.createWorkout(req, res);
  }

  // Get all workouts
  static list(req, res) {
    WorkoutService.list(req, res);
  }

  // Get single workout
  static getWorkout(req, res) {
    WorkoutService.getWorkout(req, res);
  }

  // Update workout
  static updateWorkout(req, res) {
    WorkoutService.updateWorkout(req, res);
  }

  // Delete workout
  static deleteWorkout(req, res) {
    WorkoutService.deleteWorkout(req, res);
  }
}

module.exports = WorkoutController;
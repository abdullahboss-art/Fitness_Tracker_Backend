const Workout = require('../Models/WorkoutModel'); // 👈 Path sahi karo (models not Models)

class WorkoutService {
  // 🔹 CREATE WORKOUT (ADD)
  async createWorkout(workoutData, userId) {
    try {
      console.log("Creating workout for user:", userId);
      console.log("Workout data:", workoutData);
      
      // 🔥 Ensure date is set correctly
      const workout = await Workout.create({
        ...workoutData,
        createdBy: userId,
        // If date is provided from frontend, use it, otherwise use current date
        date: workoutData.date ? new Date(workoutData.date) : new Date()
      });
      
      return workout;
    } catch (error) {
      throw new Error(`Error creating workout: ${error.message}`);
    }
  }

  // 🔹 GET ALL WORKOUTS (LIST) - WITH DATE FILTER
  async getUserWorkouts(userId, filters = {}) {
    try {
      const query = { createdBy: userId };
      
      console.log("Filters received:", filters); // Debug log
      
      // Apply filters
      if (filters.category) query.category = filters.category;
      if (filters.difficulty) query.difficulty = filters.difficulty;
      if (filters.tags) query.tags = { $in: filters.tags.split(',') };
      
      // 🔥 NEW: DATE FILTER
      if (filters.date) {
        const selectedDate = new Date(filters.date);
        
        // Set to start of day (00:00:00)
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        // Set to end of day (23:59:59.999)
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        // Filter workouts by date field
        query.date = {
          $gte: startDate,
          $lte: endDate
        };
        
        console.log("Date filter:", {
          date: filters.date,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
      }
      
      console.log("Final query:", query); // Debug log
      
      const workouts = await Workout.find(query)
        .sort({ createdAt: -1 });
      
      console.log(`Found ${workouts.length} workouts for user ${userId}`);
      
      return workouts;
    } catch (error) {
      throw new Error(`Error fetching workouts: ${error.message}`);
    }
  }

  // 🔹 GET SINGLE WORKOUT
  async getWorkoutById(workoutId, userId) {
    try {
      const workout = await Workout.findOne({
        _id: workoutId,
        createdBy: userId
      });
      
      if (!workout) {
        throw new Error('Workout not found');
      }
      
      return workout;
    } catch (error) {
      throw new Error(`Error fetching workout: ${error.message}`);
    }
  }

  // 🔹 UPDATE WORKOUT
  async updateWorkout(workoutId, userId, updateData) {
    try {
      // 🔥 If date is being updated, convert it
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }
      
      const workout = await Workout.findOneAndUpdate(
        { _id: workoutId, createdBy: userId },
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!workout) {
        throw new Error('Workout not found');
      }
      
      return workout;
    } catch (error) {
      throw new Error(`Error updating workout: ${error.message}`);
    }
  }

  // 🔹 DELETE WORKOUT
  async deleteWorkout(workoutId, userId) {
    try {
      const workout = await Workout.findOneAndDelete({
        _id: workoutId,
        createdBy: userId
      });
      
      if (!workout) {
        throw new Error('Workout not found');
      }
      
      return workout;
    } catch (error) {
      throw new Error(`Error deleting workout: ${error.message}`);
    }
  }

  // 🔹 SEARCH WORKOUTS - WITH DATE FILTER
  async searchWorkouts(userId, searchTerm, date = null) {
    try {
      const query = {
        createdBy: userId,
        $text: { $search: searchTerm }
      };
      
      // 🔥 Add date filter to search if provided
      if (date) {
        const selectedDate = new Date(date);
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        query.date = {
          $gte: startDate,
          $lte: endDate
        };
      }
      
      const workouts = await Workout.find(query)
        .sort({ score: { $meta: 'textScore' } });
      
      return workouts;
    } catch (error) {
      throw new Error(`Error searching workouts: ${error.message}`);
    }
  }

  // 🔹 ADD EXERCISE TO WORKOUT
  async addExercise(workoutId, userId, exerciseData) {
    try {
      const workout = await Workout.findOne({
        _id: workoutId,
        createdBy: userId
      });
      
      if (!workout) {
        throw new Error('Workout not found');
      }
      
      workout.exercises.push(exerciseData);
      await workout.save();
      
      return workout;
    } catch (error) {
      throw new Error(`Error adding exercise: ${error.message}`);
    }
  }

  // 🔹 UPDATE EXERCISE IN WORKOUT
  async updateExercise(workoutId, userId, exerciseIndex, exerciseData) {
    try {
      const workout = await Workout.findOne({
        _id: workoutId,
        createdBy: userId
      });
      
      if (!workout) {
        throw new Error('Workout not found');
      }
      
      if (exerciseIndex < 0 || exerciseIndex >= workout.exercises.length) {
        throw new Error('Exercise not found');
      }
      
      workout.exercises[exerciseIndex] = {
        ...workout.exercises[exerciseIndex].toObject(),
        ...exerciseData
      };
      
      await workout.save();
      return workout;
    } catch (error) {
      throw new Error(`Error updating exercise: ${error.message}`);
    }
  }

  // 🔹 DELETE EXERCISE FROM WORKOUT
  async deleteExercise(workoutId, userId, exerciseIndex) {
    try {
      const workout = await Workout.findOne({
        _id: workoutId,
        createdBy: userId
      });
      
      if (!workout) {
        throw new Error('Workout not found');
      }
      
      if (exerciseIndex < 0 || exerciseIndex >= workout.exercises.length) {
        throw new Error('Exercise not found');
      }
      
      workout.exercises.splice(exerciseIndex, 1);
      await workout.save();
      
      return workout;
    } catch (error) {
      throw new Error(`Error deleting exercise: ${error.message}`);
    }
  }

  // 🔹 GET WORKOUTS BY DATE RANGE
  async getWorkoutsByDateRange(userId, startDate, endDate) {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      const workouts = await Workout.find({
        createdBy: userId,
        date: {
          $gte: start,
          $lte: end
        }
      }).sort({ date: -1 });
      
      return workouts;
    } catch (error) {
      throw new Error(`Error fetching workouts by date range: ${error.message}`);
    }
  }
}

module.exports = new WorkoutService();
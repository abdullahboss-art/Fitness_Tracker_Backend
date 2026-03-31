const Nutrition = require('../Models/NutritionModel'); // 👈 Path sahi karo (models not Models)

class NutritionService {
  async createNutritionEntry(entryData, userId) {
    try {
      console.log("Creating nutrition entry for user:", userId);
      console.log("Nutrition data:", entryData);
      
      const nutritionEntry = await Nutrition.create({
        ...entryData,
        user: userId
      });
      
      return nutritionEntry;
    } catch (error) {
      throw new Error(`Error creating nutrition entry: ${error.message}`);
    }
  }

  // 🔹 GET ALL NUTRITION ENTRIES (LIST)
  async getUserNutritionEntries(userId, filters = {}) {
    try {
      const query = { user: userId };
      
      // Apply filters
      if (filters.mealType) query.mealType = filters.mealType;
      if (filters.startDate && filters.endDate) {
        query.date = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      } else if (filters.startDate) {
        query.date = { $gte: new Date(filters.startDate) };
      } else if (filters.endDate) {
        query.date = { $lte: new Date(filters.endDate) };
      }
      
      // Date range filter for specific day
      if (filters.date) {
        const startOfDay = new Date(filters.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query.date = {
          $gte: startOfDay,
          $lte: endOfDay
        };
      }
      
      const entries = await Nutrition.find(query)
        .sort({ date: -1 })
        .limit(filters.limit || 100);
      
      return entries;
    } catch (error) {
      throw new Error(`Error fetching nutrition entries: ${error.message}`);
    }
  }

  // 🔹 GET SINGLE NUTRITION ENTRY
  async getNutritionEntryById(entryId, userId) {
    try {
      const entry = await Nutrition.findOne({
        _id: entryId,
        user: userId
      });
      
      if (!entry) {
        throw new Error('Nutrition entry not found');
      }
      
      return entry;
    } catch (error) {
      throw new Error(`Error fetching nutrition entry: ${error.message}`);
    }
  }

  // 🔹 UPDATE NUTRITION ENTRY
  async updateNutritionEntry(entryId, userId, updateData) {
    try {
      const entry = await Nutrition.findOneAndUpdate(
        { _id: entryId, user: userId },
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!entry) {
        throw new Error('Nutrition entry not found');
      }
      
      return entry;
    } catch (error) {
      throw new Error(`Error updating nutrition entry: ${error.message}`);
    }
  }

  // 🔹 DELETE NUTRITION ENTRY
  async deleteNutritionEntry(entryId, userId) {
    try {
      const entry = await Nutrition.findOneAndDelete({
        _id: entryId,
        user: userId
      });
      
      if (!entry) {
        throw new Error('Nutrition entry not found');
      }
      
      return entry;
    } catch (error) {
      throw new Error(`Error deleting nutrition entry: ${error.message}`);
    }
  }

  // 🔹 SEARCH NUTRITION ENTRIES (by food name)
  async searchNutritionEntries(userId, searchTerm) {
    try {
      const entries = await Nutrition.find({
        user: userId,
        'foodItems.name': { $regex: searchTerm, $options: 'i' }
      }).sort({ date: -1 });
      
      return entries;
    } catch (error) {
      throw new Error(`Error searching nutrition entries: ${error.message}`);
    }
  }

  // 🔹 ADD FOOD ITEM TO ENTRY
  async addFoodItem(entryId, userId, foodData) {
    try {
      const entry = await Nutrition.findOne({
        _id: entryId,
        user: userId
      });
      
      if (!entry) {
        throw new Error('Nutrition entry not found');
      }
      
      entry.foodItems.push(foodData);
      await entry.save(); // This will trigger pre-save hook to update totals
      
      return entry;
    } catch (error) {
      throw new Error(`Error adding food item: ${error.message}`);
    }
  }

  // 🔹 UPDATE FOOD ITEM IN ENTRY
  async updateFoodItem(entryId, userId, foodIndex, foodData) {
    try {
      const entry = await Nutrition.findOne({
        _id: entryId,
        user: userId
      });
      
      if (!entry) {
        throw new Error('Nutrition entry not found');
      }
      
      if (foodIndex < 0 || foodIndex >= entry.foodItems.length) {
        throw new Error('Food item not found');
      }
      
      entry.foodItems[foodIndex] = {
        ...entry.foodItems[foodIndex].toObject(),
        ...foodData
      };
      
      await entry.save(); // This will trigger pre-save hook to update totals
      return entry;
    } catch (error) {
      throw new Error(`Error updating food item: ${error.message}`);
    }
  }

  // 🔹 DELETE FOOD ITEM FROM ENTRY
  async deleteFoodItem(entryId, userId, foodIndex) {
    try {
      const entry = await Nutrition.findOne({
        _id: entryId,
        user: userId
      });
      
      if (!entry) {
        throw new Error('Nutrition entry not found');
      }
      
      if (foodIndex < 0 || foodIndex >= entry.foodItems.length) {
        throw new Error('Food item not found');
      }
      
      entry.foodItems.splice(foodIndex, 1);
      await entry.save(); // This will trigger pre-save hook to update totals
      
      return entry;
    } catch (error) {
      throw new Error(`Error deleting food item: ${error.message}`);
    }
  }

  // 🔹 GET NUTRITION SUMMARY (stats)
  async getNutritionSummary(userId, startDate, endDate) {
    try {
      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date();
      
      if (!endDate) {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }
      
      const entries = await Nutrition.find({
        user: userId,
        date: { $gte: start, $lte: end }
      });
      
      const summary = {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        mealCount: entries.length,
        byMealType: {
          breakfast: { count: 0, calories: 0 },
          lunch: { count: 0, calories: 0 },
          dinner: { count: 0, calories: 0 },
          snacks: { count: 0, calories: 0 }
        }
      };
      
      entries.forEach(entry => {
        summary.totalCalories += entry.totalCalories;
        summary.totalProtein += entry.totalProtein;
        summary.totalCarbs += entry.totalCarbs;
        summary.totalFats += entry.totalFats;
        
        // Update meal type stats
        if (summary.byMealType[entry.mealType]) {
          summary.byMealType[entry.mealType].count++;
          summary.byMealType[entry.mealType].calories += entry.totalCalories;
        }
      });
      
      return summary;
    } catch (error) {
      throw new Error(`Error getting nutrition summary: ${error.message}`);
    }
  }

  // 🔹 GET DAILY NUTRITION BREAKDOWN
  async getDailyBreakdown(userId, date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const entries = await Nutrition.find({
        user: userId,
        date: { $gte: startOfDay, $lte: endOfDay }
      }).sort({ date: 1 });
      
      const breakdown = {
        breakfast: { items: [], totalCalories: 0 },
        lunch: { items: [], totalCalories: 0 },
        dinner: { items: [], totalCalories: 0 },
        snacks: { items: [], totalCalories: 0 }
      };
      
      entries.forEach(entry => {
        if (breakdown[entry.mealType]) {
          breakdown[entry.mealType].items.push(entry);
          breakdown[entry.mealType].totalCalories += entry.totalCalories;
        }
      });
      
      return breakdown;
    } catch (error) {
      throw new Error(`Error getting daily breakdown: ${error.message}`);
    }
  }

  // 🔹 GET WEEKLY NUTRITION TREND
  async getWeeklyTrend(userId, endDate = new Date()) {
    try {
      const end = new Date(endDate);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      
      const entries = await Nutrition.find({
        user: userId,
        date: { $gte: start, $lte: end }
      }).sort({ date: 1 });
      
      const trend = {};
      
      // Initialize last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        trend[dateStr] = {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFats: 0,
          mealCount: 0
        };
      }
      
      // Fill in data
      entries.forEach(entry => {
        const dateStr = entry.date.toISOString().split('T')[0];
        if (trend[dateStr]) {
          trend[dateStr].totalCalories += entry.totalCalories;
          trend[dateStr].totalProtein += entry.totalProtein;
          trend[dateStr].totalCarbs += entry.totalCarbs;
          trend[dateStr].totalFats += entry.totalFats;
          trend[dateStr].mealCount++;
        }
      });
      
      return trend;
    } catch (error) {
      throw new Error(`Error getting weekly trend: ${error.message}`);
    }
  }
}

module.exports = new NutritionService();
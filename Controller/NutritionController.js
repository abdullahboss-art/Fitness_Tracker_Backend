const NutritionService = require("../Services/nutritionService");

class NutritionController {
  // Create nutrition entry
  static async createNutritionEntry(req, res) {
    try {
      const userId = req.user.id || req.user._id;
      const entry = await NutritionService.createNutritionEntry(req.body, userId);
      
      res.status(201).json({
        success: true,
        message: "Nutrition entry created successfully 🍎",
        data: entry
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all nutrition entries
  static async list(req, res) {
    try {
      const entries = await NutritionService.getUserNutritionEntries(req.user.id, req.query);
      
      res.status(200).json({
        success: true,
        count: entries.length,
        message: "Nutrition entries fetched successfully ✅",
        data: entries
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get single nutrition entry
  static async getNutritionEntry(req, res) {
    try {
      const entry = await NutritionService.getNutritionEntryById(req.params.id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: "Nutrition entry fetched successfully",
        data: entry
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update nutrition entry
  static async updateNutritionEntry(req, res) {
    try {
      const entry = await NutritionService.updateNutritionEntry(
        req.params.id,
        req.user.id,
        req.body
      );
      
      res.status(200).json({
        success: true,
        message: "Nutrition entry updated successfully ✏️",
        data: entry
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete nutrition entry
  static async deleteNutritionEntry(req, res) {
    try {
      await NutritionService.deleteNutritionEntry(req.params.id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: "Nutrition entry deleted successfully 🗑️"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Add food item
  static async addFoodItem(req, res) {
    try {
      const entry = await NutritionService.addFoodItem(
        req.params.id,
        req.user.id,
        req.body
      );
      
      res.status(201).json({
        success: true,
        message: "Food item added successfully 🥗",
        data: entry
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update food item
  static async updateFoodItem(req, res) {
    try {
      const entry = await NutritionService.updateFoodItem(
        req.params.id,
        req.user.id,
        parseInt(req.params.index),
        req.body
      );
      
      res.status(200).json({
        success: true,
        message: "Food item updated successfully ✏️",
        data: entry
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete food item
  static async deleteFoodItem(req, res) {
    try {
      const entry = await NutritionService.deleteFoodItem(
        req.params.id,
        req.user.id,
        parseInt(req.params.index)
      );
      
      res.status(200).json({
        success: true,
        message: "Food item deleted successfully 🗑️",
        data: entry
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = NutritionController;
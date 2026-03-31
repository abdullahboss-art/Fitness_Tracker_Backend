

const express = require("express");
const Nutritionroute = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const NutritionController = require("../Controller/NutritionCOntroller");

// ✅ CREATE NUTRITION ENTRY (ADD)
Nutritionroute.post("/add", authMiddleware, NutritionController.createNutritionEntry);

// ✅ LIST ALL NUTRITION ENTRIES
Nutritionroute.get("/list", authMiddleware, NutritionController.list);

// ✅ GET SINGLE NUTRITION ENTRY BY ID
Nutritionroute.get("/:id", authMiddleware, NutritionController.getNutritionEntry);

// ✅ UPDATE NUTRITION ENTRY
Nutritionroute.put("/update/:id", authMiddleware, NutritionController.updateNutritionEntry);

// ✅ DELETE NUTRITION ENTRY
Nutritionroute.delete("/delete/:id", authMiddleware, NutritionController.deleteNutritionEntry);

// ✅ ADD FOOD ITEM TO ENTRY
Nutritionroute.post("/:id/food-item", authMiddleware, NutritionController.addFoodItem);

// ✅ UPDATE FOOD ITEM IN ENTRY
Nutritionroute.put("/:id/food-item/:index", authMiddleware, NutritionController.updateFoodItem);

// ✅ DELETE FOOD ITEM FROM ENTRY
Nutritionroute.delete("/:id/food-item/:index", authMiddleware, NutritionController.deleteFoodItem);

module.exports = Nutritionroute;
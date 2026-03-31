// Models/NutritionModel.js - Simple version
const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: {
    value: { type: Number, required: true },
    unit: { 
      type: String, 
      required: true,
      enum: ['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece']
    }
  },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true }
});

const nutritionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  mealType: { 
    type: String, 
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks']
  },
  foodItems: [foodItemSchema],
  totalCalories: { 
    type: Number, 
    default: 0 
  },
  totalProtein: { 
    type: Number, 
    default: 0 
  },
  totalCarbs: { 
    type: Number, 
    default: 0 
  },
  totalFats: { 
    type: Number, 
    default: 0 
  },
  notes: String
}, { 
  timestamps: true 
});

// ✅ Yeh virtual property hai - calculate on the fly
nutritionSchema.virtual('calculatedCalories').get(function() {
  return this.foodItems.reduce((sum, item) => sum + item.calories, 0);
});

module.exports = mongoose.model('Nutrition', nutritionSchema);
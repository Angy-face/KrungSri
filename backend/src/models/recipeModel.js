import mongoose from "mongoose";
import ingredientSchema from "./_ingredient.js";
import instructionSchema from "./_instruction.js";
import nutritionSchema from "./_nutrition.js";

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  time:{
    type: Number,
    required: true,
  },
  ingredients: [ingredientSchema],
  instructions: [instructionSchema],
  nutrition: nutritionSchema
});

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;

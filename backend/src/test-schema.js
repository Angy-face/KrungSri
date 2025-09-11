import mongoose from "mongoose";
import Recipe from "./models/recipe.js";
import dotenv from 'dotenv';
import "./config/db.js";

// dotenv.config({path: '.env'});
// console.log("MONGO_URL:", process.env.MONGO_URL);

// const mongoUrl = process.env.MONGO_URL ;
// await mongoose.connect(mongoUrl);
// Test data
const testRecipe = new Recipe({
  name: "Banana Bread",
  time: 30,
  ingredients: [
    { amount: "200g", unit: "grams", name: "pasta" },
    { amount: "2", unit: "cloves", name: "garlic" }
  ],
  instructions: [
    { step: 1, description: "Boil water" },
    { step: 2, description: "Add pasta" }
  ],
  nutrition: {
    calories: 100,
    carbs: 20,
    fat: 5,
    protein: 10
  }
});

// Validate without saving
try {
  await testRecipe.validate();
  await testRecipe.save();
  console.log("✅ Schema validation passed");
  console.log("Document structure:", JSON.stringify(testRecipe.toObject(), null, 2));
} catch (error) {
  console.log("❌ Schema validation failed:", error.message);
}

mongoose.disconnect();

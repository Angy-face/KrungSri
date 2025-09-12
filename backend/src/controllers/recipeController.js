import Recipe from "../models/recipeModel.js";
import { generateRecipe, generateRecipeFromImage } from "../services/recipeService.js";

export const createItem = async (req, res) => {
  try {
    const newItem = new Recipe(req.body);
    await newItem.save();

    res.status(200).json({ message: "OK" });
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).json({ error: "Bad Request" });
    } else {
      res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const getItems = async (req, res) => {
  const items = await Recipe.find();
  res.status(200).json(items);
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    
    if (!deletedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const chef = async (req, res) => {
  try {
    const { foodName } = req.body;
    
    if (!foodName) {
      return res.status(400).json({ error: "foodName is required" });
    }
    
    const generatedRecipe = await generateRecipe(foodName);
    
    // Replace req.body with generated recipe and call createItem
    req.body = generatedRecipe;
    await createItem(req, res);
    
  } catch (err) {
    res.status(500).json({ error: "Failed to generate and save recipe" });
  }
};

export const chefImage = async (req, res) => {
  try {
    const { base64Image } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: "base64Image is required" });
    }
    
    console.log("Processing image, base64 length:", base64Image.length);
    
    const generatedRecipe = await generateRecipeFromImage(base64Image);
    
    // Save using createItem
    req.body = generatedRecipe;
    await createItem(req, res);
    
  } catch (err) {
    console.error("Image processing error:", err.message);
    res.status(500).json({ error: "Failed to generate recipe from image", details: err.message });
  }
};
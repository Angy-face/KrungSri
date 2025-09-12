import OPENROUTER_CONFIG from "../config/llm.js";
import fs from "fs";
import path from "path";

export const generateRecipe = async (prompt) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_CONFIG.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENROUTER_CONFIG.model,
      messages: [
        {
        role : "system",
        content : "You are JaeFai a chef who is good at cooking, and you are good at generating recipes.",
        },
        {
        role: "user",
        content: `Generate a recipe for: ${prompt}. Return ONLY valid JSON with this exact structure Or the Earth will burn!!!:
        {
          "name": "recipe name",
          "time": 30,
          "ingredients": [{"amount": "1", "unit": "cup", "name": "flour"}],
          "instructions": [{"step": 1, "description": "mix ingredients"}],
          "nutrition": {"calories": 200, "carbs": 25, "fat": 8, "protein": 4}
        }`
      }]
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`API Error: ${data.error?.message || response.statusText}`);
  }
  
  if (!data.choices || !data.choices[0]) {
    throw new Error(`Invalid API response: ${JSON.stringify(data)}`);
  }
  
  let content = data.choices[0].message.content;
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  return JSON.parse(content);
};

export const generateRecipeFromImage = async (base64Image) => {
  const encodedImage = `data:image/jpeg;base64,${base64Image}`;
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_CONFIG.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENROUTER_CONFIG.model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify the food in this image and return only the food name. Or the Earth will burn!!!"
            },
            {
              type: "image_url",
              image_url: {
                url: encodedImage
              }
            }
          ]
        }]
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`API Error: ${data.error?.message || response.statusText}`);
  }
  
  const foodName = data.choices[0].message.content.trim();
  console.log(foodName);
  return await generateRecipe(foodName);
};

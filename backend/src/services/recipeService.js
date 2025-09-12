import OPENROUTER_CONFIG from "../config/llm.js";

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
        {role: "system", content: `You are Jae Fai, a chef who is very good at cooking. your task is to generate a recipe for a given food item. 
          You will generate a valid JSON with this exact structure:
          {
            "name": "recipe name",
            "time": 30,
            "ingredients": [{"amount": "1", "unit": "cup", "name": "flour"}],
            "instructions": [{"step": 1, "description": "mix ingredients"}],
            "nutrition": {"calories": 200, "carbs": 25, "fat": 8, "protein": 4}
          }`
        },
        {
        role: "user",
        content: `Generate a recipe for: ${prompt}.`
        }
      ]
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
  
  // Remove markdown code blocks if present
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  return JSON.parse(content);
};

import dotenv from "dotenv";
dotenv.config();

console.log("CURRENT OPENROUTER MODEL :", process.env.OPENROUTER_MODEL)
export const OPENROUTER_CONFIG = {
    apiKey : process.env.OPENROUTER_API_KEY,
    model : process.env.OPENROUTER_MODEL
}

export default OPENROUTER_CONFIG

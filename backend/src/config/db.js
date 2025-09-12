import mongoose from "mongoose";

// console.log(process.env.MONGO_URL, process.env.OPENROUTER_API_KEY)
mongoose.connect(process.env.MONGO_URL);
console.log("Connected to MongoDB 🍀");

import dotenv from 'dotenv';
import mongoose from "mongoose";

dotenv.config({ path: '../.env' });

console.log(process.env.MONGO_URL)
mongoose.connect(process.env.MONGO_URL);

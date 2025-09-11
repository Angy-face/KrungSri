import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema({
  calories: {
    type: Number,
    required: true
  },
  carbs: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  }
}, { _id: false });

export default nutritionSchema;

import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema({
  amount: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true
  }
}, { _id: false });

export default ingredientSchema;

import mongoose from "mongoose";

const instructionSchema = new mongoose.Schema({
  step: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false });

export default instructionSchema;

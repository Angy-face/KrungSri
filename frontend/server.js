import express from "express";
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.OPENROUTER_API
const app = express();

app.use(express.static("public"));

const PORT = 3221;
app.listen(PORT, "0.0.0.0", () => {
  console.log(API_KEY)
  console.log(`Frontend Server ready at http://localhost:${PORT}`);
});
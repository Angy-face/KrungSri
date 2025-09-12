import express from "express";
import cors from "cors";

import RecipeRoute from "./routes/recipesRoute.js";

const app = express();

// body-parser with increased limit for images
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// allow request from other origin (Frontend which is at different port)
app.use(cors());

// use routes
app.use("/recipes", RecipeRoute);

export default app;

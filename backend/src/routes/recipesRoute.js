import express from "express";

import * as recipeController from "../controllers/recipeController.js";

const router = express.Router();

router.get("/", recipeController.getItems);
router.post("/", recipeController.createItem);
router.delete("/:id", recipeController.deleteItem);
router.post("/chef", recipeController.chef);

export default router;
import express from "express";

import * as recipeController from "../controllers/recipeControler.js";

const router = express.Router();

router.get("/", recipeController.getItems);
router.post("/", recipeController.createItem);
router.delete("/:id", recipeController.deleteItem);

export default router;
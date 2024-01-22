const express = require("express");
const router = express.Router();
const {
  getFoods,
  createFood,
  getFoodsByCategory,
  getFoodsWithOutAllergies,
  getFoodsByCategoryWithOutAllergies
} = require("../controllers/foods");
const { validatorCreateFood } = require("../validators/foods");
//const authMiddleware = require('../middleware/sessionMiddleware');
//const checkRol = require('../middleware/role');

router.get("/", getFoods);
router.get("/:id", getFoodsWithOutAllergies);
router.get("/category/:categoryName", getFoodsByCategory);
router.get("/category/:categoryName/:id", getFoodsByCategoryWithOutAllergies);
router.post("/", validatorCreateFood, createFood);

module.exports = router;

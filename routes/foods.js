const express = require("express");
const router = express.Router();
const {
  getFoods,
  getAllFoods,
  createFood,
  getFoodsByCategory,
} = require("../controllers/foods");
const { validatorCreateFood } = require("../validators/foods");
const { verifyToken } = require("../utils/handleJWT");

router.get("/",verifyToken, getFoods);
router.get("/all",verifyToken, getAllFoods);
router.get("/category/:categoryName",verifyToken, getFoodsByCategory);
router.post("/", validatorCreateFood,verifyToken, createFood);

module.exports = router;

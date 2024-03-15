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
const { verifyToken } = require("../utils/handleJWT");
//const authMiddleware = require('../middleware/sessionMiddleware');
//const checkRol = require('../middleware/role');

router.get("/",verifyToken, getFoods);
// el de abajo editarlo
router.get("/:id",verifyToken, getFoodsWithOutAllergies);
router.get("/category/:categoryName",verifyToken, getFoodsByCategory);
// el de abajo editarlo
router.get("/category/:categoryName/:id",verifyToken, getFoodsByCategoryWithOutAllergies);
router.post("/", validatorCreateFood,verifyToken, createFood);

module.exports = router;

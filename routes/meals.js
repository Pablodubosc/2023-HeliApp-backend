const express = require("express");
const router = express.Router();
const {
  getMeals,
  createMeal,
  getMealsByUserId,
  getMealsByUserIdAndDate,
  updateMealById,
  deleteMealById,
  getCaloriesBetweenDays,
  getCaloriesByDays,
} = require("../controllers/meals");
const { validatorCreateMeal } = require("../validators/meals");
const { verifyToken } = require("../utils/handleJWT");
const extractUserIdMiddleware = require("../utils/handleUserId");

//router.get("/", getMeals);
router.get("/user/", verifyToken, extractUserIdMiddleware, getMealsByUserId);
router.get("/user/date/:date", verifyToken, extractUserIdMiddleware, getMealsByUserIdAndDate);
router.post("/", validatorCreateMeal,  verifyToken, extractUserIdMiddleware, createMeal);
router.put("/:id", verifyToken, extractUserIdMiddleware, updateMealById);
router.delete("/:id", verifyToken, extractUserIdMiddleware, deleteMealById);
router.get("/user/between/:startDate/:endDate/type/:type", verifyToken, extractUserIdMiddleware, getCaloriesByDays);
router.get("/user/startDate/:startDate/endDate/:endDate/type/:type", verifyToken, extractUserIdMiddleware,getCaloriesBetweenDays)

module.exports = router;

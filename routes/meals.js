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
  getCaloriesByDays
} = require("../controllers/meals");
const { validatorCreateMeal } = require("../validators/meals");

router.get("/", getMeals);
router.get("/user/:id", getMealsByUserId);
router.get("/user/:id/date/:date", getMealsByUserIdAndDate);
router.post("/", validatorCreateMeal, createMeal);
router.put("/:id", updateMealById);
router.delete("/:id", deleteMealById);
router.get("/user/:id/between/:startDate/:endDate/type/:type", getCaloriesByDays);
router.get("/user/:id/startDate/:startDate/endDate/:endDate/type/:type",getCaloriesBetweenDays)

module.exports = router;

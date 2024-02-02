const express = require("express");
const router = express.Router();
const {
  getExerciseDone,
  createExerciseDone,
  getExerciseDoneByUserId,
  updateExerciseDoneById,
  deleteExerciseDoneById,
  getCaloriesBurnByDays,
  getExerciseDoneByUserIdAndDate,
  getCaloriesBurnBetweenDays
} = require("../controllers/exerciseDone");

router.get("/", getExerciseDone);
router.get("/user/:id", getExerciseDoneByUserId);
router.get("/user/:id/date/:date", getExerciseDoneByUserIdAndDate);
router.post("/", createExerciseDone);
router.put("/:id", updateExerciseDoneById);
router.delete("/:id", deleteExerciseDoneById);
router.get("/user/:id/startDate/:startDate/endDate/:endDate",getCaloriesBurnByDays)
router.get("/user/:id/between/:startDate/:endDate",getCaloriesBurnBetweenDays)


module.exports = router;

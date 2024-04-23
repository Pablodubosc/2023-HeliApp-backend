const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/handleJWT");
const extractUserIdMiddleware = require("../utils/handleUserID");
const { validatorCreateExerciseDone } = require("../validators/exerciseDone");
const {
  createExerciseDone,
  getExerciseDoneByUserId,
  updateExerciseDoneById,
  deleteExerciseDoneById,
  getCaloriesBurnByDays,
  getExerciseDoneByUserIdAndDate,
  getCaloriesBurnBetweenDays
} = require("../controllers/exerciseDone");

router.get("/user/", verifyToken, extractUserIdMiddleware, getExerciseDoneByUserId);
router.get("/user/date/:date", verifyToken, extractUserIdMiddleware, getExerciseDoneByUserIdAndDate);
router.post("/", verifyToken,validatorCreateExerciseDone, extractUserIdMiddleware, createExerciseDone);
router.put("/:id", verifyToken, extractUserIdMiddleware, updateExerciseDoneById);
router.delete("/:id", verifyToken, extractUserIdMiddleware, deleteExerciseDoneById);
router.get("/user/startDate/:startDate/endDate/:endDate", verifyToken, extractUserIdMiddleware,getCaloriesBurnByDays)
router.get("/user/between/:startDate/:endDate", verifyToken, extractUserIdMiddleware,getCaloriesBurnBetweenDays)


module.exports = router;

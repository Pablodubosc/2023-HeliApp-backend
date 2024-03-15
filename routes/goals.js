const express = require("express");
const router = express.Router();
const {
  getGoalsByUserId,
  createGoal,
  updateGoal,
  deleteGoal,
  getActiveGoalsByUserId,
  getGoalsByUserWithProgress
} = require("../controllers/goals");
const { verifyToken } = require("../utils/handleJWT");
const extractUserIdMiddleware = require("../utils/handleUserId");


router.get("/:userId",verifyToken, extractUserIdMiddleware, getGoalsByUserId);
router.get("/activeGoals/", verifyToken,
extractUserIdMiddleware, getActiveGoalsByUserId);
router.get("/goalsWithProgress/", verifyToken,
extractUserIdMiddleware,getGoalsByUserWithProgress)
router.post("/",extractUserIdMiddleware, createGoal);
router.put("/:goalId",extractUserIdMiddleware, updateGoal);
router.delete("/:goalId",extractUserIdMiddleware, deleteGoal);

module.exports = router;

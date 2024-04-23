const express = require("express");
const router = express.Router();
const {
  getGoalsByUserId,
  createGoal,
  updateGoal,
  deleteGoal,
  getActiveGoalsByUserId,
  getGoalsByUserWithProgress,
} = require("../controllers/goals");
const { verifyToken } = require("../utils/handleJWT");
const extractUserIdMiddleware = require("../utils/handleUserID");

router.get("/", verifyToken, extractUserIdMiddleware, getGoalsByUserId);
router.get(
  "/activeGoals/",
  verifyToken,
  extractUserIdMiddleware,
  getActiveGoalsByUserId
);
router.get(
  "/goalsWithProgress/",
  verifyToken,
  extractUserIdMiddleware,
  getGoalsByUserWithProgress
);
router.post("/", verifyToken, extractUserIdMiddleware, createGoal);
router.put("/:goalId", verifyToken, extractUserIdMiddleware, updateGoal);
router.delete("/:goalId", verifyToken, extractUserIdMiddleware, deleteGoal);

module.exports = router;

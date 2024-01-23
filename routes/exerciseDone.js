const express = require("express");
const router = express.Router();
const {
  getExerciseDone,
  createExerciseDone,
  getExerciseDoneByUserId,
  updateExerciseDoneById,
  deleteExerciseDoneById
} = require("../controllers/exerciseDone");

router.get("/", getExerciseDone);
router.get("/user/:id", getExerciseDoneByUserId);
router.post("/", createExerciseDone);
router.put("/:id", updateExerciseDoneById);
router.delete("/:id", deleteExerciseDoneById);

module.exports = router;

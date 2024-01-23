const express = require("express");
const router = express.Router();
const {
  getExercise,
  createExercise,
} = require("../controllers/exercise");

router.get("/", getExercise);
router.post("/", createExercise);


module.exports = router;
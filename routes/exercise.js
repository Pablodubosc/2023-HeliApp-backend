const express = require("express");
const router = express.Router();
const {
  getExercise,
  createExercise,
} = require("../controllers/exercise");
const { validatorCreateExercise} = require("../validators/exercise");
const { verifyToken } = require("../utils/handleJWT");

router.get("/",verifyToken, getExercise);
router.post("/",validatorCreateExercise,verifyToken, createExercise);


module.exports = router;
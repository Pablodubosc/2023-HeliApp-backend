const express = require("express");
const router = express.Router();
const {
  createPlan,
  getPlansByUserId
} = require("../controllers/plans");


router.post("/",createPlan)
router.get("/:id",getPlansByUserId)

module.exports = router;

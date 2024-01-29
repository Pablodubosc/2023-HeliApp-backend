const express = require("express");
const router = express.Router();
const {
  createPlan,
  getPlansByUserId,
  updatePlanById
} = require("../controllers/plans");


router.post("/",createPlan)
router.get("/:id",getPlansByUserId)
router.put("/",updatePlanById)

module.exports = router;

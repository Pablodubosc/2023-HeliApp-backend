const express = require("express");
const router = express.Router();
const {
  createPlan,
  getPlansByUserId,
  updatePlanById
} = require("../controllers/plans");
const { validatorCreatePlan } = require("../validators/plans");

router.post("/",validatorCreatePlan,createPlan)
router.get("/:id",getPlansByUserId)
router.put("/",updatePlanById)

module.exports = router;

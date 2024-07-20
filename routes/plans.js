const express = require("express");
const router = express.Router();
const {
  createPlan,
  getPlansByUserId,
  deletePlanById,
  updatePlanById
} = require("../controllers/plans");
const { validatorCreatePlan } = require("../validators/plans");
const { verifyToken } = require("../utils/handleJWT");
const extractUserIdMiddleware = require("../utils/handleUserID");

router.post("/",validatorCreatePlan,verifyToken, extractUserIdMiddleware,createPlan)
router.get("/",verifyToken, extractUserIdMiddleware,getPlansByUserId)
router.delete("/:id", verifyToken, extractUserIdMiddleware, deletePlanById);
router.put("/",verifyToken, extractUserIdMiddleware,updatePlanById)

module.exports = router;

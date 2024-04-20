const express = require("express");
const router = express.Router();
const {
  createIntermittentFasting,
  getIntermittentFastingByUserId,
  getActiveIntermittentFastingByUserId,
  deleteActiveIntermittentFasting,
} = require("../controllers/intermittentFasting");
const { verifyToken } = require("../utils/handleJWT");
const extractUserIdMiddleware = require("../utils/handleUserID");

router.post(
  "/",
  verifyToken,
  extractUserIdMiddleware,
  createIntermittentFasting
);
router.get(
  "/:userId",
  verifyToken,
  extractUserIdMiddleware,
  getIntermittentFastingByUserId
);
router.get(
  "/active/:userId",
  verifyToken,
  extractUserIdMiddleware,
  getActiveIntermittentFastingByUserId
);
router.delete(
  "/active/:IntermittentFastingId",
  verifyToken,
  extractUserIdMiddleware,
  deleteActiveIntermittentFasting
);

module.exports = router;

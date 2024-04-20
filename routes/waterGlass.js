const express = require("express");
const router = express.Router();
const {
  createWaterGlass,
  getWaterGlassByUserId,
  getWaterGlassForUserIdByDay,
} = require("../controllers/waterGlass");
const { verifyToken } = require("../utils/handleJWT");
const extractUserIdMiddleware = require("../utils/handleUserID");

router.post("/", verifyToken, extractUserIdMiddleware, createWaterGlass);
router.get("/", verifyToken, extractUserIdMiddleware, getWaterGlassByUserId);
router.get(
  "/countByDay/",
  verifyToken,
  extractUserIdMiddleware,
  getWaterGlassForUserIdByDay
);

module.exports = router;
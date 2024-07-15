const express = require("express");
const router = express.Router();
const {
  sendResetPasswordEmail,
  validateToken,
} = require("../controllers/notifications");
const { validatorSendEmail } = require("../validators/notifications");
const extractUserIdMiddleware = require("../utils/handleUserID");

router.post("/sendEmail", validatorSendEmail, sendResetPasswordEmail);
router.get("/validateToken/:token", validateToken);

module.exports = router;
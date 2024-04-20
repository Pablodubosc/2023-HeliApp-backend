const express = require("express");
const router = express.Router();
const { getCategories, createCategory } = require("../controllers/category");
const { validatorCreateCategory } = require("../validators/category");
const { verifyToken } = require("../utils/handleJWT");

router.get("/", verifyToken, getCategories);
router.post("/", verifyToken, validatorCreateCategory, createCategory);

module.exports = router;
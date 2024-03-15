const express = require('express');
const router = express.Router();
const { validatorRegisterUser, validatorLoginUser } = require('../validators/auth');
const { registerController, loginController, getUser, getUserByEmail, deleteUser, updateUserPassword, updateUser } = require('../controllers/auth');
const { verifyToken } = require("../utils/handleJWT");
const extractUserIdMiddleware = require("../utils/handleUserID");

router.get("/users/",verifyToken,extractUserIdMiddleware, getUser);
router.get("/users/email/:email",verifyToken, getUserByEmail);
router.delete("/users/",verifyToken,extractUserIdMiddleware, deleteUser);
router.put("/users/updatePassword/",verifyToken,extractUserIdMiddleware, updateUserPassword);
router.put("/users/",verifyToken,extractUserIdMiddleware, updateUser);
router.post("/register", validatorRegisterUser, registerController);
router.post("/login", validatorLoginUser, loginController);

module.exports = router;
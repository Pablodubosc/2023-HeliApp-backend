const express = require('express');
const router = express.Router();
const { validatorRegisterUser, validatorLoginUser } = require('../validators/auth');
const { registerController, loginController, getUser, getUserByEmail, deleteUser, updateUserPassword, updateUser } = require('../controllers/auth');
const { verifyToken } = require("../utils/handleJWT");
const extractUserIdMiddleware = require("../utils/handleUserID");

router.get("/users/",verifyToken,extractUserIdMiddleware, getUser); // este tampoco se usa en front... existe solo para chequear back
//router.get("/users/email/:email",verifyToken, extractUserIdMiddleware, getUserByEmail); // creo que no se usa nunca desde el front.. borrarlo da problemas lo del mail en el a url pq habria que chequear q el token sea el mismo que el de la url
router.delete("/users/",verifyToken,extractUserIdMiddleware, deleteUser);
router.put("/users/updatePassword/",verifyToken,extractUserIdMiddleware, updateUserPassword);
router.put("/users/",verifyToken,extractUserIdMiddleware, updateUser);
router.post("/register/", validatorRegisterUser, registerController);
router.post("/login/", validatorLoginUser, loginController);

module.exports = router;
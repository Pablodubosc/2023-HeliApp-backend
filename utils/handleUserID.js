const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv"); // Importa dotenv

dotenv.config(); // Carga las variables de entorno desde el archivo .env

const secretKey = process.env.JWT_SECRET; // Usa la variable de entorno o un valor predeterminado

const extractUserIdMiddleware = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Agregar el userId al objeto req
    req.userId = decoded._id;
    next();
  });
};

module.exports = extractUserIdMiddleware;
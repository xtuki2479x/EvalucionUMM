const express = require("express");
const {
  requireAuth
} = require("../middlewares/authMiddleware");

function crearAuthRoutes(authController) {
  const router = express.Router();

  router.post("/register", authController.register);
  router.post("/login", authController.login);
  router.post("/logout", authController.logout);
  router.get("/me", requireAuth, authController.me);

  return router;
}

module.exports = { crearAuthRoutes };

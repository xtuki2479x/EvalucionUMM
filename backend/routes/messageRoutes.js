const express = require("express");
const {
  requireAuth
} = require("../middlewares/authMiddleware");

function crearMessageRoutes(messageController) {
  const router = express.Router();

  router.use(requireAuth);
  router.post("/", messageController.create);
  router.get("/", messageController.list);

  return router;
}

module.exports = { crearMessageRoutes };

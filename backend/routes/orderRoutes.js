const express = require("express");
const {
  requireAuth
} = require("../middlewares/authMiddleware");

function crearOrderRoutes(orderController) {
  const router = express.Router();

  router.use(requireAuth);
  router.post("/", orderController.create);
  router.get("/", orderController.list);

  return router;
}

module.exports = { crearOrderRoutes };

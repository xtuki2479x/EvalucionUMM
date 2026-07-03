function crearOrderController(orderModel) {
  function create(req, res, next) {
    const productos =
      req.body.productos || req.body.items;

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        mensaje: "El carrito debe contener al menos un producto."
      });
    }

    try {
      const orden = orderModel.crearOrden(
        req.session.usuario.id,
        productos
      );

      return res.status(201).json({
        mensaje: "Compra registrada correctamente.",
        orden
      });
    } catch (error) {
      if (error.message === "PRODUCTO_INVALIDO") {
        return res.status(400).json({
          mensaje: "El carrito contiene productos inválidos."
        });
      }

      return next(error);
    }
  }

  function list(req, res, next) {
    try {
      const ordenes =
        orderModel.listarOrdenesPorUsuario(
          req.session.usuario.id
        );

      return res.json({ ordenes });
    } catch (error) {
      return next(error);
    }
  }

  return { create, list };
}

module.exports = { crearOrderController };

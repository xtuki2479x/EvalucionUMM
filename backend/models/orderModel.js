function crearOrderModel(baseDatos) {
  const insertarOrden = baseDatos.prepare(`
    INSERT INTO ordenes (usuario_id, total, estado)
    VALUES (?, ?, ?)
  `);

  const insertarDetalle = baseDatos.prepare(`
    INSERT INTO orden_detalle (
      orden_id,
      servicio_nombre,
      precio,
      cantidad
    )
    VALUES (?, ?, ?, ?)
  `);

  function normalizarProductos(productos) {
    return productos.map((producto) => {
      const servicioNombre = String(
        producto.servicioNombre ||
        producto.servicio_nombre ||
        producto.nombre ||
        ""
      ).trim();
      const precio = Number(producto.precio);
      const cantidad = Number(producto.cantidad || 1);

      if (
        !servicioNombre ||
        !Number.isFinite(precio) ||
        precio < 0 ||
        !Number.isInteger(cantidad) ||
        cantidad < 1
      ) {
        throw new Error("PRODUCTO_INVALIDO");
      }

      return { servicioNombre, precio, cantidad };
    });
  }

  function crearOrden(usuarioId, productos) {
    const detalles = normalizarProductos(productos);
    const total = detalles.reduce(
      (suma, detalle) =>
        suma + detalle.precio * detalle.cantidad,
      0
    );

    baseDatos.exec("BEGIN IMMEDIATE");

    try {
      const resultado = insertarOrden.run(
        usuarioId,
        total,
        "Pendiente"
      );
      const ordenId = Number(resultado.lastInsertRowid);

      detalles.forEach((detalle) => {
        insertarDetalle.run(
          ordenId,
          detalle.servicioNombre,
          detalle.precio,
          detalle.cantidad
        );
      });

      baseDatos.exec("COMMIT");

      return buscarOrdenPorId(ordenId, usuarioId);
    } catch (error) {
      baseDatos.exec("ROLLBACK");
      throw error;
    }
  }

  function buscarOrdenPorId(id, usuarioId) {
    const orden = baseDatos
      .prepare(`
        SELECT id, total, estado, creado_en
        FROM ordenes
        WHERE id = ? AND usuario_id = ?
      `)
      .get(id, usuarioId);

    if (!orden) {
      return null;
    }

    orden.productos = baseDatos
      .prepare(`
        SELECT
          id,
          servicio_nombre,
          precio,
          cantidad
        FROM orden_detalle
        WHERE orden_id = ?
        ORDER BY id
      `)
      .all(id);

    return orden;
  }

  function listarOrdenesPorUsuario(usuarioId) {
    const ordenes = baseDatos
      .prepare(`
        SELECT id, total, estado, creado_en
        FROM ordenes
        WHERE usuario_id = ?
        ORDER BY id DESC
      `)
      .all(usuarioId);

    return ordenes.map((orden) =>
      buscarOrdenPorId(orden.id, usuarioId)
    );
  }

  return {
    crearOrden,
    listarOrdenesPorUsuario
  };
}

module.exports = { crearOrderModel };

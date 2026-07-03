function crearMessageModel(baseDatos) {
  function crearMensaje(usuario, mensaje) {
    const resultado = baseDatos
      .prepare(`
        INSERT INTO mensajes (
          usuario_id,
          nombre_usuario,
          mensaje
        )
        VALUES (?, ?, ?)
      `)
      .run(usuario.id, usuario.nombre, mensaje);

    return baseDatos
      .prepare(`
        SELECT
          id,
          usuario_id,
          nombre_usuario,
          mensaje,
          creado_en
        FROM mensajes
        WHERE id = ?
      `)
      .get(Number(resultado.lastInsertRowid));
  }

  function listarMensajesPorUsuario(usuarioId) {
    return baseDatos
      .prepare(`
        SELECT
          id,
          usuario_id,
          nombre_usuario,
          mensaje,
          creado_en
        FROM mensajes
        WHERE usuario_id = ?
        ORDER BY id
      `)
      .all(usuarioId);
  }

  return {
    crearMensaje,
    listarMensajesPorUsuario
  };
}

module.exports = { crearMessageModel };

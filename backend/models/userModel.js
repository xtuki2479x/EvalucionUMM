function crearUserModel(baseDatos) {
  const columnasUsuario = `
    id,
    nombre,
    email,
    password_hash,
    rol,
    activo,
    creado_en
  `;

  function crearUsuario(nombre, email, passwordHash) {
    const resultado = baseDatos
      .prepare(`
        INSERT INTO usuarios (nombre, email, password_hash)
        VALUES (?, ?, ?)
      `)
      .run(nombre, email, passwordHash);

    return buscarUsuarioPorId(Number(resultado.lastInsertRowid));
  }

  function buscarUsuarioPorEmail(email) {
    return baseDatos
      .prepare(`
        SELECT ${columnasUsuario}
        FROM usuarios
        WHERE email = ?
      `)
      .get(email);
  }

  function buscarUsuarioPorId(id) {
    return baseDatos
      .prepare(`
        SELECT ${columnasUsuario}
        FROM usuarios
        WHERE id = ?
      `)
      .get(id);
  }

  function existeUsuario(email) {
    const resultado = baseDatos
      .prepare(`
        SELECT EXISTS(
          SELECT 1 FROM usuarios WHERE email = ?
        ) AS existe
      `)
      .get(email);

    return resultado.existe === 1;
  }

  function listarUsuarios() {
    return baseDatos
      .prepare(`
        SELECT id, nombre, email, rol, activo, creado_en
        FROM usuarios
        ORDER BY nombre
      `)
      .all();
  }

  return {
    buscarUsuarioPorEmail,
    buscarUsuarioPorId,
    crearUsuario,
    existeUsuario,
    listarUsuarios
  };
}

module.exports = { crearUserModel };

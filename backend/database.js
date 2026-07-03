const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const bcrypt = require("bcryptjs");

function crearBaseDatos(rutaBaseDatos) {
  const baseDatos = new DatabaseSync(rutaBaseDatos);

  baseDatos.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'usuario',
      activo INTEGER NOT NULL DEFAULT 1,
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return baseDatos;
}

function crearUsuarioInicial(baseDatos) {
  const correo = "demo@espacio.cl";
  const usuarioExistente = baseDatos
    .prepare("SELECT id FROM usuarios WHERE correo = ?")
    .get(correo);

  if (usuarioExistente) {
    return;
  }

  const passwordHash = bcrypt.hashSync("Demo1234", 10);

  baseDatos
    .prepare(`
      INSERT INTO usuarios (nombre, correo, password_hash, rol)
      VALUES (?, ?, ?, ?)
    `)
    .run("Usuario Demo", correo, passwordHash, "usuario");
}

function obtenerUsuarioPorCorreo(baseDatos, correo) {
  return baseDatos
    .prepare(`
      SELECT id, nombre, correo, password_hash, rol, activo
      FROM usuarios
      WHERE correo = ?
    `)
    .get(correo);
}

function usuarioPublico(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol
  };
}

function rutaBaseDatosPredeterminada() {
  return path.join(__dirname, "..", "data", "app.db");
}

module.exports = {
  crearBaseDatos,
  crearUsuarioInicial,
  obtenerUsuarioPorCorreo,
  rutaBaseDatosPredeterminada,
  usuarioPublico
};

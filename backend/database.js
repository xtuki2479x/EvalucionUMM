const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

function rutaBaseDatosPredeterminada() {
  return path.join(__dirname, "..", "data", "app.db");
}

function obtenerColumnas(baseDatos, tabla) {
  return baseDatos
    .prepare(`PRAGMA table_info(${tabla})`)
    .all()
    .map((columna) => columna.name);
}

function prepararMigracionUsuarios(baseDatos) {
  const tablaUsuarios = baseDatos
    .prepare(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table' AND name = 'usuarios'
    `)
    .get();

  if (!tablaUsuarios) {
    return null;
  }

  const columnas = obtenerColumnas(baseDatos, "usuarios");

  if (columnas.includes("email") || !columnas.includes("correo")) {
    return null;
  }

  baseDatos.exec(
    "ALTER TABLE usuarios RENAME TO usuarios_legacy"
  );

  return new Set(columnas);
}

function copiarUsuariosLegacy(baseDatos, columnas) {
  if (!columnas) {
    return;
  }

  const password = columnas.has("password_hash")
    ? "password_hash"
    : "password";
  const rol = columnas.has("rol") ? "rol" : "'usuario'";
  const activo = columnas.has("activo") ? "activo" : "1";
  const creadoEn = columnas.has("creado_en")
    ? "creado_en"
    : "CURRENT_TIMESTAMP";

  baseDatos.exec(`
    INSERT INTO usuarios (
      id,
      nombre,
      email,
      password_hash,
      rol,
      activo,
      creado_en
    )
    SELECT
      id,
      nombre,
      correo,
      ${password},
      ${rol},
      ${activo},
      ${creadoEn}
    FROM usuarios_legacy;

    DROP TABLE usuarios_legacy;
  `);
}

function crearBaseDatos(rutaBaseDatos = rutaBaseDatosPredeterminada()) {
  if (rutaBaseDatos !== ":memory:") {
    fs.mkdirSync(path.dirname(rutaBaseDatos), {
      recursive: true
    });
  }

  const baseDatos = new DatabaseSync(rutaBaseDatos);
  baseDatos.exec("PRAGMA foreign_keys = ON;");

  const columnasLegacy =
    prepararMigracionUsuarios(baseDatos);
  const esquema = fs.readFileSync(
    path.join(__dirname, "..", "database.sql"),
    "utf8"
  );

  baseDatos.exec(esquema);
  copiarUsuariosLegacy(baseDatos, columnasLegacy);

  return baseDatos;
}

module.exports = {
  crearBaseDatos,
  rutaBaseDatosPredeterminada
};

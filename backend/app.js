const path = require("node:path");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const {
  crearBaseDatos,
  crearUsuarioInicial,
  obtenerUsuarioPorCorreo,
  rutaBaseDatosPredeterminada,
  usuarioPublico
} = require("./database");

const EXPRESION_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function crearAplicacion(opciones = {}) {
  const app = express();
  const rutaProyecto = path.join(__dirname, "..");
  const rutaBaseDatos =
    opciones.rutaBaseDatos || rutaBaseDatosPredeterminada();
  const baseDatos =
    opciones.baseDatos || crearBaseDatos(rutaBaseDatos);

  crearUsuarioInicial(baseDatos);

  app.disable("x-powered-by");
  app.use(express.json({ limit: "20kb" }));
  app.use(
    session({
      name: "espacio.sid",
      secret:
        opciones.secretoSesion ||
        process.env.SESSION_SECRET ||
        "cambiar-este-secreto-en-produccion",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 2
      }
    })
  );

  app.post("/api/auth/login", async (req, res) => {
    const correo = String(req.body.correo || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

  app.post("/api/auth/register", async (req, res) => {
    const nombre = String(req.body.nombre || "").trim();
    const correo = String(req.body.correo || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!nombre || nombre.length < 2) {
      return res.status(400).json({
        mensaje: "El nombre debe tener al menos 2 caracteres."
      });
    }

    if (!EXPRESION_CORREO.test(correo)) {
      return res.status(400).json({
        mensaje: "Ingresa un correo electrónico válido."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres."
      });
    }

    // verificar si ya existe usuario
    const existente = obtenerUsuarioPorCorreo(baseDatos, correo);

    if (existente) {
      return res.status(409).json({
        mensaje: "Este correo ya está registrado."
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const password_hash = await bcrypt.hash(password, 10);

    const stmt = baseDatos.prepare(`
      INSERT INTO usuarios (nombre, correo, password)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(nombre, correo, password_hash);

    const result = stmt.run(nombre, correo, password_hash);

    const usuario = obtenerUsuarioPorCorreo(baseDatos, correo);

    req.session.usuario = usuarioPublico(usuario);

    return req.session.save((error) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error al crear sesión."
        });
      }

      return res.json({
        mensaje: "Usuario registrado correctamente.",
        usuario: req.session.usuario
      });
    });
  });

    if (!EXPRESION_CORREO.test(correo)) {
      return res.status(400).json({
        mensaje: "Ingresa un correo electrónico válido."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres."
      });
    }

    const usuario = obtenerUsuarioPorCorreo(baseDatos, correo);
    const credencialesValidas =
    usuario &&
    (await bcrypt.compare(password, usuario.password));

    if (!credencialesValidas) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos."
      });
    }

    req.session.usuario = usuarioPublico(usuario);

    return req.session.save((error) => {
      if (error) {
        console.error("No fue posible guardar la sesión:", error);
        return res.status(500).json({
          mensaje: "No fue posible iniciar sesión."
        });
      }

      return res.json({
        mensaje: "Sesión iniciada correctamente.",
        usuario: req.session.usuario
      });
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    if (!req.session) {
      return res.json({ mensaje: "Sesión cerrada correctamente." });
    }

    return req.session.destroy((error) => {
      if (error) {
        console.error("No fue posible cerrar la sesión:", error);
        return res.status(500).json({
          mensaje: "No fue posible cerrar la sesión."
        });
      }

      res.clearCookie("espacio.sid");
      return res.json({ mensaje: "Sesión cerrada correctamente." });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.usuario) {
      return res.status(401).json({
        mensaje: "No existe una sesión activa."
      });
    }

    return res.json({ usuario: req.session.usuario });
  });

  app.use(express.static(rutaProyecto));

  app.use("/api", (_req, res) => {
    res.status(404).json({ mensaje: "Ruta de API no encontrada." });
  });

  app.get("*splat", (_req, res) => {
    res.sendFile(path.join(rutaProyecto, "index.html"));
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({
      mensaje: "Ocurrió un error interno en el servidor."
    });
  });

  return { app, baseDatos };
}

module.exports = { crearAplicacion };

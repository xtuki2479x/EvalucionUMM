const path = require("node:path");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { crearBaseDatos } = require("./database");
const { crearUserModel } = require("./models/userModel");
const {
  crearAuthController
} = require("./controllers/authController");
const { crearAuthRoutes } = require("./routes/authRoutes");

function crearUsuarioInicial(userModel) {
  const email = "demo@espacio.cl";

  if (userModel.existeUsuario(email)) {
    return;
  }

  const passwordHash = bcrypt.hashSync("Demo1234", 10);
  userModel.crearUsuario(
    "Usuario Demo",
    email,
    passwordHash
  );
}

function crearAplicacion(opciones = {}) {
  const app = express();
  const rutaProyecto = path.join(__dirname, "..");
  const baseDatos =
    opciones.baseDatos ||
    crearBaseDatos(opciones.rutaBaseDatos);
  const userModel = crearUserModel(baseDatos);

  crearUsuarioInicial(userModel);

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

  const authController = crearAuthController(userModel);

  app.use(
    "/api/auth",
    crearAuthRoutes(authController)
  );

  app.use(express.static(rutaProyecto));

  app.use("/api", (_req, res) => {
    res.status(404).json({
      mensaje: "Ruta de API no encontrada."
    });
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

  return {
    app,
    baseDatos,
    models: { userModel }
  };
}

module.exports = { crearAplicacion };

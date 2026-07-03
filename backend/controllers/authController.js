const bcrypt = require("bcryptjs");

const EXPRESION_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function usuarioPublico(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    correo: usuario.email,
    rol: usuario.rol
  };
}

function guardarSesion(req, res, usuario, mensaje, estado = 200) {
  req.session.usuario = usuarioPublico(usuario);

  return req.session.save((error) => {
    if (error) {
      console.error("No fue posible guardar la sesión:", error);
      return res.status(500).json({
        mensaje: "No fue posible guardar la sesión."
      });
    }

    return res.status(estado).json({
      mensaje,
      usuario: req.session.usuario
    });
  });
}

function crearAuthController(userModel) {
  async function register(req, res, next) {
    try {
      const nombre = String(req.body.nombre || "").trim();
      const email = String(
        req.body.email || req.body.correo || ""
      )
        .trim()
        .toLowerCase();
      const password = String(req.body.password || "");

      if (!nombre) {
        return res.status(400).json({
          mensaje: "El nombre es obligatorio."
        });
      }

      if (!EXPRESION_EMAIL.test(email)) {
        return res.status(400).json({
          mensaje: "Ingresa un correo electrónico válido."
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          mensaje:
            "La contraseña debe tener al menos 6 caracteres."
        });
      }

      if (userModel.existeUsuario(email)) {
        return res.status(409).json({
          mensaje: "Este correo ya está registrado."
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const usuario = userModel.crearUsuario(
        nombre,
        email,
        passwordHash
      );

      return guardarSesion(
        req,
        res,
        usuario,
        "Usuario registrado correctamente.",
        201
      );
    } catch (error) {
      if (String(error.message).includes("UNIQUE")) {
        return res.status(409).json({
          mensaje: "Este correo ya está registrado."
        });
      }

      return next(error);
    }
  }

  async function login(req, res, next) {
    try {
      const email = String(
        req.body.email || req.body.correo || ""
      )
        .trim()
        .toLowerCase();
      const password = String(req.body.password || "");

      if (!EXPRESION_EMAIL.test(email)) {
        return res.status(400).json({
          mensaje: "Ingresa un correo electrónico válido."
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          mensaje:
            "La contraseña debe tener al menos 6 caracteres."
        });
      }

      const usuario = userModel.buscarUsuarioPorEmail(email);
      const credencialesValidas =
        usuario &&
        usuario.activo === 1 &&
        (await bcrypt.compare(password, usuario.password_hash));

      if (!credencialesValidas) {
        return res.status(401).json({
          mensaje: "Correo o contraseña incorrectos."
        });
      }

      return guardarSesion(
        req,
        res,
        usuario,
        "Sesión iniciada correctamente."
      );
    } catch (error) {
      return next(error);
    }
  }

  function logout(req, res, next) {
    if (!req.session) {
      return res.json({
        mensaje: "Sesión cerrada correctamente."
      });
    }

    return req.session.destroy((error) => {
      if (error) {
        return next(error);
      }

      res.clearCookie("espacio.sid");
      return res.json({
        mensaje: "Sesión cerrada correctamente."
      });
    });
  }

  function me(req, res) {
    return res.json({
      usuario: req.session.usuario
    });
  }

  return { login, logout, me, register };
}

module.exports = { crearAuthController };

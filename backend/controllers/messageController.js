function mensajePublico(registro) {
  return {
    id: registro.id,
    autor: "usuario",
    texto: registro.mensaje,
    fecha: registro.creado_en,
    usuarioNombre: registro.nombre_usuario
  };
}

function crearMessageController(messageModel) {
  function create(req, res, next) {
    const mensaje = String(
      req.body.mensaje || req.body.texto || ""
    ).trim();

    if (!mensaje) {
      return res.status(400).json({
        mensaje: "El mensaje no puede estar vacío."
      });
    }

    if (mensaje.length > 500) {
      return res.status(400).json({
        mensaje: "El mensaje no puede superar 500 caracteres."
      });
    }

    try {
      const registro = messageModel.crearMensaje(
        req.session.usuario,
        mensaje
      );

      return res.status(201).json({
        mensaje: "Mensaje enviado correctamente.",
        datos: mensajePublico(registro)
      });
    } catch (error) {
      return next(error);
    }
  }

  function list(req, res, next) {
    try {
      const mensajes =
        messageModel.listarMensajesPorUsuario(
          req.session.usuario.id
        );

      return res.json({
        mensajes: mensajes.map(mensajePublico)
      });
    } catch (error) {
      return next(error);
    }
  }

  return { create, list };
}

module.exports = { crearMessageController };

function requireAuth(req, res, next) {
  if (!req.session?.usuario) {
    return res.status(401).json({
      mensaje: "Debes iniciar sesión para continuar."
    });
  }

  return next();
}

module.exports = { requireAuth };

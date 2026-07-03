const { crearAplicacion } = require("./app");

function iniciarServidor(puerto = Number(process.env.PORT) || 3000) {
  const { app } = crearAplicacion();

  return app.listen(puerto, () => {
    console.log(
      `Servidor disponible en http://localhost:${puerto}`
    );
  });
}

if (require.main === module) {
  iniciarServidor();
}

module.exports = { iniciarServidor };

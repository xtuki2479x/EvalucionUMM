const fs = require("node:fs");
const path = require("node:path");
const { crearAplicacion } = require("./backend/app");

const puerto = Number(process.env.PORT) || 3000;
const carpetaDatos = path.join(__dirname, "data");

fs.mkdirSync(carpetaDatos, { recursive: true });

const { app } = crearAplicacion();

app.listen(puerto, () => {
  console.log(`Servidor disponible en http://localhost:${puerto}`);
});

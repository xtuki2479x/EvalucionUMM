const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { crearAplicacion } = require("../backend/app");

let baseDatos;
let servidor;
let urlBase;

before(async () => {
  const aplicacion = crearAplicacion({
    rutaBaseDatos: ":memory:",
    secretoSesion: "secreto-solo-para-pruebas"
  });

  baseDatos = aplicacion.baseDatos;

  await new Promise((resolve) => {
    servidor = aplicacion.app.listen(
      0,
      "127.0.0.1",
      resolve
    );
  });

  const direccion = servidor.address();
  urlBase = `http://127.0.0.1:${direccion.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    servidor.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  baseDatos.close();
});

async function solicitar(ruta, opciones = {}, cookie = "") {
  const headers = { ...(opciones.headers || {}) };

  if (opciones.body) {
    headers["Content-Type"] = "application/json";
  }

  if (cookie) {
    headers.Cookie = cookie;
  }

  return fetch(`${urlBase}${ruta}`, {
    ...opciones,
    headers
  });
}

function post(ruta, cuerpo, cookie = "") {
  return solicitar(
    ruta,
    {
      method: "POST",
      body: JSON.stringify(cuerpo)
    },
    cookie
  );
}

function extraerCookie(respuesta) {
  return respuesta.headers
    .get("set-cookie")
    .split(";")[0];
}

async function iniciarSesionDemo() {
  const respuesta = await post("/api/auth/login", {
    email: "demo@espacio.cl",
    password: "Demo1234"
  });

  assert.equal(respuesta.status, 200);
  return extraerCookie(respuesta);
}

test("registra un usuario e inicia su sesión", async () => {
  const respuesta = await post("/api/auth/register", {
    nombre: "Persona Nueva",
    email: "persona@nueva.cl",
    password: "secreto"
  });
  const datos = await respuesta.json();

  assert.equal(respuesta.status, 201);
  assert.equal(datos.usuario.email, "persona@nueva.cl");
  assert.equal("password_hash" in datos.usuario, false);
  assert.ok(extraerCookie(respuesta));
});

test("rechaza registro con email inválido", async () => {
  const respuesta = await post("/api/auth/register", {
    nombre: "Persona",
    email: "correo-invalido",
    password: "secreto"
  });

  assert.equal(respuesta.status, 400);
});

test("rechaza registro con contraseña corta", async () => {
  const respuesta = await post("/api/auth/register", {
    nombre: "Persona",
    email: "corta@correo.cl",
    password: "12345"
  });

  assert.equal(respuesta.status, 400);
});

test("rechaza registro con email repetido", async () => {
  const respuesta = await post("/api/auth/register", {
    nombre: "Usuario Repetido",
    email: "demo@espacio.cl",
    password: "secreto"
  });

  assert.equal(respuesta.status, 409);
});

test("permite iniciar sesión con credenciales correctas", async () => {
  const respuesta = await post("/api/auth/login", {
    email: "demo@espacio.cl",
    password: "Demo1234"
  });
  const datos = await respuesta.json();

  assert.equal(respuesta.status, 200);
  assert.equal(datos.usuario.email, "demo@espacio.cl");
  assert.equal("password_hash" in datos.usuario, false);
});

test("rechaza credenciales incorrectas", async () => {
  const respuesta = await post("/api/auth/login", {
    email: "demo@espacio.cl",
    password: "Incorrecta123"
  });

  assert.equal(respuesta.status, 401);
});

test("devuelve la sesión del usuario autenticado", async () => {
  const cookie = await iniciarSesionDemo();
  const respuesta = await solicitar(
    "/api/auth/me",
    {},
    cookie
  );
  const datos = await respuesta.json();

  assert.equal(respuesta.status, 200);
  assert.equal(datos.usuario.nombre, "Usuario Demo");
});

test("rechaza consulta de sesión sin autenticación", async () => {
  const respuesta = await solicitar("/api/auth/me");

  assert.equal(respuesta.status, 401);
});

test("cierra una sesión activa", async () => {
  const cookie = await iniciarSesionDemo();
  const logout = await solicitar(
    "/api/auth/logout",
    { method: "POST" },
    cookie
  );
  const sesion = await solicitar(
    "/api/auth/me",
    {},
    cookie
  );

  assert.equal(logout.status, 200);
  assert.equal(sesion.status, 401);
});

test("rechaza crear una orden sin sesión", async () => {
  const respuesta = await post("/api/orders", {
    productos: [
      {
        servicioNombre: "Lectura general",
        precio: 15000,
        cantidad: 1
      }
    ]
  });

  assert.equal(respuesta.status, 401);
});

test("guarda y lista órdenes del usuario", async () => {
  const cookie = await iniciarSesionDemo();
  const crear = await post(
    "/api/orders",
    {
      productos: [
        {
          servicioNombre: "Lectura general",
          precio: 15000,
          cantidad: 2
        }
      ]
    },
    cookie
  );
  const datosCrear = await crear.json();
  const listar = await solicitar(
    "/api/orders",
    {},
    cookie
  );
  const datosListar = await listar.json();

  assert.equal(crear.status, 201);
  assert.equal(datosCrear.orden.total, 30000);
  assert.equal(listar.status, 200);
  assert.equal(datosListar.ordenes.length, 1);
});

test("rechaza enviar un mensaje sin sesión", async () => {
  const respuesta = await post("/api/messages", {
    mensaje: "Mensaje sin sesión"
  });

  assert.equal(respuesta.status, 401);
});

test("guarda y lista mensajes del usuario", async () => {
  const cookie = await iniciarSesionDemo();
  const crear = await post(
    "/api/messages",
    { mensaje: "Necesito orientación" },
    cookie
  );
  const datosCrear = await crear.json();
  const listar = await solicitar(
    "/api/messages",
    {},
    cookie
  );
  const datosListar = await listar.json();

  assert.equal(crear.status, 201);
  assert.equal(
    datosCrear.datos.texto,
    "Necesito orientación"
  );
  assert.equal(listar.status, 200);
  assert.equal(datosListar.mensajes.length, 1);
});

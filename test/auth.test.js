const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { crearAplicacion } = require("../backend/app");

let servidor;
let urlBase;

before(async () => {
  const { app } = crearAplicacion({
    rutaBaseDatos: ":memory:",
    secretoSesion: "secreto-solo-para-pruebas"
  });

  await new Promise((resolve) => {
    servidor = app.listen(0, "127.0.0.1", resolve);
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
});

test("rechaza un correo con formato inválido", async () => {
  const respuesta = await fetch(`${urlBase}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      correo: "correo-invalido",
      password: "Demo1234"
    })
  });

  assert.equal(respuesta.status, 400);
});

test("rechaza credenciales incorrectas", async () => {
  const respuesta = await fetch(`${urlBase}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      correo: "demo@espacio.cl",
      password: "Incorrecta123"
    })
  });

  assert.equal(respuesta.status, 401);
});

test("permite iniciar sesión y cerrar sesión", async () => {
  const login = await fetch(`${urlBase}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      correo: "demo@espacio.cl",
      password: "Demo1234"
    })
  });

  assert.equal(login.status, 200);
  const datosLogin = await login.json();
  assert.equal(datosLogin.usuario.correo, "demo@espacio.cl");
  assert.equal("password_hash" in datosLogin.usuario, false);

  const cookie = login.headers.get("set-cookie").split(";")[0];
  const sesion = await fetch(`${urlBase}/api/auth/me`, {
    headers: { Cookie: cookie }
  });
  assert.equal(sesion.status, 200);

  const logout = await fetch(`${urlBase}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookie }
  });
  assert.equal(logout.status, 200);
});

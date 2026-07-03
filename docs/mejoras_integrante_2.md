# Mejoras del Integrante 2

## Resumen para presentación

### Mejora 1: arquitectura MVC

El backend estaba concentrado en `backend/app.js`. Se dividió en rutas,
controladores, modelos y middleware para que cada archivo tenga una
responsabilidad clara.

### Mejora 2: autenticación con sesiones reales

El registro, login, logout y consulta del usuario funcionan mediante la
API y `express-session`. Las contraseñas se convierten en hashes con
`bcryptjs` antes de guardarse.

### Mejora 3: protección de carrito y chat

El middleware `requireAuth` comprueba `req.session.usuario`. Las rutas de
órdenes y mensajes responden `401` si no existe una sesión válida.

### Mejora 4: persistencia de órdenes y mensajes

Al finalizar una compra se crean registros en `ordenes` y
`orden_detalle`. Los mensajes del chat se guardan en `mensajes`, siempre
asociados al usuario autenticado.

### Mejora 5: pruebas automáticas

Se agregaron pruebas para registro, validaciones, email repetido, login,
sesión, logout, órdenes, mensajes y acceso sin autenticación.

## Problemas encontrados

- `database.sql` utilizaba instrucciones exclusivas de MySQL.
- Las rutas y consultas estaban mezcladas en `backend/app.js`.
- El carrito guardaba compras únicamente en `localStorage`.
- El chat guardaba mensajes únicamente en `localStorage`.
- La autorización del chat y carrito dependía del estado local.
- La cobertura automática solo incluía tres casos de autenticación.

## Cómo se solucionaron

- Se reemplazó el esquema por SQL compatible con SQLite.
- Se creó una arquitectura MVC con inyección de modelos.
- Se agregó el middleware `requireAuth`.
- Se implementaron `/api/orders` y `/api/messages`.
- El frontend usa `fetch` y acepta una acción solo cuando el backend
  confirma la sesión.
- Se mantuvo `localStorage` únicamente para datos no confirmados y apoyo
  visual.

## Pruebas realizadas

- Registro correcto.
- Registro con email inválido.
- Registro con contraseña corta.
- Registro con email repetido.
- Login correcto e incorrecto.
- Consulta de sesión con y sin autenticación.
- Logout.
- Rechazo de órdenes y mensajes sin sesión.
- Creación y consulta de órdenes.
- Creación y consulta de mensajes.
- Comprobación de sintaxis JavaScript.
- Prueba manual del flujo en el navegador.

## Aprendizajes técnicos

- Separar responsabilidades facilita probar y mantener el backend.
- La validación del navegador no reemplaza la validación del servidor.
- Una sesión HTTP-only es más confiable que autorizar con
  `localStorage`.
- Las operaciones que guardan una orden y sus detalles deben usar una
  transacción.
- Los tests con SQLite en memoria permiten verificar persistencia sin
  modificar la base de desarrollo.

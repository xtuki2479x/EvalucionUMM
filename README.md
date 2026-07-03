# Mi Espacio Esotérico - Mejora del módulo de autenticación

## Descripción del proyecto

Este proyecto corresponde a la mejora de una aplicación web desarrollada previamente en la asignatura de Programación Web.

La aplicación original corresponde a un sitio de servicios esotéricos con catálogo, carrito, chat, registro e inicio de sesión. En esta mejora se trabajó principalmente sobre el módulo de autenticación, la arquitectura del backend, la persistencia de datos y la protección de funciones como carrito y chat.

El backend usa arquitectura MVC, sesiones reales y persistencia SQLite para usuarios, órdenes y mensajes.

## Tecnologías

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- SQLite mediante `node:sqlite`
- `express-session` para las sesiones
- `bcryptjs` para proteger contraseñas
- `node:test` para pruebas automáticas

## Requisitos

- Node.js 22.5 o superior
- npm

## Instalación y ejecución

Para instalar las dependencias:

```powershell
npm install
```

Para iniciar el servidor:

```powershell
npm start
```

Abrir la aplicación desde:

```text
http://localhost:3000
```

La aplicación debe abrirse desde el servidor. Abrir `index.html` directamente impide que las llamadas a la API funcionen correctamente.

## Usuario de demostración

```text
Correo: demo@espacio.cl
Contraseña: Demo1234
```

También se pueden crear usuarios desde el formulario de registro.

## Objetivo de la mejora

El objetivo principal fue mejorar la funcionalidad, seguridad básica y experiencia de usuario del sistema.

Antes de la mejora, el proyecto no contaba con un flujo completo de autenticación conectado de forma ordenada a backend y base de datos. Por eso se agregó y reorganizó el sistema para permitir:

- Registrar nuevos usuarios.
- Iniciar sesión con correo y contraseña.
- Mantener una sesión activa desde backend.
- Cerrar sesión.
- Validar datos en frontend y backend.
- Guardar usuarios en SQLite.
- Proteger rutas privadas.
- Guardar órdenes del carrito en base de datos.
- Guardar mensajes del chat en base de datos.

## Pruebas

Para ejecutar las pruebas:

```powershell
npm test
```

Las pruebas usan una base SQLite en memoria y comprueban:

- Registro de usuarios.
- Validaciones.
- Login.
- Sesión activa.
- Logout.
- Rutas protegidas.
- Persistencia de órdenes.
- Persistencia de mensajes.

## Arquitectura MVC

```text
backend/
  app.js
  server.js
  database.js
  routes/
    authRoutes.js
    orderRoutes.js
    messageRoutes.js
  controllers/
    authController.js
    orderController.js
    messageController.js
  models/
    userModel.js
    orderModel.js
    messageModel.js
  middlewares/
    authMiddleware.js
```

La estructura separa responsabilidades:

- **Routes:** declaran endpoints y conectan middlewares/controladores.
- **Controllers:** validan solicitudes y construyen respuestas HTTP.
- **Models:** realizan consultas y transacciones SQLite.
- **Middlewares:** verifican que exista una sesión válida.
- **app.js:** configura Express, sesiones, dependencias y rutas.

## Base de datos

El esquema está definido en `database.sql` y contiene las siguientes tablas:

- `usuarios`
- `ordenes`
- `orden_detalle`
- `mensajes`

El archivo local se genera en:

```text
data/app.db
```

Este archivo está excluido de Git.

Las contraseñas se almacenan como hashes de bcrypt, nunca como texto plano.

## Rutas disponibles

### Autenticación

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Crea usuario e inicia sesión. |
| `POST` | `/api/auth/login` | No | Verifica email y contraseña. |
| `POST` | `/api/auth/logout` | No | Destruye la sesión actual. |
| `GET` | `/api/auth/me` | Sí | Devuelve el usuario autenticado. |

### Órdenes

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/api/orders` | Sí | Guarda carrito y detalle. |
| `GET` | `/api/orders` | Sí | Lista órdenes del usuario. |

### Mensajes

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/api/messages` | Sí | Guarda un mensaje. |
| `GET` | `/api/messages` | Sí | Lista mensajes del usuario. |

Las rutas marcadas con autenticación usan `requireAuth` y responden `401` cuando no existe `req.session.usuario`.

## Seguridad y sesiones

- Cookie de sesión HTTP-only.
- Validación de datos en frontend y backend.
- Contraseñas protegidas con bcrypt.
- Email único en SQLite.
- Usuarios inactivos no pueden iniciar sesión.
- El hash de contraseña nunca se devuelve al navegador.
- El carrito y el chat requieren una sesión confirmada por el backend.

`localStorage` se mantiene para catálogo, carrito pendiente y apoyo visual. No es la fuente real de autorización ni registra compras o mensajes confirmados.

## Mejoras implementadas por Integrante 2

1. Reorganización del backend con arquitectura MVC.
2. Registro, login, logout y consulta de sesión real.
3. Middleware `requireAuth`.
4. Persistencia SQLite de órdenes y detalles.
5. Persistencia SQLite de mensajes.
6. Integración del carrito y chat con rutas protegidas.
7. Ampliación de pruebas automáticas.
8. Corrección del esquema anterior para usar SQLite de forma coherente.
9. Documentación de rutas, estructura y funcionamiento.

Más detalles en:

```text
docs/mejoras_integrante_2.md
```

## Producción

Antes de publicar se debe configurar `SESSION_SECRET`, usar HTTPS y reemplazar el almacén en memoria de `express-session` por uno persistente.

## Conclusión

El proyecto mejora la aplicación original integrando autenticación real, backend organizado, sesiones, persistencia de datos y protección de funciones importantes como carrito y chat. Además, se fortaleció la estructura del código mediante MVC y se agregaron pruebas para validar el funcionamiento principal.
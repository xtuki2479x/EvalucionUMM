# Mi Espacio Esotérico

Aplicación web de servicios esotéricos con catálogo, carrito, chat y
autenticación de usuarios.

## Requisitos

- Node.js 22.5 o superior (se usa el módulo integrado `node:sqlite`).
- npm.

## Instalación y ejecución

Desde la carpeta `EvalucionUMM-main/EvalucionUMM-main`:

```powershell
npm install
npm start
```

Abrir en el navegador:

```text
http://localhost:3000
```

La aplicación debe abrirse desde el servidor. No se debe ejecutar
`index.html` directamente, porque las rutas de autenticación necesitan el
backend.

## Usuario de prueba

| Campo | Valor |
|---|---|
| Correo | `demo@espacio.cl` |
| Contraseña | `Demo1234` |
| Rol | `usuario` |

El usuario se crea automáticamente la primera vez que se inicia el servidor.
La contraseña se almacena como un hash de bcrypt, nunca como texto plano.

## Autenticación

El backend está implementado con Express y la base de datos con SQLite.
La sesión se mantiene mediante una cookie HTTP-only con una duración de dos
horas.

Rutas disponibles:

| Método | Ruta | Función |
|---|---|---|
| `POST` | `/api/auth/login` | Valida correo y contraseña e inicia sesión. |
| `POST` | `/api/auth/logout` | Destruye la sesión activa. |
| `GET` | `/api/auth/me` | Devuelve el usuario autenticado. |

Ejemplo del cuerpo para iniciar sesión:

```json
{
  "correo": "demo@espacio.cl",
  "password": "Demo1234"
}
```

## Validaciones

### Frontend

- El correo debe tener un formato válido.
- La contraseña debe contener al menos ocho caracteres.
- El botón se bloquea mientras se verifican las credenciales.
- Se muestran mensajes claros de error y éxito.

### Backend

- Repite las validaciones para no confiar solamente en el navegador.
- Busca el usuario por correo en SQLite.
- Verifica la contraseña con bcrypt.
- Rechaza usuarios inexistentes, inactivos o con contraseña incorrecta.
- Nunca devuelve el hash de la contraseña al frontend.

## Base de datos

El archivo `data/app.db` se genera automáticamente y no se sube a Git.

Tabla `usuarios`:

| Columna | Descripción |
|---|---|
| `id` | Identificador único. |
| `nombre` | Nombre visible del usuario. |
| `correo` | Correo único, sin distinguir mayúsculas. |
| `password_hash` | Contraseña cifrada con bcrypt. |
| `rol` | Rol del usuario. |
| `activo` | Indica si puede iniciar sesión. |
| `creado_en` | Fecha de creación. |

## Pruebas

```powershell
npm test
```

Las pruebas comprueban:

1. Rechazo de correos inválidos.
2. Rechazo de credenciales incorrectas.
3. Inicio de sesión correcto.
4. Consulta de la sesión activa.
5. Cierre de sesión.

## Archivos principales

```text
backend/
  app.js           Servidor Express y rutas de autenticación
  database.js      Conexión, tabla y consultas SQLite
Codigo/Principal/
  principal.html   Formulario de inicio de sesión
  principal.js     Validación y comunicación con el backend
server.js          Punto de entrada
test/auth.test.js  Pruebas automáticas
```

## Consideración para producción

Antes de publicar el proyecto se debe definir `SESSION_SECRET` con un valor
privado y reemplazar el almacenamiento en memoria de `express-session` por un
almacén persistente.

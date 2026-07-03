# Mi Espacio Esotérico - Mejora del módulo de autenticación

## Descripción del proyecto

Este proyecto corresponde a la mejora de una aplicación web desarrollada previamente en la asignatura de Programación Web. La aplicación original corresponde a un sitio de servicios esotéricos con catálogo, carrito, chat y navegación entre secciones.

Para esta actividad se trabajó sobre el proyecto base y se implementó una mejora enfocada en el módulo de autenticación de usuarios, incorporando registro, inicio de sesión, validaciones desde el frontend y conexión con una base de datos SQLite mediante un backend en Node.js y Express.

## Objetivo de la mejora

El objetivo principal fue mejorar la funcionalidad y la experiencia de usuario del sistema de autenticación.

Antes de la mejora, el proyecto no contaba con un flujo completo de registro e inicio de sesión conectado a una base de datos. Por eso se agregó un módulo que permite:

- Registrar nuevos usuarios.
- Iniciar sesión con correo y contraseña.
- Mantener una sesión activa.
- Cerrar sesión.
- Validar los datos ingresados antes de enviarlos.
- Guardar los usuarios registrados en una base de datos SQLite.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- SQLite
- bcryptjs
- express-session

## Mejoras implementadas

### 1. Registro de usuarios

Se agregó un formulario de registro que permite ingresar:

- Nombre
- Correo electrónico
- Contraseña
- Confirmación de contraseña

El formulario valida que los datos sean correctos antes de enviarlos al servidor.

### 2. Validaciones en el frontend

Se implementaron validaciones para mejorar la experiencia del usuario.

### 3. Backend con rutas de autenticación

Se agregaron rutas API en Express para manejar la autenticación

### 4. Base de datos SQLite

Se incorporó una base de datos SQLite para almacenar los usuarios registrados.


### 5. Inicio y cierre de sesión

Se implementó el inicio de sesión mediante correo y contraseña. Cuando el usuario inicia sesión correctamente, el sistema guarda la sesión y actualiza la interfaz.

También se agregó la opción de cerrar sesión desde el botón de autenticación.

## Instalación y ejecución

Para ejecutar el proyecto, primero se deben instalar las dependencias:
 "npm install"
 
Luego se inicia el servidor:
 "npm start"

La aplicación se abre desde el navegador en:
http://localhost:3000

Es importante abrir el proyecto desde el servidor y no directamente desde el archivo index.html, ya que las rutas de autenticación necesitan el backend activo.

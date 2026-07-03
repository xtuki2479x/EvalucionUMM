let sesionActual = null;
let mensajesActuales = [];


/* ========================================
   INICIO DEL CHAT
======================================== */

document.addEventListener(
  "DOMContentLoaded",
  iniciarChat
);

async function iniciarChat() {
  const formulario = document.getElementById(
    "form-mensaje"
  );
  const entrada = document.getElementById(
    "mensaje"
  );

  formulario.addEventListener(
    "submit",
    enviarMensaje
  );
  entrada.addEventListener(
    "input",
    actualizarContadorCaracteres
  );

  actualizarContadorCarrito();
  await sincronizarSesion();
}


/* ========================================
   COMPROBAR SESIÓN REAL
======================================== */

async function sincronizarSesion() {
  try {
    const respuesta = await fetch("/api/auth/me");

    if (!respuesta.ok) {
      sesionActual = null;
      localStorage.removeItem(KEYS.sesion);
      comprobarSesion();
      return;
    }

    const datos = await respuesta.json();
    sesionActual = datos.usuario;
    guardar(KEYS.sesion, sesionActual);
    comprobarSesion();
    await cargarMensajes();
  } catch (_error) {
    sesionActual = null;
    comprobarSesion();
    mostrarToast("No fue posible conectar con el servidor");
  }
}

function comprobarSesion() {
  const aviso = document.getElementById(
    "aviso-sesion"
  );
  const chat = document.getElementById(
    "chat-activo"
  );

  aviso.classList.toggle(
    "hidden",
    Boolean(sesionActual)
  );
  chat.classList.toggle(
    "hidden",
    !sesionActual
  );
}


/* ========================================
   CARGAR Y MOSTRAR MENSAJES
======================================== */

async function cargarMensajes() {
  try {
    const respuesta = await fetch("/api/messages");
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.mensaje ||
        "No fue posible cargar los mensajes."
      );
    }

    mensajesActuales = datos.mensajes;
    renderizarMensajes();
  } catch (error) {
    mensajesActuales = [];
    renderizarMensajes();
    mostrarToast(error.message);
  }
}

function renderizarMensajes() {
  const contenedor = document.getElementById(
    "lista-mensajes"
  );

  if (mensajesActuales.length === 0) {
    contenedor.innerHTML = `
      <div class="chat-sin-mensajes">
        <h2>Inicia una conversación</h2>
        <p>
          Envía tu primer mensaje para comenzar la conversación.
        </p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = mensajesActuales
    .map((mensaje) => crearMensajeHTML(mensaje))
    .join("");
  contenedor.scrollTop = contenedor.scrollHeight;
}


/* ========================================
   CREAR BURBUJA
======================================== */

function crearMensajeHTML(mensaje) {
  const esUsuario = mensaje.autor === "usuario";
  const clase = esUsuario
    ? "mensaje--usuario"
    : "mensaje--admin";
  const autor = esUsuario ? "Tú" : "Asesora";
  const fecha = formatearFechaMensaje(
    mensaje.fecha
  );

  return `
    <article class="mensaje ${clase}">
      <p>${escaparHTML(mensaje.texto)}</p>
      <small class="mensaje__datos">
        ${autor} · ${fecha}
      </small>
    </article>
  `;
}


/* ========================================
   ENVIAR MENSAJE
======================================== */

async function enviarMensaje(evento) {
  evento.preventDefault();

  if (!sesionActual) {
    mostrarToast("Debes iniciar sesión");
    return;
  }

  const entrada = document.getElementById(
    "mensaje"
  );
  const boton = evento.currentTarget
    .querySelector("button[type='submit']");
  const texto = entrada.value.trim();

  if (!texto) {
    mostrarToast("Escribe un mensaje");
    return;
  }

  boton.disabled = true;

  try {
    const respuesta = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mensaje: texto })
    });
    const datos = await respuesta.json();

    if (respuesta.status === 401) {
      sesionActual = null;
      localStorage.removeItem(KEYS.sesion);
      comprobarSesion();
      throw new Error("Debes iniciar sesión nuevamente.");
    }

    if (!respuesta.ok) {
      throw new Error(
        datos.mensaje ||
        "No fue posible enviar el mensaje."
      );
    }

    mensajesActuales.push(datos.datos);
    entrada.value = "";
    actualizarContadorCaracteres();
    renderizarMensajes();
    mostrarToast(datos.mensaje);
  } catch (error) {
    mostrarToast(error.message);
  } finally {
    boton.disabled = false;
  }
}


/* ========================================
   UTILIDADES
======================================== */

function actualizarContadorCaracteres() {
  const entrada = document.getElementById(
    "mensaje"
  );
  const contador = document.getElementById(
    "contador-caracteres"
  );

  contador.textContent =
    `${entrada.value.length} / 500`;
}

function formatearFechaMensaje(fecha) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(fecha));
}

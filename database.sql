PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'usuario',
  activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ordenes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  total REAL NOT NULL CHECK (total >= 0),
  estado TEXT NOT NULL DEFAULT 'Pendiente',
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS orden_detalle (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orden_id INTEGER NOT NULL,
  servicio_nombre TEXT NOT NULL,
  precio REAL NOT NULL CHECK (precio >= 0),
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mensajes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  nombre_usuario TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_ordenes_usuario
  ON ordenes(usuario_id);

CREATE INDEX IF NOT EXISTS idx_mensajes_usuario
  ON mensajes(usuario_id);

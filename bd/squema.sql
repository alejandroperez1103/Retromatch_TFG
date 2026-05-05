-- Creamos la base de datos (si no existe) y la usamos
CREATE DATABASE IF NOT EXISTS retromatch;
USE retromatch;

-- 1. Tabla Usuario (Para clientes y administradores)
CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'Cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla Producto (El catálogo general de camisetas)
CREATE TABLE Producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo VARCHAR(100) NOT NULL,
    anio INT NOT NULL,
    descripcion_historica TEXT,
    imagen_url VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL
);

-- 3. Tabla Inventario (Para gestionar el stock por tallas separadamente)
CREATE TABLE Inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    talla VARCHAR(10) NOT NULL,
    cantidad_stock INT NOT NULL DEFAULT 0,
    FOREIGN KEY (producto_id) REFERENCES Producto(id) ON DELETE CASCADE
);

-- 4. Tabla Reserva_Carrito (Para el bloqueo temporal de stock)
CREATE TABLE Reserva_Carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    inventario_id INT NOT NULL,
    cantidad INT NOT NULL,
    fecha_expiracion TIMESTAMP NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (inventario_id) REFERENCES Inventario(id) ON DELETE CASCADE
);

-- 5. Tabla Pedido (Cabecera de la compra)
CREATE TABLE Pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(50) NOT NULL UNIQUE,
    usuario_id INT, -- Permite NULL si el usuario decide borrar su cuenta por RGPD
    estado VARCHAR(50) DEFAULT 'Pendiente',
    direccion_envio TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE SET NULL
);

-- 6. Tabla Detalle_Pedido (Líneas de los productos comprados)
CREATE TABLE Detalle_Pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    inventario_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES Pedido(id) ON DELETE CASCADE,
    FOREIGN KEY (inventario_id) REFERENCES Inventario(id) ON DELETE NO ACTION
);

-- 7. Tabla Auditoria_Admin (Para el log de acciones de los administradores)
CREATE TABLE Auditoria_Admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    accion VARCHAR(255) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES Usuario(id) ON DELETE CASCADE
);
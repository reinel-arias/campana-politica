-- ============================================================
-- Script de inicialización: Campaña Política
-- ============================================================

CREATE DATABASE IF NOT EXISTS campana_politica
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campana_politica;

-- ------------------------------------------------------------
-- Tabla: lideres
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lideres (
  id         INT          NOT NULL AUTO_INCREMENT,
  cedula     VARCHAR(20)  NOT NULL,
  nombre     VARCHAR(100) NOT NULL,
  apellidos  VARCHAR(100) NOT NULL,
  direccion  VARCHAR(255) NOT NULL DEFAULT '',
  telefono   VARCHAR(20)  NOT NULL DEFAULT '',
  creado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_lideres_cedula (cedula)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Tabla: colaboradores
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS colaboradores (
  id               INT          NOT NULL AUTO_INCREMENT,
  cedula           VARCHAR(20)  NOT NULL,
  nombre           VARCHAR(100) NOT NULL,
  apellidos        VARCHAR(100) NOT NULL,
  sexo             CHAR(1)      NOT NULL COMMENT 'M o F',
  fecha_nacimiento DATE         NOT NULL,
  direccion        VARCHAR(255) NOT NULL DEFAULT '',
  telefono         VARCHAR(20)  NOT NULL DEFAULT '',
  email            VARCHAR(255) NOT NULL DEFAULT '',
  lider_cedula     VARCHAR(20)  NOT NULL,
  creado_en        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_colaboradores_cedula (cedula),
  CONSTRAINT fk_colaboradores_lider
    FOREIGN KEY (lider_cedula) REFERENCES lideres (cedula)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migración: agregar email si la tabla ya existe sin esa columna
ALTER TABLE colaboradores
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL DEFAULT '' AFTER telefono;

-- ------------------------------------------------------------
-- Tabla: habilidades_colaborador
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habilidades_colaborador (
  colaborador_id  INT     NOT NULL,
  vehiculo        BOOLEAN NOT NULL DEFAULT FALSE,
  perifoneo       BOOLEAN NOT NULL DEFAULT FALSE,
  orador_publico  BOOLEAN NOT NULL DEFAULT FALSE,
  redes_sociales  BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (colaborador_id),
  CONSTRAINT fk_habilidades_colaborador
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Datos de prueba (opcionales, comentar en producción)
-- ------------------------------------------------------------
INSERT IGNORE INTO lideres (cedula, nombre, apellidos, direccion, telefono) VALUES
  ('1234567890', 'Carlos',  'Rodríguez Pérez', 'Calle 12 #34-56, Bogotá',   '3001234567'),
  ('9876543210', 'María',   'López Gómez',     'Carrera 5 #78-90, Medellín','3109876543');

INSERT IGNORE INTO colaboradores (cedula, nombre, apellidos, sexo, fecha_nacimiento, direccion, telefono, lider_cedula) VALUES
  ('1111111111', 'Juan',    'García Torres',   'M', '1990-05-15', 'Calle 1 #2-3',  '3001112233', '1234567890'),
  ('2222222222', 'Ana',     'Martínez Ruiz',   'F', '1985-11-22', 'Carrera 2 #4-5','3004445566', '1234567890'),
  ('3333333333', 'Pedro',   'Sánchez Díaz',    'M', '1992-03-30', 'Av. 3 #6-7',   '3007778899', '9876543210');

INSERT IGNORE INTO habilidades_colaborador (colaborador_id, vehiculo, perifoneo, orador_publico, redes_sociales)
SELECT id, FALSE, FALSE, FALSE, FALSE FROM colaboradores;

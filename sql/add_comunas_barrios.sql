-- ============================================================
-- Migración: Comunas y Barrios
-- ============================================================

USE campana_politica;

-- ------------------------------------------------------------
-- Tabla: comunas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comunas (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_comunas_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Tabla: barrios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS barrios (
  id        INT          NOT NULL AUTO_INCREMENT,
  nombre    VARCHAR(100) NOT NULL,
  comuna_id INT          NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_barrios_nombre_comuna (nombre, comuna_id),
  CONSTRAINT fk_barrios_comuna
    FOREIGN KEY (comuna_id) REFERENCES comunas (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Columna barrio_id en colaboradores
-- ------------------------------------------------------------
ALTER TABLE colaboradores
  ADD COLUMN IF NOT EXISTS barrio_id INT NULL AFTER lider_cedula;

-- Agregar FK solo si no existe
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = 'campana_politica'
    AND TABLE_NAME = 'colaboradores'
    AND CONSTRAINT_NAME = 'fk_colaboradores_barrio'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE colaboradores ADD CONSTRAINT fk_colaboradores_barrio FOREIGN KEY (barrio_id) REFERENCES barrios (id) ON DELETE SET NULL',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

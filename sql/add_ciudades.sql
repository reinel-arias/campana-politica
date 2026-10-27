-- Ciudades de los líderes (lista desplegable en el formulario de líderes)
-- Ejecutar: mysql -u root -p campana_politica < sql/add_ciudades.sql

USE campana_politica;

CREATE TABLE IF NOT EXISTS ciudades (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ciudades_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE lideres
  ADD COLUMN ciudad_id INT NULL,
  ADD CONSTRAINT fk_lider_ciudad
    FOREIGN KEY (ciudad_id) REFERENCES ciudades (id)
    ON DELETE SET NULL;

INSERT IGNORE INTO ciudades (nombre) VALUES
  ('Pereira'),
  ('Dosquebradas'),
  ('Santa Rosa');

-- Los líderes que aún no tienen ciudad quedan en Pereira
UPDATE lideres
SET ciudad_id = (SELECT id FROM ciudades WHERE nombre = 'Pereira')
WHERE ciudad_id IS NULL;

-- Para agregar más ciudades:
-- INSERT INTO ciudades (nombre) VALUES ('Nueva ciudad');

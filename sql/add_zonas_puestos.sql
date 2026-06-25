USE campana_politica;

CREATE TABLE IF NOT EXISTS zonas (
  id     SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo CHAR(2)           NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_zonas_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS puestos_votacion (
  id        INT               NOT NULL AUTO_INCREMENT,
  zona_id   SMALLINT UNSIGNED NOT NULL,
  codigo    CHAR(2)           NOT NULL,
  nombre    VARCHAR(150)      NOT NULL,
  direccion VARCHAR(255)      NOT NULL DEFAULT '',
  num_mesas SMALLINT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_zona_puesto (zona_id, codigo),
  CONSTRAINT fk_puesto_zona
    FOREIGN KEY (zona_id) REFERENCES zonas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE colaboradores
  ADD COLUMN puesto_votacion_id INT NULL,
  ADD CONSTRAINT fk_colab_puesto
    FOREIGN KEY (puesto_votacion_id) REFERENCES puestos_votacion (id)
    ON DELETE SET NULL;

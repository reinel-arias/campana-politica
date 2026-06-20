USE campana_politica;

CREATE TABLE IF NOT EXISTS gestiones (
  id              INT          NOT NULL AUTO_INCREMENT,
  colaborador_id  INT          NOT NULL,
  descripcion     VARCHAR(255) NOT NULL,
  fecha_limite    DATE         NOT NULL,
  gestionado      TINYINT(1)   NOT NULL DEFAULT 0,
  fecha_ejecucion DATE         NULL,
  creado_en       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_gestiones_colaborador
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

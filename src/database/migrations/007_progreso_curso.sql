-- =============================================
-- Progreso por contenido completado
-- =============================================
CREATE TABLE IF NOT EXISTS progreso_estudiante (
  id_progreso   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario    UUID        NOT NULL REFERENCES usuario(id_usuario),
  id_curso      UUID        NOT NULL REFERENCES curso(id_curso),
  id_contenido  UUID        NOT NULL REFERENCES contenido(id_contenido),
  completado    BOOLEAN     NOT NULL DEFAULT false,
  completado_en TIMESTAMPTZ,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_progreso_usuario_contenido UNIQUE (id_usuario, id_contenido)
);

CREATE INDEX IF NOT EXISTS idx_progreso_est_usuario  ON progreso_estudiante(id_usuario);
CREATE INDEX IF NOT EXISTS idx_progreso_est_curso    ON progreso_estudiante(id_curso);

-- =============================================
-- Progreso global acumulativo por curso
-- =============================================
CREATE TABLE IF NOT EXISTS progreso_curso (
  id_progreso_curso      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario             UUID         NOT NULL REFERENCES usuario(id_usuario),
  id_curso               UUID         NOT NULL REFERENCES curso(id_curso),
  porcentaje             DECIMAL(5,2) NOT NULL DEFAULT 0,
  contenidos_completados INTEGER      NOT NULL DEFAULT 0,
  total_contenidos       INTEGER      NOT NULL DEFAULT 0,
  completado             BOOLEAN      NOT NULL DEFAULT false,
  aprobado               BOOLEAN      NOT NULL DEFAULT false,
  fecha_inicio           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  fecha_completado       TIMESTAMPTZ,
  CONSTRAINT uq_progreso_curso UNIQUE (id_usuario, id_curso)
);

CREATE INDEX IF NOT EXISTS idx_progreso_curso_usuario ON progreso_curso(id_usuario);
CREATE INDEX IF NOT EXISTS idx_progreso_curso_id      ON progreso_curso(id_curso);

-- =============================================
-- Campos adicionales en certificado
-- =============================================
ALTER TABLE certificado
  ADD COLUMN IF NOT EXISTS imagen_url       VARCHAR(500),
  ADD COLUMN IF NOT EXISTS nombre_estudiante VARCHAR(150),
  ADD COLUMN IF NOT EXISTS nombre_curso     VARCHAR(200);

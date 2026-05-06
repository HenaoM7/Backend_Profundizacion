CREATE TABLE IF NOT EXISTS evaluacion (
  id_evaluacion SERIAL PRIMARY KEY,
  id_contenido UUID NOT NULL REFERENCES contenido(id_contenido) ON DELETE CASCADE,
  tipo_pregunta VARCHAR(48) NOT NULL,
  enunciado TEXT NOT NULL,
  puntaje NUMERIC(5,2) DEFAULT 0 NOT NULL CHECK (puntaje >= 0 AND puntaje <= 5)
);

CREATE TABLE IF NOT EXISTS opcion_evaluacion (
  id_opcion SERIAL PRIMARY KEY,
  id_evaluacion INTEGER NOT NULL REFERENCES evaluacion(id_evaluacion) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT false NOT NULL,
  orden INTEGER DEFAULT 0 NOT NULL
);

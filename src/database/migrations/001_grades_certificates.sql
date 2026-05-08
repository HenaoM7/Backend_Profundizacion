CREATE TABLE IF NOT EXISTS grades (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    VARCHAR(100)  NOT NULL,
  course_id  VARCHAR(100)  NOT NULL,
  module_id  VARCHAR(100)  NOT NULL,
  score      DECIMAL(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grades_user_id    ON grades(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_id  ON grades(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_user_course ON grades(user_id, course_id);

CREATE TABLE IF NOT EXISTS certificates (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    VARCHAR(100) NOT NULL,
  course_id  VARCHAR(100) NOT NULL,
  issued_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  url        VARCHAR(500) NOT NULL,
  CONSTRAINT uq_cert_user_course UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);

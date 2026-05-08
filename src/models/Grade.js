export class Grade {
  constructor({ id, userId, courseId, moduleId, score, createdAt, evaluacionId = null }) {
    this.id           = id;
    this.userId       = userId;
    this.courseId     = courseId;
    this.moduleId     = moduleId;
    this.score        = score;
    this.createdAt    = createdAt;
    this.evaluacionId = evaluacionId;
  }

  static fromRow(row) {
    return new Grade({
      id:           row.id_nota,
      userId:       row.id_usuario,
      courseId:     row.id_curso,
      moduleId:     row.id_modulo,
      score:        parseFloat(row.calificacion),
      createdAt:    row.creado_en,
      evaluacionId: row.id_evaluacion ?? null,
    });
  }
}

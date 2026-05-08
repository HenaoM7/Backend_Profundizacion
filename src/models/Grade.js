export class Grade {
  constructor({ id, userId, courseId, moduleId, score, createdAt }) {
    this.id        = id;
    this.userId    = userId;
    this.courseId  = courseId;
    this.moduleId  = moduleId;
    this.score     = score;
    this.createdAt = createdAt;
  }

  static fromRow(row) {
    return new Grade({
      id:        row.id,
      userId:    row.usuario_id,
      courseId:  row.curso_id,
      moduleId:  row.modulo_id,
      score:     parseFloat(row.calificacion),
      createdAt: row.creado_en,
    });
  }
}

export class Grade {
  constructor({ id, userId, courseId, moduleId, score, createdAt, evaluacionId, numeroIntento }) {
    this.id            = id;
    this.userId        = userId;
    this.courseId      = courseId;
    this.moduleId      = moduleId;
    this.score         = score;
    this.createdAt     = createdAt;
    this.evaluacionId  = evaluacionId  ?? null;
    this.numeroIntento = numeroIntento ?? 1;
  }

  static fromRow(row) {
    return new Grade({
      id:            row.id_nota,
      userId:        row.id_usuario,
      courseId:      row.id_curso,
      moduleId:      row.id_modulo,
      score:         parseFloat(row.calificacion),
      createdAt:     row.creado_en,
      evaluacionId:  row.id_evaluacion  ?? null,
      numeroIntento: row.numero_intento ?? 1,
    });
  }
}

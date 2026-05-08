export class Certificate {
  constructor({ id, userId, courseId, issuedAt, url }) {
    this.id       = id;
    this.userId   = userId;
    this.courseId = courseId;
    this.issuedAt = issuedAt;
    this.url      = url;
  }

  static fromRow(row) {
    return new Certificate({
      id:       row.id,
      userId:   row.usuario_id,
      courseId: row.curso_id,
      issuedAt: row.emitido_en,
      url:      row.url,
    });
  }
}

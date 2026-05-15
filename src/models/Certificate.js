export class Certificate {
  constructor({
    id, userId, courseId, issuedAt, url,
    nombreEstudiante, nombreCurso,
    descargado, descargadoEn,
    codigoVerificacion, htmlRenderizado,
  }) {
    this.id                 = id;
    this.userId             = userId;
    this.courseId           = courseId;
    this.issuedAt           = issuedAt;
    this.url                = url;
    this.nombreEstudiante   = nombreEstudiante   ?? null;
    this.nombreCurso        = nombreCurso        ?? null;
    this.descargado         = descargado         ?? false;
    this.descargadoEn       = descargadoEn       ?? null;
    this.codigoVerificacion = codigoVerificacion ?? null;
    this.htmlRenderizado    = htmlRenderizado     ?? null;
  }

  static fromRow(row) {
    return new Certificate({
      id:                 row.id_certificado,
      userId:             row.id_usuario,
      courseId:           row.id_curso,
      issuedAt:           row.emitido_en,
      url:                row.url,
      nombreEstudiante:   row.nombre_estudiante    ?? null,
      nombreCurso:        row.nombre_curso         ?? null,
      descargado:         row.descargado           ?? false,
      descargadoEn:       row.descargado_en        ?? null,
      codigoVerificacion: row.codigo_verificacion  ?? null,
      htmlRenderizado:    row.html_renderizado      ?? null,
    });
  }
}

export class Certificate {
  constructor({
    id, userId, courseId, issuedAt, url,
    idMaestroDocumento, imagenUrl, nombreEstudiante, nombreCurso,
    descargado, descargadoEn,
  }) {
    this.id                 = id;
    this.userId             = userId;
    this.courseId           = courseId;
    this.issuedAt           = issuedAt;
    this.url                = url;
    this.idMaestroDocumento = idMaestroDocumento ?? null;
    this.imagenUrl          = imagenUrl          ?? null;
    this.nombreEstudiante   = nombreEstudiante   ?? null;
    this.nombreCurso        = nombreCurso        ?? null;
    this.descargado         = descargado         ?? false;
    this.descargadoEn       = descargadoEn       ?? null;
  }

  static fromRow(row) {
    return new Certificate({
      id:                 row.id_certificado,
      userId:             row.id_usuario,
      courseId:           row.id_curso,
      issuedAt:           row.emitido_en,
      url:                row.url,
      idMaestroDocumento: row.id_maestro_documento ?? null,
      imagenUrl:          row.imagen_url           ?? null,
      nombreEstudiante:   row.nombre_estudiante    ?? null,
      nombreCurso:        row.nombre_curso         ?? null,
      descargado:         row.descargado           ?? false,
      descargadoEn:       row.descargado_en        ?? null,
    });
  }
}

export class ProgresoEstudiante {
  constructor({ id, idUsuario, idCurso, idContenido, completado, completadoEn, creadoEn }) {
    this.id          = id;
    this.idUsuario   = idUsuario;
    this.idCurso     = idCurso;
    this.idContenido = idContenido;
    this.completado  = completado;
    this.completadoEn = completadoEn;
    this.creadoEn    = creadoEn;
  }

  static fromRow(row) {
    return new ProgresoEstudiante({
      id:           row.id_progreso,
      idUsuario:    row.id_usuario,
      idCurso:      row.id_curso,
      idContenido:  row.id_contenido,
      completado:   row.completado,
      completadoEn: row.completado_en,
      creadoEn:     row.creado_en,
    });
  }
}

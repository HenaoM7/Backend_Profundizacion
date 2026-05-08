export class ProgresoCurso {
  constructor({
    id, idUsuario, idCurso, porcentaje,
    contenidosCompletados, totalContenidos,
    completado, aprobado, fechaInicio, fechaCompletado,
  }) {
    this.id                    = id;
    this.idUsuario             = idUsuario;
    this.idCurso               = idCurso;
    this.porcentaje            = porcentaje;
    this.contenidosCompletados = contenidosCompletados;
    this.totalContenidos       = totalContenidos;
    this.completado            = completado;
    this.aprobado              = aprobado;
    this.fechaInicio           = fechaInicio;
    this.fechaCompletado       = fechaCompletado;
  }

  static fromRow(row) {
    return new ProgresoCurso({
      id:                    row.id_progreso_curso,
      idUsuario:             row.id_usuario,
      idCurso:               row.id_curso,
      porcentaje:            parseFloat(row.porcentaje),
      contenidosCompletados: row.contenidos_completados,
      totalContenidos:       row.total_contenidos,
      completado:            row.completado,
      aprobado:              row.aprobado,
      fechaInicio:           row.fecha_inicio,
      fechaCompletado:       row.fecha_completado,
    });
  }
}

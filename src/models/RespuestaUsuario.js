export class RespuestaUsuario {
  constructor({ id, idEvaluacion, idUsuario, idOpcion, respondidoEn }) {
    this.id           = id;
    this.idEvaluacion = idEvaluacion;
    this.idUsuario    = idUsuario;
    this.idOpcion     = idOpcion;
    this.respondidoEn = respondidoEn;
  }

  static fromRow(row) {
    return new RespuestaUsuario({
      id:           row.id_respuesta,
      idEvaluacion: row.id_evaluacion,
      idUsuario:    row.id_usuario,
      idOpcion:     row.id_opcion,
      respondidoEn: row.respondido_en,
    });
  }
}

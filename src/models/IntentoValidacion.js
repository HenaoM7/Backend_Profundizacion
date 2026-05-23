export class IntentoValidacion {
  constructor({ id, idContenido, idUsuario, respuesta, fueCorrector, intentadoEn }) {
    this.id          = id;
    this.idContenido = idContenido;
    this.idUsuario   = idUsuario;
    this.respuesta   = respuesta;
    this.fueCorrector = fueCorrector;
    this.intentadoEn = intentadoEn;
  }

  static fromRow(row) {
    return new IntentoValidacion({
      id:           row.id_intento,
      idContenido:  row.id_contenido,
      idUsuario:    row.id_usuario,
      respuesta:    row.respuesta,
      fueCorrector: row.fue_correcto,
      intentadoEn:  row.intentado_en,
    });
  }
}

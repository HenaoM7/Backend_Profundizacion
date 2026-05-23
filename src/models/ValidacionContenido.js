export class ValidacionContenido {
  constructor({ id, idContenido, pregunta, respuestaCorrecta, activo, creadoEn }) {
    this.id               = id;
    this.idContenido      = idContenido;
    this.pregunta         = pregunta;
    this.respuestaCorrecta = respuestaCorrecta;
    this.activo           = activo;
    this.creadoEn         = creadoEn;
  }

  static fromRow(row) {
    return new ValidacionContenido({
      id:               row.id_validacion,
      idContenido:      row.id_contenido,
      pregunta:         row.pregunta,
      respuestaCorrecta: row.respuesta_correcta,
      activo:           row.activo,
      creadoEn:         row.creado_en,
    });
  }
}

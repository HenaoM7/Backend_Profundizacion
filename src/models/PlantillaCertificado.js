export class PlantillaCertificado {
  constructor({ id, idCurso, htmlTemplate, activo, creadoEn }) {
    this.id          = id;
    this.idCurso     = idCurso;
    this.htmlTemplate = htmlTemplate;
    this.activo      = activo;
    this.creadoEn    = creadoEn;
  }

  static fromRow(row) {
    return new PlantillaCertificado({
      id:           row.id_plantilla,
      idCurso:      row.id_curso,
      htmlTemplate: row.html_template,
      activo:       row.activo,
      creadoEn:     row.creado_en,
    });
  }
}

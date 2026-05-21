export class CursoTopStats {
  constructor({ idCurso, titulo, total }) {
    this.idCurso = idCurso;
    this.titulo = titulo;
    this.total = parseInt(total, 10);
  }
 
  static fromRow(row) {
    return new CursoTopStats({
      idCurso: row.id_curso,
      titulo: row.titulo,
      total: row.total,
    });
  }
}
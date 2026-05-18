export class EstudiantesCompletadosStats {
  constructor({ totalCompletados }) {
    this.totalCompletados = parseInt(totalCompletados, 10);
  }
 
  static fromRow(row) {
    return new EstudiantesCompletadosStats({
      totalCompletados: row.total_completados,
    });
  }
}
 
 
export class EstudiantesInscritosStats {
  constructor({ totalInscritos }) {
    this.totalInscritos = parseInt(totalInscritos, 10);
  }
 
  static fromRow(row) {
    return new EstudiantesInscritosStats({
      totalInscritos: row.total_inscritos,
    });
  }
}
 
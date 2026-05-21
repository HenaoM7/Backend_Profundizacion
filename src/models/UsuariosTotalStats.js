
export class UsuariosTotalStats {
  constructor({ totalUsuarios }) {
    this.totalUsuarios = parseInt(totalUsuarios, 10);
  }
 
  static fromRow(row) {
    return new UsuariosTotalStats({
      totalUsuarios: row.total_usuarios,
    });
  }
}
 
export class UsuariosPorRolStats {
  constructor({ rol, total }) {
    this.rol = rol;
    this.total = parseInt(total, 10);
  }
 
  static fromRow(row) {
    return new UsuariosPorRolStats({
      rol: row.rol,
      total: row.total,
    });
  }
}
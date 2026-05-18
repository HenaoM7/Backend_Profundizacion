export class UsuariosActivosStats {
  constructor({ usuariosActivos }) {
    this.usuariosActivos = parseInt(usuariosActivos, 10);
  }
 
  static fromRow(row) {
    return new UsuariosActivosStats({
      usuariosActivos: row.usuarios_activos,
    });
  }
}
 
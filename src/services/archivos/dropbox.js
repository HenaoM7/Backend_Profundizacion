const { Dropbox } = require('dropbox');
const fs = require('fs').promises;
const path = require('path');
const ApiServiceInterface = require('./apiServiceInterface');

class DropboxService extends ApiServiceInterface {
  constructor(credentialsPath) {
    super();
    this.credentialsPath = credentialsPath;
    this.dropbox = null;
    this.isAuth = false;
  }

  /**
   * Autentica con Dropbox
   */
  async authenticate() {
    try {
      const credentials = JSON.parse(
        await fs.readFile(this.credentialsPath, 'utf8')
      );

      this.dropbox = new Dropbox({
        auth: credentials.access_token
      });

      this.isAuth = true;
      console.log('✓ Autenticado con Dropbox');
      return true;
    } catch (error) {
      console.error('✗ Error autenticando con Dropbox:', error.message);
      this.isAuth = false;
      return false;
    }
  }

  /**
   * Obtiene información de un archivo
   */
  async getDocument(documentId) {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado con Dropbox');
    }

    try {
      const response = await this.dropbox.filesGetMetadata({
        path: documentId
      });

      return {
        id: response.id,
        name: response.name,
        size: response.size,
        modified: response.server_modified,
        pathLower: response.path_lower
      };
    } catch (error) {
      console.error('Error obteniendo documento:', error.message);
      throw error;
    }
  }

  /**
   * Descarga un documento
   */
  async downloadDocument(documentId, savePath) {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado con Dropbox');
    }

    try {
      const dir = path.dirname(savePath);
      await fs.mkdir(dir, { recursive: true });

      const response = await this.dropbox.filesDownload({
        path: documentId
      });

      await fs.writeFile(savePath, response.fileBinary);
      console.log(`✓ Documento descargado: ${savePath}`);
      return true;
    } catch (error) {
      console.error('Error descargando documento:', error.message);
      throw error;
    }
  }

  /**
   * Lista documentos
   */
  async listDocuments(params = {}) {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado con Dropbox');
    }

    try {
      const folderPath = params.folderPath || '';
      const response = await this.dropbox.filesListFolder({
        path: folderPath
      });

      return response.entries.map(entry => ({
        id: entry.id,
        name: entry.name,
        size: entry.size,
        type: entry['.tag']
      }));
    } catch (error) {
      console.error('Error listando documentos:', error.message);
      throw error;
    }
  }

  /**
   * Busca documentos
   */
  async searchDocuments(query) {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado con Dropbox');
    }

    try {
      const response = await this.dropbox.filesSearchV2({
        query: query
      });

      return response.matches.map(match => ({
        id: match.metadata.id,
        name: match.metadata.name,
        size: match.metadata.size
      }));
    } catch (error) {
      console.error('Error buscando documentos:', error.message);
      throw error;
    }
  }

  isAuthenticated() {
    return this.isAuth;
  }
}

module.exports = DropboxService;
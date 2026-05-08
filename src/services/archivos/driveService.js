import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

class DriveService {
  constructor() {
    this.drive = null;
  }

  // Inicializa el cliente (llama esto una vez al arrancar)
  async init() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    this.drive = google.drive({ version: 'v3', auth });
    console.log('✓ Drive inicializado');
  }

  // Listar archivos de una carpeta de Drive
  async listarArchivos(carpetaId = null) {
    const folderId = carpetaId || process.env.DRIVE_FOLDER_ID;
    const response = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, createdTime, modifiedTime)',
      orderBy: 'name',
    });
    return response.data.files || [];
  }

  // Obtener metadata de un archivo
  async obtenerArchivo(driveId) {
    const response = await this.drive.files.get({
      fileId: driveId,
      fields: 'id, name, mimeType, size, createdTime, webViewLink',
    });
    return response.data;
  }

  // Stream para enviar el archivo directamente al response de Express
  async streamArchivo(driveId, res) {
    const metadata = await this.obtenerArchivo(driveId);

    const response = await this.drive.files.get(
      { fileId: driveId, alt: 'media' },
      { responseType: 'stream' }
    );

    // Headers para que el navegador descargue el archivo
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.name}"`);
    res.setHeader('Content-Type', metadata.mimeType);

    // Pipe directo: Drive → Express → Cliente (sin guardar en disco)
    response.data.pipe(res);
  }

  // Subir archivo a Drive
  async subirArchivo({ nombre, mimeType, buffer, carpetaId }) {
    const folderId = carpetaId || process.env.DRIVE_FOLDER_ID;
    const { Readable } = await import('stream');

    const response = await this.drive.files.create({
      requestBody: {
        name: nombre,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: Readable.from(buffer),
      },
      fields: 'id, name, mimeType, size',
    });

    return response.data;
  }
}

// Singleton — una sola instancia para toda la app
const driveService = new DriveService();
export default driveService;
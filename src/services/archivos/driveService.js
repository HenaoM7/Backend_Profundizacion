import { google } from 'googleapis';
import 'dotenv/config';

class DriveService {
  constructor() {
    this.drive = null;
  }

  async init() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/drive',
      ],
    });

    this.drive = google.drive({ version: 'v3', auth });
    console.log('✓ Drive inicializado');
    console.log('  email:', process.env.GOOGLE_CLIENT_EMAIL);
    console.log('  folder:', process.env.DRIVE_FOLDER_ID);
  }

  async listarArchivos(carpetaId = null) {
    const folderId = carpetaId || process.env.DRIVE_FOLDER_ID;
    const response = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, createdTime, modifiedTime)',
      orderBy: 'name',
    });
    return response.data.files || [];
  }

  async obtenerArchivo(driveId) {
    const response = await this.drive.files.get({
      fileId: driveId,
      fields: 'id, name, mimeType, size, createdTime, webViewLink',
    });
    return response.data;
  }

  async streamArchivo(driveId, res) {
    const metadata = await this.obtenerArchivo(driveId);
    const response = await this.drive.files.get(
        { fileId: driveId, alt: 'media' },
        { responseType: 'stream' }
    );
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.name}"`);
    res.setHeader('Content-Type', metadata.mimeType);
    response.data.pipe(res);
  }

  async subirArchivo({ nombre, mimeType, buffer, carpetaId }) {
    const folderId = carpetaId || process.env.DRIVE_FOLDER_ID;

    if (!folderId) throw new Error('No se especificó carpeta. Verifica DRIVE_FOLDER_ID en .env');

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

  async eliminarArchivo(driveId) {
    await this.drive.files.delete({ fileId: driveId });
    return true;
  }
}

const driveService = new DriveService();
export default driveService;
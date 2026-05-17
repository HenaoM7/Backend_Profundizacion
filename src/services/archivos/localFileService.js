import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carpeta raíz donde se guardan todos los archivos
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Subcarpetas disponibles
const CARPETAS = ["documentos", "imagenes", "reportes"];

class LocalFileService {
    constructor() {
        this._inicializarCarpetas();
    }

    // Crea las carpetas si no existen al arrancar
    _inicializarCarpetas() {
        for (const carpeta of [UPLOADS_DIR, ...CARPETAS.map(c => path.join(UPLOADS_DIR, c))]) {
            if (!fs.existsSync(carpeta)) {
                fs.mkdirSync(carpeta, { recursive: true });
                console.log(`✓ Carpeta creada: ${carpeta}`);
            }
        }
        console.log("✓ Servicio de archivos local inicializado");
        console.log(`  Directorio: ${UPLOADS_DIR}`);
    }

    // Resuelve la ruta absoluta de una carpeta
    _resolverRuta(carpeta = "documentos") {
        const rutaCarpeta = path.join(UPLOADS_DIR, carpeta);

        // Seguridad: evitar path traversal (ej: ../../etc/passwd)
        if (!rutaCarpeta.startsWith(UPLOADS_DIR)) {
            throw new Error("Ruta no permitida");
        }

        return rutaCarpeta;
    }

    // ── Subir archivo ──────────────────────────────────────
    async subirArchivo({ nombre, mimeType, buffer, carpeta = "documentos" }) {
        try {
            const rutaCarpeta = this._resolverRuta(carpeta);
            const nombreSeguro = this._nombreSeguro(nombre);
            const rutaArchivo = path.join(rutaCarpeta, nombreSeguro);

            fs.writeFileSync(rutaArchivo, buffer);

            const stats = fs.statSync(rutaArchivo);

            return {
                id: `${carpeta}/${nombreSeguro}`,   // ID = ruta relativa
                name: nombreSeguro,
                mimeType,
                size: stats.size,
                carpeta,
                createdTime: stats.birthtime,
                modifiedTime: stats.mtime,
                path: rutaArchivo,
            };
        } catch (error) {
            console.error("Error subiendo archivo:", error.message);
            throw error;
        }
    }

    // ── Descargar archivo ──────────────────────────────────
    async descargarArchivo(fileId, res) {
        try {
            const rutaArchivo = path.join(UPLOADS_DIR, fileId);

            // Seguridad: verificar que está dentro de uploads
            if (!rutaArchivo.startsWith(UPLOADS_DIR)) {
                throw Object.assign(new Error("Ruta no permitida"), { status: 403 });
            }

            if (!fs.existsSync(rutaArchivo)) {
                throw Object.assign(new Error("Archivo no encontrado"), { status: 404 });
            }

            const stats = fs.statSync(rutaArchivo);
            const nombre = path.basename(rutaArchivo);
            const mimeType = this._inferirMimeType(nombre);

            res.setHeader("Content-Disposition", `attachment; filename="${nombre}"`);
            res.setHeader("Content-Type", mimeType);
            res.setHeader("Content-Length", stats.size);

            const stream = fs.createReadStream(rutaArchivo);
            stream.pipe(res);
        } catch (error) {
            console.error("Error descargando archivo:", error.message);
            if (!res.headersSent) {
                res.status(error.status || 500).json({
                    success: false,
                    error: error.message,
                });
            }
        }
    }

    // ── Eliminar archivo ───────────────────────────────────
    async eliminarArchivo(fileId) {
        try {
            const rutaArchivo = path.join(UPLOADS_DIR, fileId);

            if (!rutaArchivo.startsWith(UPLOADS_DIR)) {
                throw Object.assign(new Error("Ruta no permitida"), { status: 403 });
            }

            if (!fs.existsSync(rutaArchivo)) {
                throw Object.assign(new Error("Archivo no encontrado"), { status: 404 });
            }

            fs.unlinkSync(rutaArchivo);
            return true;
        } catch (error) {
            console.error("Error eliminando archivo:", error.message);
            throw error;
        }
    }

    // ── Listar archivos de una carpeta ─────────────────────
    async listarArchivos(carpeta = "documentos") {
        try {
            const rutaCarpeta = this._resolverRuta(carpeta);

            if (!fs.existsSync(rutaCarpeta)) {
                return [];
            }

            const archivos = fs.readdirSync(rutaCarpeta);

            return archivos
                .filter(nombre => {
                    const ruta = path.join(rutaCarpeta, nombre);
                    return fs.statSync(ruta).isFile();
                })
                .map(nombre => {
                    const ruta = path.join(rutaCarpeta, nombre);
                    const stats = fs.statSync(ruta);
                    return {
                        id: `${carpeta}/${nombre}`,
                        name: nombre,
                        mimeType: this._inferirMimeType(nombre),
                        size: stats.size,
                        carpeta,
                        createdTime: stats.birthtime,
                        modifiedTime: stats.mtime,
                    };
                });
        } catch (error) {
            console.error("Error listando archivos:", error.message);
            throw error;
        }
    }

    // ── Helpers ────────────────────────────────────────────

    // Sanitiza el nombre del archivo para evitar caracteres peligrosos
    _nombreSeguro(nombre) {
        const ext = path.extname(nombre);
        const base = path.basename(nombre, ext)
            .replace(/[^a-zA-Z0-9._-]/g, "_")  // reemplaza caracteres especiales
            .substring(0, 100);                  // máximo 100 caracteres
        const timestamp = Date.now();
        return `${timestamp}_${base}${ext}`;
    }

    // Infiere el Content-Type según la extensión
    _inferirMimeType(nombre) {
        const ext = path.extname(nombre).toLowerCase();
        const tipos = {
            ".pdf":  "application/pdf",
            ".doc":  "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls":  "application/vnd.ms-excel",
            ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".png":  "image/png",
            ".jpg":  "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif":  "image/gif",
            ".txt":  "text/plain",
            ".csv":  "text/csv",
            ".zip":  "application/zip",
        };
        return tipos[ext] || "application/octet-stream";
    }
}

const localFileService = new LocalFileService();
export default localFileService;

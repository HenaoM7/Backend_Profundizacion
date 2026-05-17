import { Client } from "@microsoft/microsoft-graph-client";
import { PublicClientApplication } from "@azure/msal-node";
import * as fs from "fs";
import "isomorphic-fetch";
import "dotenv/config";

const TOKEN_CACHE_FILE = "./token_cache.json";
const SCOPES = ["Files.ReadWrite.All", "User.Read", "offline_access"];

// ── Configuración MSAL ─────────────────────────────────────
// Usamos "common" para permitir cuentas institucionales y personales
const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        authority: "https://login.microsoftonline.com/common", // ← NO usar tenant_id
    },
    cache: {
        cachePlugin: {
            beforeCacheAccess: async (cacheContext) => {
                if (fs.existsSync(TOKEN_CACHE_FILE)) {
                    cacheContext.tokenCache.deserialize(
                        fs.readFileSync(TOKEN_CACHE_FILE, "utf-8")
                    );
                }
            },
            afterCacheAccess: async (cacheContext) => {
                if (cacheContext.cacheHasChanged) {
                    fs.writeFileSync(
                        TOKEN_CACHE_FILE,
                        cacheContext.tokenCache.serialize()
                    );
                }
            },
        },
    },
};

const pca = new PublicClientApplication(msalConfig);

// ── Obtener token (silencioso o Device Code) ───────────────
async function getAccessToken() {
    const accounts = await pca.getTokenCache().getAllAccounts();

    if (accounts.length > 0) {
        try {
            const result = await pca.acquireTokenSilent({
                account: accounts[0],
                scopes: SCOPES,
            });
            return result.accessToken;
        } catch {
            console.log("⚠️  Token expirado, re-autenticando...");
        }
    }

    // Device Code Flow — solo se ejecuta la primera vez o si expira
    const result = await pca.acquireTokenByDeviceCode({
        scopes: SCOPES,
        deviceCodeCallback: (response) => {
            console.log("\n================================================");
            console.log("🔐 AUTENTICACIÓN REQUERIDA");
            console.log("================================================");
            console.log("1. Abre este link en tu navegador:");
            console.log(`   👉  ${response.verificationUri}`);  // ← URL correcta
            console.log(`2. Ingresa este código: 👉  ${response.userCode}`);  // ← userCode no user_code
            console.log("3. Inicia sesión con tu cuenta institucional");
            console.log("================================================\n");
        },
    });

    return result.accessToken;
}

// ── Clase principal ────────────────────────────────────────
class OneDriveService {
    constructor() {
        this.graphClient = null;
    }

    async init() {
        await getAccessToken(); // Dispara Device Code si es necesario

        this.graphClient = Client.initWithMiddleware({
            authProvider: {
                getAccessToken: async () => await getAccessToken(),
            },
        });

        console.log("✓ OneDrive (Microsoft Graph) inicializado");
        console.log("  client_id:", process.env.AZURE_CLIENT_ID);
        console.log("  folder:", process.env.DRIVE_FOLDER_ID || "root");
    }

    // ── Helper: resuelve el endpoint base según folderId ────
    _folderUrl(folderId) {
        const id = folderId || process.env.DRIVE_FOLDER_ID || "root";
        return id === "root"
            ? `/me/drive/root`
            : `/me/drive/items/${id}`;
    }

    async listarArchivos(carpetaId = null) {
        try {
            const base = this._folderUrl(carpetaId);
            const response = await this.graphClient
                .api(`${base}/children`)
                .get();

            return (
                response.value?.map((item) => ({
                    id: item.id,
                    name: item.name,
                    mimeType: item.file?.mimeType || "folder",
                    size: item.size || 0,
                    createdTime: item.createdDateTime,
                    modifiedTime: item.lastModifiedDateTime,
                    webUrl: item.webUrl,
                    isFolder: !!item.folder,
                })) || []
            );
        } catch (error) {
            console.error("Error listando archivos:", error.message);
            throw error;
        }
    }

    async obtenerArchivo(driveId) {
        try {
            const response = await this.graphClient
                .api(`/me/drive/items/${driveId}`)
                .get();

            return {
                id: response.id,
                name: response.name,
                mimeType: response.file?.mimeType || "folder",
                size: response.size || 0,
                createdTime: response.createdDateTime,
                modifiedTime: response.lastModifiedDateTime,
                webUrl: response.webUrl,
                isFolder: !!response.folder,
            };
        } catch (error) {
            console.error("Error obteniendo archivo:", error.message);
            throw error;
        }
    }

    async descargarArchivo(driveId, res) {
        try {
            const metadata = await this.obtenerArchivo(driveId);

            const response = await this.graphClient
                .api(`/me/drive/items/${driveId}`)
                .get();

            const downloadUrl = response["@microsoft.graph.downloadUrl"];

            if (!downloadUrl) {
                throw new Error("No se puede descargar este archivo");
            }

            const fileResponse = await fetch(downloadUrl);

            if (!fileResponse.ok) {
                throw new Error(`Error descargando: ${fileResponse.statusText}`);
            }

            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${metadata.name}"`
            );
            res.setHeader("Content-Type", metadata.mimeType);
            res.setHeader("Content-Length", metadata.size);

            fileResponse.body.pipe(res);
        } catch (error) {
            console.error("Error en descarga:", error.message);
            if (!res.headersSent) {
                res.status(error.status || 500).json({
                    success: false,
                    error: error.message,
                });
            }
        }
    }

    async subirArchivo({ nombre, mimeType, buffer, carpetaId }) {
        try {
            const base = this._folderUrl(carpetaId);

            if (buffer.length < 4 * 1024 * 1024) {
                const response = await this.graphClient
                    .api(`${base}:/${nombre}:/content`)
                    .put(buffer);

                return {
                    id: response.id,
                    name: response.name,
                    mimeType: response.file?.mimeType || mimeType,
                    size: response.size,
                    webUrl: response.webUrl,
                };
            } else {
                return await this.subirArchivoGrande({ nombre, buffer, base });
            }
        } catch (error) {
            console.error("Error subiendo archivo:", error.message);
            throw error;
        }
    }

    async subirArchivoGrande({ nombre, buffer, base }) {
        try {
            const uploadSession = await this.graphClient
                .api(`${base}:/${nombre}:/createUploadSession`)
                .post({ item: { name: nombre } });

            const sessionUrl = uploadSession.uploadUrl;
            const chunkSize = 320 * 1024;

            for (let i = 0; i < buffer.length; i += chunkSize) {
                const chunk = buffer.slice(i, Math.min(i + chunkSize, buffer.length));
                const start = i;
                const end = Math.min(i + chunkSize - 1, buffer.length - 1);

                const response = await fetch(sessionUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Length": chunk.length,
                        "Content-Range": `bytes ${start}-${end}/${buffer.length}`,
                    },
                    body: chunk,
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.id) {
                        return {
                            id: data.id,
                            name: data.name,
                            size: data.size,
                            webUrl: data.webUrl,
                        };
                    }
                }
            }
        } catch (error) {
            console.error("Error en subida grande:", error.message);
            throw error;
        }
    }

    async eliminarArchivo(driveId) {
        try {
            await this.graphClient.api(`/me/drive/items/${driveId}`).delete();
            return true;
        } catch (error) {
            console.error("Error eliminando archivo:", error.message);
            throw error;
        }
    }

    async crearCarpeta({ nombre, parentId }) {
        try {
            const base = this._folderUrl(parentId);

            const response = await this.graphClient
                .api(`${base}/children`)
                .post({
                    name: nombre,
                    folder: {},
                    "@microsoft.graph.conflictBehavior": "fail",
                });

            return {
                id: response.id,
                name: response.name,
                webUrl: response.webUrl,
                isFolder: true,
            };
        } catch (error) {
            console.error("Error creando carpeta:", error.message);
            throw error;
        }
    }

    async buscarCarpeta({ nombre, parentId }) {
        try {
            const base = this._folderUrl(parentId);

            const response = await this.graphClient
                .api(`${base}/children?$filter=name eq '${nombre}' and folder ne null`)
                .get();

            return response.value || [];
        } catch (error) {
            console.error("Error buscando carpeta:", error.message);
            throw error;
        }
    }

    async copiarArchivo({ sourceId, targetParentId, nuevoNombre }) {
        try {
            const targetFolder = targetParentId || process.env.DRIVE_FOLDER_ID || "root";

            const response = await this.graphClient
                .api(`/me/drive/items/${sourceId}/copy`)
                .post({
                    parentReference: { id: targetFolder },
                    name: nuevoNombre || `Copia de ${(await this.obtenerArchivo(sourceId)).name}`,
                });

            return { jobId: response.id, message: "Copia en progreso" };
        } catch (error) {
            console.error("Error copiando archivo:", error.message);
            throw error;
        }
    }

    async moverArchivo({ sourceId, targetParentId }) {
        try {
            const targetFolder = targetParentId || process.env.DRIVE_FOLDER_ID || "root";

            const response = await this.graphClient
                .api(`/me/drive/items/${sourceId}`)
                .patch({ parentReference: { id: targetFolder } });

            return { id: response.id, name: response.name, webUrl: response.webUrl };
        } catch (error) {
            console.error("Error moviendo archivo:", error.message);
            throw error;
        }
    }

    async renombrarArchivo({ sourceId, nuevoNombre }) {
        try {
            const response = await this.graphClient
                .api(`/me/drive/items/${sourceId}`)
                .patch({ name: nuevoNombre });

            return { id: response.id, name: response.name, webUrl: response.webUrl };
        } catch (error) {
            console.error("Error renombrando archivo:", error.message);
            throw error;
        }
    }
}

const oneDriveService = new OneDriveService();
export default oneDriveService;
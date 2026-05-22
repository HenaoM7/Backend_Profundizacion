class DocumentoModel {

    constructor(data = {}) {
        this.id           = data.id;
        this.name         = data.name;
        this.originalName = data.originalName || null;
        this.mimeType     = data.mimeType;
        this.size         = data.size;
        this.carpeta      = data.carpeta;
        this.createdTime  = data.createdTime  || null;
        this.modifiedTime = data.modifiedTime || null;
        this.path         = data.path         || null;  // solo uso interno, no se expone en API
    }

    toJSON() {
        return {
            id          : this.id,
            name        : this.name,
            originalName: this.originalName,
            mimeType    : this.mimeType,
            size        : this.size,
            carpeta     : this.carpeta,
            createdTime : this.createdTime,
            modifiedTime: this.modifiedTime,
            urlPublica  : this.urlPublica,
        };
    }

    /**
     * @param {object}  params
     * @param {string}  params.carpeta
     * @param {string}  params.nombre
     * @param {object}  params.stats        - resultado de fs.statSync
     * @param {string}  params.mimeType
     * @param {string} [params.originalName]
     * @param {string} [params.path]        - ruta absoluta en disco
     * @param {string} [params.baseUrl]     - URL base pública, ej: "http://localhost:3000/src/"
     */
    static fromStat({ carpeta, nombre, stats, mimeType, originalName = null, path: filePath = null, baseUrl = null }) {
        const fileId    = `${carpeta}/${nombre}`;
        const urlPublica = baseUrl
            ? `${baseUrl}uploads/${fileId}`
            : null;

        return new DocumentoModel({
            id          : fileId,
            name        : nombre,
            originalName,
            mimeType,
            size        : stats.size,
            carpeta,
            createdTime : stats.birthtime,
            modifiedTime: stats.mtime,
            path        : filePath,
            urlPublica,
        });
    }
}

export default DocumentoModel;
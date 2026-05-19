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
        };
    }

    static fromStat({ carpeta, nombre, stats, mimeType, originalName = null, path: filePath = null }) {
        return new DocumentoModel({
            id          : `${carpeta}/${nombre}`,
            name        : nombre,
            originalName,
            mimeType,
            size        : stats.size,
            carpeta,
            createdTime : stats.birthtime,
            modifiedTime: stats.mtime,
            path        : filePath,
        });
    }
}

export default DocumentoModel;
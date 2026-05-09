const DEFAULT_IMAGE = process.env.CERT_IMAGE_DEFAULT ?? null;
const EXTERNAL_URL  = process.env.CERT_IMAGE_URL      ?? null;
const TIMEOUT_MS    = 5000;


export const fetchImageUrl = async (courseId) => {
  if (!EXTERNAL_URL) {
    console.warn('[CertImage] CERT_IMAGE_URL no configurada. Usando imagen por defecto.');
    return DEFAULT_IMAGE;
  }

  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(
      `${EXTERNAL_URL}/courses/${courseId}/template`,
      {
        headers: { Accept: 'application/json' },
        signal:  controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[CertImage] Servicio externo respondió ${response.status} para curso ${courseId}.`);
      return DEFAULT_IMAGE;
    }

    const data = await response.json();
    const url  = data.imageUrl ?? data.url ?? data.image ?? null;

    if (!url) {
      console.warn(`[CertImage] Respuesta sin URL de imagen para curso ${courseId}.`);
      return DEFAULT_IMAGE;
    }

    console.info(`[CertImage] Imagen obtenida correctamente para curso ${courseId}.`);
    return url;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error(`[CertImage] Timeout al obtener imagen para curso ${courseId}.`);
    } else {
      console.error(`[CertImage] Error: ${err.message}`);
    }
    return DEFAULT_IMAGE;
  }
};

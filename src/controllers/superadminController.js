import { 
  getUsersViewWithStats,
  getResumenViewData,
  getCoursesViewWithStats,
  getDashboardControlData,
} from '../services/superadminService.js';

/**
 * Obtiene una vista consolidada de usuarios y roles con estadísticas
 * - Total de usuarios activos
 * - Total de estudiantes
 * - Total de docentes
 * - Listado detallado de usuarios
 */
export const getUsersView = async (req, res, next) => {
  try {
    const { estado, rol } = req.query;

    const filters = {
      estado: estado ? estado.toLowerCase() : undefined,
      rol: rol ? rol.toLowerCase() : undefined,
    };

    const result = await getUsersViewWithStats(filters);
    
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtiene resumen y métricas del dashboard
 * - Sesiones totales, certificados, cursos completados
 * - Tendencia de sesiones de los últimos 7 días
 * - Comparativas mensuales
 */
export const getResumenView = async (req, res, next) => {
  try {
    const result = await getResumenViewData();
    
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtiene una vista consolidada de cursos con estadísticas
 * - Total de cursos activos
 * - Cursos con contenido
 * - Cursos sin contenido
 * - Cursos sin inscripciones
 * - Listado detallado de cursos
 */
export const getCoursesView = async (req, res, next) => {
  try {
    const { estado, contenido, inscripciones } = req.query;

    const filters = {
      estado: estado ? estado.toLowerCase() : undefined,
      contenido: contenido ? contenido.toLowerCase() : undefined,
      inscripciones: inscripciones ? inscripciones.toLowerCase() : undefined,
    };

    const result = await getCoursesViewWithStats(filters);
    
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtiene datos completos del Panel de Control
 * - KPIs: estudiantes, docentes, cursos, contenidos
 * - Elementos que requieren atención
 * - Gráficos: sesiones, tipos de contenido, top cursos, top docentes
 */
export const getDashboardControl = async (req, res, next) => {
  try {
    const result = await getDashboardControlData();
    
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};


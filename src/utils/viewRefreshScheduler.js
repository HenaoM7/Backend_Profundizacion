import { query } from '../database/db.js';

/**
 * Scheduler para refrescar vistas materializadas
 * Ejecuta refreshes programados para mantener datos optimizados
 */

const REFRESH_INTERVALS = {
  // Cada 1 minuto
  dashboard: 60 * 2000,
  cursos: 60 * 2000,
  sesiones: 60 * 2000,
  usuarios: 60 * 2000,
  topCursos: 60 * 2000,
  topDocentes: 60 * 2000,
  contenido: 60 * 2000,
};

const VIEW_NAMES = {
  dashboard: 'v_dashboard_metricas_mensuales',
  cursos: 'v_cursos_estadisticas',
  usuarios: 'v_usuarios_consolidado',
  sesiones: 'v_sesiones_ultimos_7dias',
  topCursos: 'v_top_cursos_completitud',
  topDocentes: 'v_top_docentes_ranking',
  contenido: 'v_contenido_por_tipo',
};

let refreshTimers = {};

/**
 * Refresca una vista materializada específica
 */
export const refreshMaterializedView = async (viewName) => {
  try {
    console.log(`[ViewRefresh] Iniciando refresh de vista: ${viewName}`);
    const startTime = Date.now();
    
    await query(`REFRESH MATERIALIZED VIEW ${viewName}`);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[ViewRefresh] Vista ${viewName} refrescada exitosamente en ${duration}s`);
    
    return { success: true, viewName, duration };
  } catch (error) {
    console.error(`[ViewRefresh] Error refrescando ${viewName}:`, error.message);
    return { success: false, viewName, error: error.message };
  }
};

/**
 * Inicia el scheduler de refreshes automáticos
 */
export const startViewRefreshScheduler = () => {
  console.log('[ViewRefresh] Iniciando scheduler de vistas materializadas...');

  // Refresh inicial inmediato (opcional, comentado)
  // Object.entries(VIEW_NAMES).forEach(([key, viewName]) => {
  //   refreshMaterializedView(viewName);
  // });

  // Programar refreshes periódicos
  Object.entries(VIEW_NAMES).forEach(([key, viewName]) => {
    const interval = REFRESH_INTERVALS[key];
    
    // Refresh inicial después de 10 segundos
    refreshTimers[viewName] = setTimeout(() => {
      refreshMaterializedView(viewName);
      
      // Luego refrescar periódicamente
      refreshTimers[viewName] = setInterval(
        () => refreshMaterializedView(viewName),
        interval
      );
    }, 10 * 1000);
    
    const displayInterval = interval >= 60000 
      ? `${interval / (60 * 1000)} minuto(s)` 
      : `${interval / 1000} segundo(s)`;
    console.log(
      `[ViewRefresh] Programado: ${viewName} cada ${displayInterval}`
    );
  });
};

/**
 * Detiene el scheduler de refreshes
 */
export const stopViewRefreshScheduler = () => {
  console.log('[ViewRefresh] Deteniendo scheduler de vistas materializadas...');
  
  Object.entries(refreshTimers).forEach(([viewName, timer]) => {
    clearInterval(timer);
    clearTimeout(timer);
    console.log(`[ViewRefresh] Timer detenido para: ${viewName}`);
  });
  
  refreshTimers = {};
};

/**
 * Refresca todas las vistas materializadas (útil para llamadas manuales)
 */
export const refreshAllMaterializedViews = async () => {
  console.log('[ViewRefresh] Refrescando todas las vistas materializadas...');
  
  const results = await Promise.all(
    Object.values(VIEW_NAMES).map(viewName => 
      refreshMaterializedView(viewName)
    )
  );
  
  const successful = results.filter(r => r.success).length;
  console.log(`[ViewRefresh] Refresh completado: ${successful}/${results.length} exitosos`);
  
  return results;
};

/**
 * Obtiene estado del scheduler
 */
export const getSchedulerStatus = () => {
  return {
    active: Object.keys(refreshTimers).length > 0,
    views: Object.keys(VIEW_NAMES),
    timers: Object.keys(refreshTimers),
  };
};

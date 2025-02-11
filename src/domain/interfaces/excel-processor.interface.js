/**
 * @typedef {Object} ProcessingResult
 * @property {boolean} success - Indica si el procesamiento fue exitoso
 * @property {number} processedRows - Número de filas procesadas
 * @property {number} errorCount - Número de errores encontrados
 */

/**
 * @typedef {Object} ProcessingError
 * @property {number} row - Número de fila donde ocurrió el error
 * @property {number} col - Número de columna donde ocurrió el error
 * @property {string} message - Mensaje de error
 */

/**
 * @typedef {Object} TaskStatus
 * @property {string} status - Estado actual de la tarea (pending/processing/done/failed)
 * @property {number} errors - Número de errores encontrados
 */

module.exports = {
    // Interfaces se definen aquí para documentación
};
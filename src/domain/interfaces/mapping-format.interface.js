/**
 * @typedef {Object} ValidationOptions
 * @property {number} [minLength] - Longitud mínima para strings y arrays
 * @property {number} [maxLength] - Longitud máxima para strings y arrays
 * @property {string} [pattern] - Patrón regex para strings
 * @property {any[]} [enum] - Valores permitidos
 * @property {number} [min] - Valor mínimo para números
 * @property {number} [max] - Valor máximo para números
 * @property {boolean} [integer] - Si el número debe ser entero
 * @property {boolean} [positive] - Si el número debe ser positivo
 * @property {Date} [minDate] - Fecha mínima
 * @property {Date} [maxDate] - Fecha máxima
 * @property {string} [format] - Formato de fecha
 */

/**
 * @typedef {Object} TypeConfig
 * @property {string} type - Tipo de dato
 * @property {ValidationOptions} [validations] - Opciones de validación
 */

/**
 * @typedef {Object.<string, string|TypeConfig>} MappingFormat
 */

module.exports = {};

const XLSX = require('xlsx');
const TaskRepository = require('../persistence/mongodb/repositories/task.repository');
const NodeCache = require('node-cache');

class ExcelProcessorService {
    constructor() {
        // Cache con tiempo de vida de 1 hora y limpieza cada 2 horas
        this.cache = new NodeCache({ stdTTL: 3600, checkperiod: 7200 });

        // Tipos de datos soportados con sus validadores y conversores
        this.supportedTypes = {
            'String': {
                validate: (value) => true, // Todos los valores pueden ser strings
                convert: (value) => String(value).trim(),
                validateOptions: {
                    minLength: (value, min) => value.length >= min,
                    maxLength: (value, max) => value.length <= max,
                    pattern: (value, regex) => new RegExp(regex).test(value),
                    enum: (value, allowedValues) => allowedValues.includes(value)
                }
            },
            'Number': {
                validate: (value) => !isNaN(Number(value)),
                convert: (value) => Number(value),
                validateOptions: {
                    min: (value, min) => value >= min,
                    max: (value, max) => value <= max,
                    integer: (value) => Number.isInteger(value),
                    positive: (value) => value > 0
                }
            },
            'Array<Number>': {
                validate: (value) => {
                    if (typeof value === 'string') {
                        return value.split(/[,\s]+/).every(num => !isNaN(Number(num.trim())));
                    }
                    return Array.isArray(value) && value.every(num => !isNaN(Number(num)));
                },
                convert: (value) => {
                    const numbers = (typeof value === 'string')
                        ? value.split(/[,\s]+/).map(num => Number(num.trim()))
                        : value.map(num => Number(num));
                    return numbers.sort((a, b) => a - b);
                },
                validateOptions: {
                    minLength: (arr, min) => arr.length >= min,
                    maxLength: (arr, max) => arr.length <= max,
                    minValue: (arr, min) => arr.every(num => num >= min),
                    maxValue: (arr, max) => arr.every(num => num <= max)
                }
            },
            'Date': {
                validate: (value) => !isNaN(Date.parse(value)),
                convert: (value) => new Date(value),
                validateOptions: {
                    minDate: (value, min) => value >= new Date(min),
                    maxDate: (value, max) => value <= new Date(max),
                    format: (value, format) => {
                        // Implementar validación de formato específico
                        return true; // Por ahora retorna true
                    }
                }
            },
            'Boolean': {
                validate: (value) => ['true', 'false', '1', '0', true, false].includes(value),
                convert: (value) => {
                    if (typeof value === 'string') {
                        return ['true', '1'].includes(value.toLowerCase());
                    }
                    return Boolean(value);
                }
            },
            'Email': {
                validate: (value) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(String(value));
                },
                convert: (value) => String(value).toLowerCase(),
            }
        };
    }

    async processExcelFile(filePath, taskId) {
        try {
            const task = await TaskRepository.findById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            // Verificar cache
            const cacheKey = `${taskId}_${filePath}`;
            const cachedResult = this.cache.get(cacheKey);
            if (cachedResult) {
                await task.markAsCompleted(cachedResult.processedData);
                return cachedResult;
            }

            await TaskRepository.updateStatus(taskId, 'processing');

            // Leer archivo Excel
            const workbook = XLSX.readFile(filePath);
            const results = await this.processWorkbook(workbook, task);

            // Guardar en cache
            this.cache.set(cacheKey, results);

            // Actualizar tarea
            if (results.errors.length > 0) {
                for (const error of results.errors) {
                    await task.addError(error);
                }
            }
            await task.markAsCompleted(results.processedData);

            return {
                success: true,
                processedRows: results.processedData.length,
                errorCount: results.errors.length,
                sheets: results.sheets
            };

        } catch (error) {
            console.error('Error processing Excel file:', error);
            await TaskRepository.findById(taskId).then(task => {
                if (task) {
                    task.markAsFailed(error);
                }
            });
            throw error;
        }
    }

    async processWorkbook(workbook, task) {
        const results = {
            processedData: [],
            errors: [],
            sheets: {}
        };

        // Procesar todas las hojas
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (sheetData.length < 2) {
                results.errors.push({
                    sheet: sheetName,
                    row: 0,
                    col: 0,
                    message: `Sheet "${sheetName}" is empty or missing data`
                });
                continue;
            }

            const sheetResults = await this.processSheet(sheetData, task.mappingFormat, sheetName);

            results.processedData.push(...sheetResults.processedData);
            results.errors.push(...sheetResults.errors);
            results.sheets[sheetName] = {
                rowsProcessed: sheetResults.processedData.length,
                errorsFound: sheetResults.errors.length
            };

            // Actualizar progreso
            await task.updateProgress(
                results.processedData.length,
                workbook.SheetNames.reduce((total, sheet) => {
                    const ws = workbook.Sheets[sheet];
                    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
                    return total + (range.e.r - range.s.r);
                }, 0)
            );
        }

        return results;
    }

    async processSheet(data, mappingFormat, sheetName) {
        const headers = data[0];
        const processedData = [];
        const errors = [];

        // Validar headers
        const missingColumns = Object.keys(mappingFormat).filter(key => !headers.includes(key));
        if (missingColumns.length > 0) {
            errors.push({
                sheet: sheetName,
                row: 1,
                col: 0,
                message: `Missing columns: ${missingColumns.join(', ')}`
            });
        }

        // Procesar filas
        for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
            const row = data[rowIndex];
            const processedRow = {};
            let hasError = false;

            // Procesar cada columna
            for (const [key, typeConfig] of Object.entries(mappingFormat)) {
                const columnIndex = headers.indexOf(key);
                if (columnIndex === -1) continue;

                const value = row[columnIndex];
                const { type, validations = {} } = this.parseTypeConfig(typeConfig);

                try {
                    // Validar y convertir valor
                    const processedValue = await this.validateAndConvertValue(value, type, validations, {
                        sheet: sheetName,
                        row: rowIndex + 1,
                        col: columnIndex + 1,
                        field: key
                    });

                    processedRow[key] = processedValue;
                } catch (error) {
                    hasError = true;
                    errors.push({
                        sheet: sheetName,
                        row: rowIndex + 1,
                        col: columnIndex + 1,
                        message: `Error in column ${key}: ${error.message}`
                    });
                }
            }

            if (!hasError) {
                processedData.push(processedRow);
            }
        }

        return { processedData, errors };
    }

    parseTypeConfig(typeConfig) {
        if (typeof typeConfig === 'string') {
            return { type: typeConfig };
        }
        return typeConfig;
    }

    async validateAndConvertValue(value, type, validations, context) {
        const typeHandler = this.supportedTypes[type];
        if (!typeHandler) {
            throw new Error(`Unsupported type: ${type}`);
        }

        // Validar tipo base
        if (!typeHandler.validate(value)) {
            throw new Error(`Invalid ${type} format`);
        }

        // Convertir valor
        const convertedValue = typeHandler.convert(value);

        // Aplicar validaciones adicionales
        for (const [rule, param] of Object.entries(validations)) {
            const validator = typeHandler.validateOptions?.[rule];
            if (validator && !validator(convertedValue, param)) {
                throw new Error(`Validation failed: ${rule} with parameter ${param}`);
            }
        }

        return convertedValue;
    }
}

const excelProcessor = new ExcelProcessorService();

module.exports = {
    processExcelFile: (filePath, taskId) => excelProcessor.processExcelFile(filePath, taskId)
};
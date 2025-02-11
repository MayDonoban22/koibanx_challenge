const TaskRepository = require('../../../infrastructure/persistence/mongodb/repositories/task.repository');
const { processExcelFile } = require('../../../infrastructure/excel/excel-processor.service');

class ExcelController {
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No file uploaded'
                });
            }

            const mappingFormat = req.body.mappingFormat;
            if (!mappingFormat) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Mapping format is required'
                });
            }

            const task = await TaskRepository.create({
                filename: req.file.filename,
                mappingFormat: JSON.parse(mappingFormat),
                status: 'pending'
            });

            processExcelFile(req.file.path, task._id).catch(console.error);

            return res.status(202).json({
                status: 'success',
                message: 'File upload started',
                taskId: task._id
            });
        } catch (error) {
            console.error('Error in file upload:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error processing file upload'
            });
        }
    }

    async getTaskStatus(req, res) {
        try {
            const { taskId } = req.params;
            const status = await TaskRepository.getTaskStatus(taskId);

            return res.json({
                status: 'success',
                data: status
            });
        } catch (error) {
            console.error('Error getting task status:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error retrieving task status'
            });
        }
    }

    async getTaskErrors(req, res) {
        try {
            const { taskId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const errors = await TaskRepository.getTaskErrors(taskId, page, limit);

            return res.json({
                status: 'success',
                data: errors
            });
        } catch (error) {
            console.error('Error getting task errors:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error retrieving task errors'
            });
        }
    }
}

module.exports = new ExcelController();
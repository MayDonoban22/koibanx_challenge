const express = require('express');
const router = express.Router();
const upload = require('../../../infrastructure/middlewares/upload.middleware');
const excelController = require('../controllers/excel.controller');

router.post('/upload',
    upload.single('file'),
    excelController.uploadFile
);

router.get('/tasks/:taskId/status',
    excelController.getTaskStatus
);

router.get('/tasks/:taskId/errors',
    excelController.getTaskErrors
);

module.exports = router;
const mongoose = require('mongoose');

const errorSchema = new mongoose.Schema({
    row: {
        type: Number,
        required: true
    },
    col: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { _id: false });

const taskSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'done', 'failed'],
        default: 'pending'
    },

    mappingFormat: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },

    processedData: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    customErrors: {
        type: [errorSchema],
        default: []
    },
    errorCount: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },

    totalRows: {
        type: Number,
        default: 0
    },
    processedRows: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

taskSchema.index({ status: 1, createdAt: -1 });
taskSchema.index({ createdAt: -1 });

taskSchema.methods.addError = async function (error) {
    this.errors.push(error);
    this.errorCount = this.errors.length;
    return this.save();
};

taskSchema.methods.updateProgress = async function (processedRows, totalRows) {
    this.processedRows = processedRows;
    this.totalRows = totalRows;
    return this.save();
};

taskSchema.methods.markAsCompleted = async function (processedData) {
    this.status = 'done';
    this.processedData = processedData;
    this.completedAt = new Date();
    return this.save();
};

taskSchema.methods.markAsFailed = async function (error) {
    this.status = 'failed';
    this.errors.push({
        row: 0,
        col: 0,
        message: error.message || 'Unknown error occurred'
    });
    this.errorCount = this.errors.length;
    this.completedAt = new Date();
    return this.save();
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
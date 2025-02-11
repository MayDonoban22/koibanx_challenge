const Task = require('../models/task.model');

class TaskRepository {
    async create(taskData) {
        const task = new Task(taskData);
        return task.save();
    }

    async findById(id) {
        return Task.findById(id);
    }

    async updateStatus(id, status) {
        return Task.findByIdAndUpdate(
            id,
            { $set: { status, updatedAt: new Date() } },
            { new: true }
        );
    }

    async getTaskStatus(id) {
        const task = await Task.findById(id).select('status errorCount');
        return {
            status: task.status,
            errors: task.errorCount
        };
    }

    async getTaskErrors(id, page = 1, limit = 10) {
        const task = await Task.findById(id)
            .select('errors')
            .slice('errors', [(page - 1) * limit, limit]);

        const totalErrors = await Task.findById(id).select('errorCount');

        return {
            errors: task.errors,
            pagination: {
                page,
                limit,
                totalErrors: totalErrors.errorCount,
                totalPages: Math.ceil(totalErrors.errorCount / limit)
            }
        };
    }
}

module.exports = new TaskRepository();
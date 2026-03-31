

const express = require('express');
const ProgressRoute = express.Router();
const ProgressController = require('../Controller/ProgressController');
const authMiddleware = require('../Middleware/authMiddleware'); // Changed: no curly braces

// Debug line to check if middleware is loaded
console.log('authMiddleware loaded:', authMiddleware ? 'Yes' : 'No');

// All routes require authentication
ProgressRoute.use(authMiddleware); // This will now work

// Progress CRUD operations
ProgressRoute.post('/add', ProgressController.createProgress.bind(ProgressController));
ProgressRoute.get('/list', ProgressController.getUserProgress.bind(ProgressController));
ProgressRoute.get('/summary', ProgressController.getProgressSummary.bind(ProgressController));
ProgressRoute.get('/graphs', ProgressController.getProgressGraphs.bind(ProgressController));
ProgressRoute.get('/list/:id', ProgressController.getProgressById.bind(ProgressController));
ProgressRoute.post('/update/:id', ProgressController.updateProgress.bind(ProgressController));
ProgressRoute.post('/delete/:id', ProgressController.deleteProgress.bind(ProgressController));

// Bulk operations
ProgressRoute.post('/bulk-add', ProgressController.bulkCreateProgress.bind(ProgressController));

module.exports = ProgressRoute;
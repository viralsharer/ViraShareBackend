// backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getLoggedInUserTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/tasks
router.post('/', authMiddleware, createTask);

// @route   GET /api/tasks
router.get('/', authMiddleware, getTasks);


// @route   GET /api/tasks
router.get('/getMyTask', authMiddleware, getLoggedInUserTasks);

// @route   GET /api/tasks/:id
router.get('/:id', authMiddleware, getTaskById);

// @route   PUT /api/tasks/:id
router.put('/:id', authMiddleware, updateTask);

// @route   DELETE /api/tasks/:id
router.delete('/:id', authMiddleware, deleteTask);

module.exports = router;

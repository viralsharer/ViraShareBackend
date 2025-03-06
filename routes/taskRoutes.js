// backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getLoggedInUserTasks,
  getTaskById,
  reviewTask,
  performTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');

// Public/User Routes
router.post('/', authMiddleware, createTask); // Create a task (User)
router.get('/getMyTask', authMiddleware, getLoggedInUserTasks); // Get logged-in user's tasks
router.get('/:id', authMiddleware, getTaskById); // Get a single task by ID
router.post('/perform/:taskId', authMiddleware, performTask); 
router.get('/', authMiddleware, getTasks); // Get all tasks (Admin)
 



// Admin Routes
router.get('/', adminAuth, getTasks); // Get all tasks (Admin)
router.put('/:id', adminAuth, updateTask); // Update task (Admin)
router.delete('/:id', adminAuth, deleteTask); // Delete task (Admin)
router.post('/review/', adminAuth, reviewTask); 

// performTask 

module.exports = router;

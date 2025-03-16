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
  getTaskLogs,
  gettLoggedInUserTaskLogs
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');

// Public/User Routes
router.post('/', authMiddleware, createTask); // Create a task (User)
router.get('/getMyTask', authMiddleware, getLoggedInUserTasks); // Get logged-in user's tasks
router.get('/getbyid/:id', authMiddleware, getTaskById); // Get a single task by ID
router.post('/perform/:taskId', authMiddleware, performTask); 
router.get('/', authMiddleware, getTasks); // Get all tasks (Admin)
router.get('/getMyTaskLog',adminAuth, gettLoggedInUserTaskLogs);
 



// Admin Routes
router.get('/task/', adminAuth, getTasks); // Get all tasks (Admin)
// router.get('/', adminAuth, getTaskLogs); // Get all tasks (Admin)
router.put('/task/:id', adminAuth, updateTask); // Update task (Admin)
router.delete('/task/:id', adminAuth, deleteTask); // Delete task (Admin)
router.post('/review', adminAuth, reviewTask); 
router.get('/tasklogs',adminAuth, getTaskLogs);


// performTask 

module.exports = router;

const express = require('express');
const router = express.Router();
const { adminLogin, createAdmin,getTaskLogs } = require('../controllers/adminController');



const adminAuth = require('../middleware/adminMiddleware');

// Create Admin (For Initial Setup Only)
router.post('/create', createAdmin);

// Admin Login
router.post('/login', adminLogin);

router.get('/getTaskLogs ', adminAuth, getTaskLogs );


module.exports = router;

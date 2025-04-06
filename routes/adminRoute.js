const express = require('express');
const router = express.Router();
const { adminLogin, createAdmin,getTaskLogs,getAdminDashboard,listAllUsers,getAllTransactions } = require('../controllers/adminController');



const adminAuth = require('../middleware/adminMiddleware');

// Create Admin (For Initial Setup Only)
router.post('/create', createAdmin);

// Admin Login
router.post('/login', adminLogin);

router.get('/getTaskLogs', adminAuth, getTaskLogs );

router.get('/dashboard', adminAuth, getAdminDashboard );

router.get('/alluser', adminAuth, listAllUsers );
router.get('/transactions', adminAuth, getAllTransactions );



module.exports = router;

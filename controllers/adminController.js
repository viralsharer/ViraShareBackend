const Admin = require('../models/Admin');
const TaskLog = require('../models/TaskLog');
const Task = require('../models/Task'); 
const Package = require('../models/Package');
const User = require('../models/User');
const Transaction = require('../models/transaction');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Login



exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Credentials',
        data: null,
      });
    }

    // ✅ Compare passwords before removing it from the response
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Credentials',
        data: null,
      });
    }

    // ✅ Remove password before sending the response
    const { password: _, ...adminData } = admin.toObject();

    const payload = { user: { id: admin.id, role: 'admin' } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      status: 'success',
      message: 'Authentication successful',
      data: { token, admin: adminData }, // ✅ Password is excluded
    });

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      data: null,
    });
  }
};

// Create an Admin Account (Only for Initial Setup)
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        status: 'error',
        message: 'Admin already exists',
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      username,
      email,
      password: hashedPassword,
    });

    await admin.save();

    return res.status(201).json({
      status: 'success',
      message: 'Admin created successfully',
      data: admin,
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      data: null,
    });
  }
};

exports.getTaskLogs = async (req, res) => {
    try {
        const logs = await TaskLog.find().populate('userId', 'name email').populate('taskId', 'title image');

        res.json({
            status: 'success',
            data: logs
        });

    } catch (error) {
        console.error('Error fetching task logs:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};


exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalPackages = await Package.countDocuments();

    const taskLogs = await TaskLog.find().populate('userId taskId');
    const transactions = await Transaction.find().populate('user_id');
    const users = await User.find()
      .populate('packageId', 'name') // Get only the package name
      .select('name email isPaid packageId createdAt');

    const formattedTransactions = transactions.map(tx => ({
      name: tx.user_id?.name || 'N/A',
      email: tx.user_id?.email || 'N/A',
      amount: tx.amount,
      date: tx.createdAt,
    }));

    const formattedUsers = users.map(user => ({
      name: user.name,
      email: user.email,
      date: user.createdAt,
      isPaid: user.isPaid,
      package: user.packageId ? user.packageId.name : null,
    }));

    return res.status(200).json({
      status: 'success',
      message: 'Dashboard data fetched',
      data: {
        totalUsers,
        totalTasks,
        totalPackages,
        taskLogs,
        transactions: formattedTransactions,
        users: formattedUsers,
      }
    });

  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      data: null
    });
  }
};


exports.listAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .populate('packageId', 'name') // Only select package name
      .select('name email isPaid amountPaid packageId createdAt')
      .sort({ createdAt: -1 });

    const formattedUsers = users.map(user => ({
      name: user.name,
      email: user.email,
      amountPaid: user.amountPaid,
      isPaid: user.isPaid,
      package: user.isPaid && user.packageId ? user.packageId.name : null,
      createdAt: user.createdAt
    }));

    return res.status(200).json({
      status: 'success',
      message: 'Users fetched successfully',
      data: formattedUsers
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      data: null
    });
  }
};


exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('user_id', 'name email') // only bring in name and email
      .sort({ createdAt: -1 });

    // Format response (optional)
    const formatted = transactions.map(tx => ({
      id: tx._id,
      user: tx.user_id ? {
        name: tx.user_id.name,
        email: tx.user_id.email,
      } : null,
      transaction_id: tx.transaction_id,
      reference: tx.reference,
      amount: tx.amount,
      settled_amount: tx.settled_amount,
      charges: tx.charges,
      transaction_type: tx.transaction_type,
      transaction_services: tx.transaction_services,
      status: tx.status,
      createdAt: tx.createdAt
    }));

    return res.status(200).json({
      status: 'success',
      message: 'Transactions fetched successfully',
      data: formatted
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      data: null
    });
  }
};



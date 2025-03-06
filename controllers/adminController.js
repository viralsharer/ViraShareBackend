const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email }).select('-password');
    if (!admin) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Credentials',
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Credentials',
        data: null,
      });
    }

    const payload = { user: { id: admin.id, role: 'admin' } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      status: 'success',
      message: 'Authentication successful',
      data: { token, admin },
    });

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      data: null,
    });
  }
};


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
        const logs = await TaskLog.find().populate('userId', 'name email').populate('taskId', 'title');

        res.json({
            status: 'success',
            data: logs
        });

    } catch (error) {
        console.error('Error fetching task logs:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};


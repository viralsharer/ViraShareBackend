// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const { sendResponse } = require('../utils/responseHelper');



// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return sendResponse(res, 400, 'error', 'User already exists', null);
    }

    // Create new user
    user = new User({ name, email, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    return sendResponse(
      res,
      201,
      'success',
      'User registered successfully',
      null,
      user.id
    );
  } catch (err) {
    console.error(err.message);
    return sendResponse(res, 500, 'error', 'Server error', null);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 400, 'error', 'Invalid Credentials', null);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 400, 'error', 'Invalid Credentials', null);
    }

    return sendResponse(
      res,
      200,
      'success',
      'Authentication successful',
      null,
      user.id
    );
  } catch (err) {
    console.error(err.message);
    return sendResponse(res, 500, 'error', 'Server error', null);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return sendResponse(res, 200, 'success', 'User profile retrieved', user);
  } catch (err) {
    console.error(err.message);
    return sendResponse(res, 500, 'error', 'Server error', null);
  }
};

// User Registration
exports.registerUser = async (req, res) => {
  const {  email } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

  try {

    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return sendResponse(
          res,
          200,
          'success',
          'Email already verified.',
          null,
          user.id
        );
     
      }

    }else{
      const newUser = new User({  email, verificationCode });
    await newUser.save();

    // Send Verification Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "Oladitisodiq@gmail.com",
        pass: "pbymupdgbsvlndrt",
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);
    return sendResponse(
      res,
      201,
      'success',
      'User registered. Check your email for verification code.',
      null
    );

    }

    
  } catch (error) {
    return sendResponse(res, 500, 'error', error.message, null);
  }
};

// Email Verification
exports.verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.verificationCode !== verificationCode) {
      return sendResponse(
        res,
        400,
        'error',
        'Invalid verification code or email.',
        null
      );
   
    }

    user.isVerified = true;
    user.verificationCode = null; // Clear verification code after verification
    await user.save();
    return sendResponse(
      res,
      200,
      'success',
      'Email verified successfully.',
      null,
      user.id
    );
    
    
  } catch (error) {
    return sendResponse(res, 500, 'error', error.message, null);
  }
};

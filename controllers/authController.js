// backend/controllers/authController.js
const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const { sendResponse } = require('../utils/responseHelper');



// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const sendVerificationEmail = async (email, verificationCode) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use environment variables for security
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification',
    text: `Your verification code is: ${verificationCode}`,
  };

  await transporter.sendMail(mailOptions);
};

// Unified User Registration & Signup
exports.registerOrSignupUser = async (req, res) => {
  const { name, email, password, phone, referralCode } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

  // Validate required fields
  if (!name || !email || !password || !phone) {
    return sendResponse(res, 400, 'error', 'All fields except referralCode are required', null);
  }

  try {
    // Check if the user already exists
    let user = await User.findOne({ $or: [{ email }, { phone }] });

    if (user) {
      if (user.isVerified) {
        return sendResponse(res, 200, 'success', 'Email already verified.', null, user.id);
      } else {
        // Resend verification email

        user.verificationCode = verificationCode;
        await user.save();
        
        await sendVerificationEmail(email, verificationCode);
        return sendResponse(res, 200, 'success', 'Verification email resent.', null);
      }
    }

    // Validate referral code (if provided)
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return sendResponse(res, 400, 'error', 'Invalid referral code', null);
      }
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      phone,
      referral: referrer ? referrer._id : null, // Store referrer ID if valid
      verificationCode,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    return sendResponse(res, 201, 'success', 'User registered. Check your email for verification code.', null, user.id);
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

    const payload = { user: { id: user.id, role: 'user' } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Get user tasks with details
    const tasks = await Task.find()
      .populate('socialPlatform')
      .populate('engagementType')
      .populate('user', '-password'); // Exclude password from user details

    return sendResponse(
      res,
      200,
      'success',
      'Authentication successful',
      { user, tasks,token }
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


exports.resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 404, 'error', 'User not found.', null);
    }
    if (user.isVerified) {
      return sendResponse(res, 400, 'error', 'Email already verified.', null);
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    await user.save();

    // Send Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCode}`,
    });

    return sendResponse(res, 200, 'success', 'Verification email resent.', null);
  } catch (error) {
    return sendResponse(res, 500, 'error', error.message, null);
  }
};

// @desc Forgot Password
// @route POST /api/auth/forgot-password
// @access Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 404, 'error', 'User not found.', null);
    }

    // Generate password reset token
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    await user.save();

    // Send Reset Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Use this token to reset your password: ${resetToken}`,
    });

    return sendResponse(res, 200, 'success', 'Password reset email sent.', null);
  } catch (error) {
    return sendResponse(res, 500, 'error', error.message, null);
  }
};

// @desc Reset Password
// @route POST /api/auth/reset-password
// @access Public
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.resetPasswordToken !== token) {
      return sendResponse(res, 400, 'error', 'Invalid or expired token.', null);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    await user.save();

    return sendResponse(res, 200, 'success', 'Password reset successful.', null);
  } catch (error) {
    return sendResponse(res, 500, 'error', error.message, null);
  }
};


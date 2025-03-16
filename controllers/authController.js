// backend/controllers/authController.js
const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');
const Package = require('../models/Package');
const Transaction = require('../models/transaction');
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

  console.log(verificationCode);

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
        console.log(verificationCode);
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

    return sendResponse(res, 201, 'success', 'User registered. Check your email for verification code.', null);
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
    const user = await User.findOne({ email }).populate({
      path: 'packageId',
      select: 'name price', // Retrieve only name and price
    });

    if (!user) {
      return sendResponse(res, 400, 'error', 'Invalid Credentials', null);
    }

    // Check if email is verified
    if (!user.isVerified) {
      return sendResponse(res, 403, 'error', 'Email not verified', null);
    }

    // // Check if user has paid
    // if (!user.isPaid) {
    //   return sendResponse(res, 403, 'error', 'Payment required', null);
    // }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 400, 'error', 'Invalid Credentials', null);
    }

    const payload = { user: { id: user.id, role: 'user' } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Get user tasks with details
    const tasks = await Task.find({ priority: "today" })
      .populate('socialPlatform')
      .populate('engagementType')
      .populate('user', '-password'); // Exclude password from user details


      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        referralCode: user.referralCode,
        mainBalance: user.mainBalance,
        temporaryBalance: user.temporaryBalance,
        isVerified: user.isVerified,
        package: user.packageId ? { name: user.packageId.name, price: user.packageId.price } : null, // Handle package response
      };

    return sendResponse(
      res,
      200,
      'success',
      'Authentication successful',
      { userResponse, tasks, token }
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
    const user = await User.findById(req.user.id).select('-password').populate({
      path: 'packageId',
      select: 'name price', // Retrieve only name and price
    });
    
    const payload = { user: { id: user.id, role: 'user' } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    const tasks = await Task.find({ priority: "today" })
    .populate('socialPlatform')
    .populate('engagementType')
    .populate('user', '-password').lean(); // Exclude password from user details


    const formattedTasks = tasks.map(task => ({
      ...task,
      socialPlatform: task.socialPlatform?.name || null,
      engagementType: Array.isArray(task.engagementType)
        ? task.engagementType.map(et => et.name).join(', ') // Convert array to comma-separated string
        : task.engagementType?.name || null, // Handle single object case
    }));

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    photo: user.photo,
    referralCode: user.referralCode,
    mainBalance: user.mainBalance,
    temporaryBalance: user.temporaryBalance,
    isVerified: user.isVerified,
    package: user.packageId ? { name: user.packageId.name, price: user.packageId.price } : null, // Handle package response
  };
  return sendResponse(
    res,
    200,
    'success',
    'User profile retrieved',
    { userResponse, formattedTasks, token }
  );
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
      return sendResponse(res, 404, "error", "User not found.", null);
    }

    // Generate a 6-digit OTP
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = resetOTP;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${resetOTP}. This OTP expires in 10 minutes.`,
    });

    return sendResponse(res, 200, "success", "Password reset OTP sent.", null);
  } catch (error) {
    return sendResponse(res, 500, "error", error.message, null);
  }
};

// @desc Reset Password
// @route POST /api/auth/reset-password
// @access Public
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.resetPasswordOTP !== otp) {
      return sendResponse(res, 400, "error", "Invalid or expired OTP.", null);
    }

    // Check if OTP is expired
    if (user.resetPasswordExpires < Date.now()) {
      return sendResponse(res, 400, "error", "OTP has expired. Please request a new one.", null);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = null; // Clear OTP
    user.resetPasswordExpires = null;
    await user.save();

    return sendResponse(res, 200, "success", "Password reset successful.", null);
  } catch (error) {
    return sendResponse(res, 500, "error", error.message, null);
  }
};

exports.updateUserPackage = async (req, res) => {
  const { userId, packageId, amountPaid } = req.body;

  if (!userId || !packageId || !amountPaid) {
    return sendResponse(res, 400, 'error', 'Missing required fields', null);
  }

  try {
    // Check if package exists
    const packageExists = await Package.findById(packageId);
    if (!packageExists) {
      return sendResponse(res, 404, 'error', 'Package not found', null);
    }

    // Update user payment details
    const user = await User.findByIdAndUpdate(
      userId,
      { packageId, amountPaid, isPaid: true },
      { new: true }
    );

    if (!user) {
      return sendResponse(res, 404, 'error', 'User not found', null);
    }

    return sendResponse(res, 200, 'success', 'User package updated', user);
  } catch (err) {
    return sendResponse(res, 500, 'error', err.message, null);
  }
};




exports.paystackWebhook = async (req, res) => {
  try {
    console.log('Webhook received:', req.body);

    const { event, data: transactionData } = req.body;

    if (!transactionData) {
      console.log('Invalid webhook data:', req.body);
      return res.status(400).json({ success: false, message: 'Invalid webhook data' });
    }

    if (event !== 'charge.success') {
      console.log('Event ignored:', event);
      return res.status(400).json({ success: false, message: 'Event ignored' });
    }

    console.log('Processing transaction:', transactionData);

    const metadata = transactionData.metadata || {};
    const { user_id, package_id } = metadata; // Extract package_id from metadata
    const transaction_id = transactionData.id;
    const reference = transactionData.reference;
    const amount = transactionData.amount / 100; // Convert kobo to Naira
    const status = transactionData.status;
    const charges = transactionData.fees || 0;
    const transaction_type = 'membership';

    if (!transaction_id || !reference || !amount || !status || !user_id || !package_id) {
      console.log('Missing required fields:', {
        transaction_id, reference, amount, status, user_id, package_id
      });
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingTransaction = await Transaction.findOne({
      $or: [{ transaction_id }, { reference }]
    });

    if (existingTransaction) {
      console.log('Transaction already exists:', existingTransaction);
      return res.status(409).json({ success: false, message: 'Transaction already exists' });
    }

    const user = await User.findById(user_id);
    if (!user) {
      console.log('User not found:', user_id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const packageExists = await Package.findById(package_id);
    if (!packageExists) {
      console.log('Package not found:', package_id);
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    if (status === 'success') {
      user.packageId = package_id;
      user.amountPaid = amount;
      user.isPaid = true;
      await user.save();
      console.log('User package updated:', { packageId: user.packageId, amountPaid: user.amountPaid });
    }

    const transaction = new Transaction({
      transaction_id,
      user_id,
      reference,
      amount: amount * 100,
      settled_amount: amount * 100,
      charges,
      transaction_type,
      status,
    });

    await transaction.save();
    console.log('Transaction saved:', transaction);

    

    res.status(200).json({
      success: true,
      message: 'Transaction processed successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    return res.status(200).json({
      status: 'success',
      message: 'Task Retrieved successfully!.',
      data: tasks,
    });
    // res.status(200).json(SocialPlatforms);
  } catch (error) {
  
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching tasks.',
      data: "",
    });
  }
};






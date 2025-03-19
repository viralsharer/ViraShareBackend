// backend/routes/authRoutes.js
const express = require('express');
const passport = require('../config/passport');

const router = express.Router();
const {  getBankDetails,verifyBankAccount,updateBankDetails,listBanks,login, getProfile, registerOrSignupUser,paystackWebhook, verifyEmail ,resendVerification, forgotPassword,resetPassword} = require('../controllers/authController');
const { datapackages,buy,services,datapurchase} = require('../controllers/airtimeController');
const { sendResponse } = require('../utils/responseHelper');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/auth/signup
// router.post('/signup', signup);

// @route   POST /api/auth/login565046565046
router.post('/login', login);

router.post('/virashare', paystackWebhook);

router.post('/resend', resendVerification);






router.post('/forgot-password', forgotPassword);


router.post('/reset-password', resetPassword);

// User Registration
router.post('/register', registerOrSignupUser);

// Email Verification
router.post('/verify-email', verifyEmail);

// @route   GET /api/auth/profile
router.get('/profile', authMiddleware, getProfile);

// router.get('/profile', authMiddleware, updateUserPackage);

router.get('/services', authMiddleware, services);
router.post('/airtime',authMiddleware, buy);
router.post('/data-packages',authMiddleware, datapackages);
router.post('/datapurchase',authMiddleware, datapurchase);
router.post('/account-details',authMiddleware, updateBankDetails);
router.get('/getBank', authMiddleware,listBanks);
router.post('/verify-account',authMiddleware, verifyBankAccount);
router.get('/get-bankdetails',authMiddleware, getBankDetails);




router.get('/', (req, res) => {
    res.send('Welcome Home!');
});


module.exports = router;

// backend/routes/authRoutes.js
const express = require('express');
const passport = require('../config/passport');

const router = express.Router();
const { signup, login, getProfile, registerUser, verifyEmail } = require('../controllers/authController');
const { sendResponse } = require('../utils/responseHelper');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/auth/signup
// router.post('/signup', signup);

// @route   POST /api/auth/login
// router.post('/login', login);

// User Registration
router.post('/register', registerUser);

// Email Verification
router.post('/verify-email', verifyEmail);

// @route   GET /api/auth/profile
router.get('/profile', authMiddleware, getProfile);


router.get('/', (req, res) => {
    res.send('Welcome Home!');
});

// Example login route
router.get('/login', (req, res) => {
    res.send('Please log in.');
});

console.log(passport);
router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', 
  passport.authenticate('twitter', {
    failureMessage: true,
    failureRedirect: '/api/auth/'
  }),
  (req, res) => {
    // Redirect to a custom route where you handle the response
    res.redirect(`/api/auth/callback/response`);
  }
);


router.get('/callback/response', (req, res) => {
  // Assuming the user is available in req.user
  if (!req.user) {
    return sendResponse(res, 401, 'error', 'User not authenticated', null);
  }

  // Send a successful response with JWT
  return sendResponse(
    res,
    200,
    'success',
    'User authenticated successfully',
    null,
    req.user.id
  );
});

// Discord Authentication
router.get('/auth/discord', passport.authenticate('discord'));
router.get('/auth/discord/callback', passport.authenticate('discord', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));

module.exports = router;

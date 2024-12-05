// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

  provider: {
    type: String,
    enum: ['discord', 'twitter'],
    required: null,
  },
  providerId: {
    type: String,
    required: null,
    unique: true,
  },

  photo: {
    type: String,
    required: null,
  },

  name: {
    type: String,
    required: null,
  },
  email: {
    type: String,
    // required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: null,
  },
  referral: { type: String },
  referralCode: { type: String, unique: true },
  balance: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

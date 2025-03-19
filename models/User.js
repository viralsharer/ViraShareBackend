// backend/models/User.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({


  photo: {
    type: String
  },

  name: {
    type: String

  },
  email: {
    type: String,
    // required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String

  },
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who referred them
    default: null,
  },
  referralCode: {
    type: String,
    unique: true,
  },
  mainBalance: { type: Number, default: 0 },
  temporaryBalance: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, default: null },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', default: null }, // Reference to Package
  amountPaid: { type: Number, default: 0 }, // Amount paid for the package
  isPaid: { type: Boolean, default: false }, // Payment status
  bankDetails: {
    accountNumber: { type: String },
    bankName: { type: String },
    bankCode: { type: String },
    bvn: { type: String }
  }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.referralCode) {
    this.referralCode = uuidv4().slice(0, 8); // Generate a short unique code
  }
  next();
});

UserSchema.methods.checkForEmptyFields = function () {
  const requiredFields = {
    bankDetails: ['accountNumber', 'bankName', 'bankCode', 'bvn'],
  };

  for (const [section, fields] of Object.entries(requiredFields)) {
    for (const field of fields) {
      if (!this[section] || !this[section][field]) {
        return section; // Return section name if a required field is missing
      }
    }
  }
  return "completed"; 
};

module.exports = mongoose.model('User', UserSchema);

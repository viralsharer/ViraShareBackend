const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true },
  expiryDate: { type: Date },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, });

module.exports = mongoose.model('Coupon', CouponSchema);
// packageId 
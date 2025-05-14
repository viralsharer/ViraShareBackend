const mongoose = require('mongoose');
const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  description: { type: String },
  referalpoint: { type: Number, required: true },
  coupons: [CouponSchema],
  createdAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('Package', PackageSchema);
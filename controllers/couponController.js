
const Coupon = require('../models/Coupon'); 
const Package = require('../models/Package');
const { sendResponse } = require('../utils/responseHelper');

// Create coupon
exports.createCoupon = async (req, res) => {
  const { code, expiryDate, packageId } = req.body;

  if (!code  || !expiryDate || !packageId) {
    return sendResponse(res, 400, 'error', 'All fields are required', null);
  }

  const pkg = await Package.findById(packageId);
  if (!pkg) return sendResponse(res, 404, 'error', 'Package not found', null);

  try {
    const coupons = new Coupon({ code, expiryDate, packageId });
    await coupons.save();
    return sendResponse(res, 201, 'success', 'Coupon created', coupons);
  } catch (err) {
    return sendResponse(res, 500, 'error', err.message, null);
  }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find().populate('packageId', 'name');
  return sendResponse(res, 200, 'success', 'Coupons retrieved', coupons);
};

// Get coupon by code
exports.getCouponByCode = async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code }).populate('packageId', 'name');
  if (!coupon) return sendResponse(res, 404, 'error', 'Coupon not found', null);
  return sendResponse(res, 200, 'success', 'Coupon retrieved', coupon);
};

// Update coupon
exports.updateCoupon = async (req, res) => {
  const coupon = await Coupon.findOneAndUpdate(
    { code: req.params.code },
    req.body,
    { new: true, runValidators: true }
  );
  if (!coupon) return sendResponse(res, 404, 'error', 'Coupon not found', null);
  return sendResponse(res, 200, 'success', 'Coupon updated', coupon);
};

// Change status
exports.changeCouponStatus = async (req, res) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    return sendResponse(res, 400, 'error', 'isActive must be a boolean', null);
  }

  const coupon = await Coupon.findOneAndUpdate(
    { code: req.params.code },
    { isActive },
    { new: true }
  );
  if (!coupon) return sendResponse(res, 404, 'error', 'Coupon not found', null);
  return sendResponse(res, 200, 'success', 'Coupon status updated', coupon);
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findOneAndDelete({ code: req.params.code });
  if (!coupon) return sendResponse(res, 404, 'error', 'Coupon not found', null);
  return sendResponse(res, 200, 'success', 'Coupon deleted', null);
};

// Optional: Validate coupon
exports.validateCoupon = async (req, res) => {
  const { code, packageId } = req.body;
  const now = new Date();

  const coupon = await Coupon.findOne({ code, packageId, isActive: true, expiryDate: { $gte: now } });
  if (!coupon) return sendResponse(res, 400, 'error', 'Invalid or expired coupon', null);

  return sendResponse(res, 200, 'success', 'Coupon valid', coupon);
};

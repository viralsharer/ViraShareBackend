
const Coupon = require('../models/Coupon'); 
const Package = require('../models/Package');
const { sendResponse } = require('../utils/responseHelper');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

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
// exports.validateCoupon = async (req, res) => {
//   const { code, packageId } = req.body;
//   const now = new Date();

//   const coupon = await Coupon.findOne({ code, packageId, isActive: true, expiryDate: { $gte: now } });
//   if (!coupon) return sendResponse(res, 400, 'error', 'Invalid or expired coupon', null);

//   return sendResponse(res, 200, 'success', 'Coupon valid', coupon);
// };

// Validate one-time coupon
exports.validateCoupon = async (req, res) => {
  const { code, packageId, userId } = req.body;
  const now = new Date();

  const coupon = await Coupon.findOne({
    code,
    packageId,
    isActive: true,
    used: false,
    expiryDate: { $gte: now }
  });

  if (!coupon) {
    return sendResponse(res, 400, 'error', 'Invalid, used, or expired coupon', null);
  }

  try {
    coupon.used = true;
    coupon.usedBy = userId || null;
    coupon.usedAt = new Date();
    await coupon.save();

    return sendResponse(res, 200, 'success', 'Coupon validated and marked as used', coupon);
  } catch (err) {
    return sendResponse(res, 500, 'error', 'Failed to mark coupon as used', err);
  }
};

// Generate random codes
const generateCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Bulk create and export coupons
exports.bulkCreateCoupons = async (req, res) => {
  const { quantity, expiryDate, packageId, codePrefix = '' } = req.body;

  if (!quantity || !expiryDate || !packageId) {
    return sendResponse(res, 400, 'error', 'quantity, expiryDate, and packageId are required', null);
  }

  const pkg = await Package.findById(packageId);
  if (!pkg) return sendResponse(res, 404, 'error', 'Package not found', null);

  const coupons = [];
  for (let i = 0; i < quantity; i++) {
    coupons.push({
      code: codePrefix + generateCode(6),
      expiryDate,
      packageId,
      isActive: true,
      used: false,
    });
  }

  

  try {
    const createdCoupons = await Coupon.insertMany(coupons);

    // Prepare CSV
    const fields = ['code', 'expiryDate', 'isActive'];
    const parser = new Parser({ fields });
    const csv = parser.parse(createdCoupons);

    const exportDir = path.join(__dirname, '../exports');
    const filename = `coupons-${Date.now()}.csv`;
    const filePath = path.join(exportDir, filename);

    // const filePath = path.join(__dirname, `../exports/coupons-${Date.now()}.csv`);
    fs.writeFileSync(filePath, csv);

    return sendResponse(res, 201, 'success', 'Coupons created and exported to CSV', {
      createdCount: createdCoupons.length,
      csvPath: filePath
    });
  } catch (err) {
    return sendResponse(res, 500, 'error', 'Failed to create coupons', err);
  }
};


// Export all coupons to CSV
exports.exportCouponsCsv = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .select('code expiryDate isActive packageId')
      .populate('packageId', 'name')
      .lean();

    // Map and flatten data to include package name
    const formattedCoupons = coupons.map(coupon => ({
      code: coupon.code,
      expiryDate: coupon.expiryDate,
      isActive: coupon.isActive,
      packageName: coupon.packageId?.name || 'N/A'
    }));

    const fields = ['code', 'expiryDate', 'isActive', 'packageName'];
    const parser = new Parser({ fields });
    const csv = parser.parse(formattedCoupons);

    res.header('Content-Type', 'text/csv');
    res.attachment(`coupons-export-${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    return sendResponse(res, 500, 'error', 'Failed to export coupons', err);
  }
};
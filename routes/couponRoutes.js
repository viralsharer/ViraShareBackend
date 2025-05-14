const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');

const couponController = require('../controllers/couponController');

router.post('/', adminMiddleware,couponController.createCoupon);
router.get('/', couponController.getAllCoupons);
router.get('/:code', couponController.getCouponByCode);
router.put('/:code',adminMiddleware,couponController.updateCoupon);
router.delete('/:code',adminMiddleware, couponController.deleteCoupon);
router.patch('/:code/status', adminMiddleware,couponController.changeCouponStatus);
router.post('/validate', couponController.validateCoupon);


module.exports = router;

const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const adminMiddleware = require('../middleware/adminMiddleware');


router.post('/', adminMiddleware, packageController.createPackage);
router.get('/', packageController.getPackages);
router.get('/:id', packageController.getPackageById);
router.put('/:id', adminMiddleware, packageController.updatePackage);
router.delete('/:id', adminMiddleware, packageController.deletePackage);

module.exports = router;

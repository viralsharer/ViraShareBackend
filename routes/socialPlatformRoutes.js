// routes/SocialPlatformRoutes.js
const express = require('express');
const router = express.Router();
const socialPlatformController = require('../controllers/socialPlatformController');

router.post('/', socialPlatformController.createSocialPlatform);
router.get('/', socialPlatformController.getSocialPlatforms);
router.get('/:id', socialPlatformController.getSocialPlatformById);
router.put('/:id', socialPlatformController.updateSocialPlatform);
router.delete('/:id', socialPlatformController.deleteSocialPlatform);

module.exports = router;

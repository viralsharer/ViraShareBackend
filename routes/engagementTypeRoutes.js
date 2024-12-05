// routes/engagementTypeRoutes.js
const express = require('express');
const router = express.Router();
const engagementTypeController = require('../controllers/engagementTypeController');
const authMiddleware = require('../middleware/authMiddleware');
router.post('/', engagementTypeController.createEngagementType);
router.get('/', engagementTypeController.getEngagementTypes);
router.get('/:id', engagementTypeController.getEngagementTypeById);
router.put('/:id', engagementTypeController.updateEngagementType);
router.delete('/:id', engagementTypeController.deleteEngagementType);

module.exports = router;

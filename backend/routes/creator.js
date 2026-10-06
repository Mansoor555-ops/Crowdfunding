const express = require('express');
const router = express.Router();
const { 
  getCreatorStats, 
  getCreatorCampaigns, 
  getCreatorBackers, 
  requestPayout, 
  getCreatorPayouts 
} = require('../controllers/creatorController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Require authentication and Creator/Admin role for all creator endpoints
router.use(requireAuth);
router.use(requireRole('creator', 'admin'));

router.get('/stats', getCreatorStats);
router.get('/campaigns', getCreatorCampaigns);
router.get('/backers', getCreatorBackers);
router.post('/payouts', requestPayout);
router.get('/payouts', getCreatorPayouts);

module.exports = router;

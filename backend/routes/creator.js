const express = require('express');
const router = express.Router();
const { 
  getCreatorStats, 
  getCreatorCampaigns, 
  getCreatorBackers, 
  requestPayout, 
  getCreatorPayouts 
} = require('../controllers/creatorController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/stats', getCreatorStats);
router.get('/campaigns', getCreatorCampaigns);
router.get('/backers', getCreatorBackers);
router.post('/payouts', requestPayout);
router.get('/payouts', getCreatorPayouts);

module.exports = router;

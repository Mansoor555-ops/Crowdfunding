const express = require('express');
const router = express.Router();
const { 
  createCampaign, 
  getCampaigns, 
  getCampaignBySlug, 
  updateCampaign, 
  addCampaignUpdate, 
  getCampaignUpdates 
} = require('../controllers/campaignController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, createCampaign);
router.get('/', getCampaigns);
router.get('/:slug', getCampaignBySlug);
router.put('/:id', requireAuth, updateCampaign);

router.post('/:id/updates', requireAuth, addCampaignUpdate);
router.get('/:id/updates', getCampaignUpdates);

module.exports = router;

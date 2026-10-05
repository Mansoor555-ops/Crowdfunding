const express = require('express');
const router = express.Router();
const { 
  createCampaign, 
  getCampaigns, 
  getPlatformStats,
  getCampaignBySlug, 
  updateCampaign, 
  addCampaignUpdate, 
  getCampaignUpdates,
  getCampaignComments,
  addCampaignComment,
  toggleBookmark,
  getUserBookmarks,
  reportCampaign
} = require('../controllers/campaignController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, createCampaign);
router.get('/', getCampaigns);
router.get('/stats', getPlatformStats);
router.get('/bookmarks/my-bookmarks', requireAuth, getUserBookmarks);

router.get('/:slug', getCampaignBySlug);
router.put('/:id', requireAuth, updateCampaign);

router.post('/:id/updates', requireAuth, addCampaignUpdate);
router.get('/:id/updates', getCampaignUpdates);

router.get('/:id/comments', getCampaignComments);
router.post('/:id/comments', requireAuth, addCampaignComment);

router.post('/:id/bookmark', requireAuth, toggleBookmark);
router.post('/:id/report', requireAuth, reportCampaign);

module.exports = router;

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
const { requireAuth, requireRole } = require('../middleware/auth');

// Public endpoints
router.get('/', getCampaigns);
router.get('/stats', getPlatformStats);
router.get('/bookmarks/my-bookmarks', requireAuth, getUserBookmarks);

router.get('/:slug', getCampaignBySlug);
router.get('/:id/updates', getCampaignUpdates);
router.get('/:id/comments', getCampaignComments);

// Restricted to Creator and Admin roles ONLY
router.post('/', requireAuth, requireRole('creator', 'admin'), createCampaign);
router.put('/:id', requireAuth, requireRole('creator', 'admin'), updateCampaign);
router.post('/:id/updates', requireAuth, requireRole('creator', 'admin'), addCampaignUpdate);

// Backer & User interaction endpoints
router.post('/:id/comments', requireAuth, addCampaignComment);
router.post('/:id/bookmark', requireAuth, toggleBookmark);
router.post('/:id/report', requireAuth, reportCampaign);

module.exports = router;

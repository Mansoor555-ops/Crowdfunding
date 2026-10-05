const express = require('express');
const router = express.Router();
const { 
  getAdminStats, 
  getAdminCampaigns, 
  updateCampaignStatus, 
  getAdminUsers, 
  updateUserStatus, 
  getAdminPayments, 
  getAdminPayouts, 
  updatePayoutStatus, 
  getAdminReports, 
  updateReportStatus, 
  getAuditLogs 
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Require authentication and Admin role for all routes
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/stats', getAdminStats);

router.get('/campaigns', getAdminCampaigns);
router.put('/campaigns/:id/status', updateCampaignStatus);

router.get('/users', getAdminUsers);
router.put('/users/:id/status', updateUserStatus);

router.get('/payments', getAdminPayments);

router.get('/payouts', getAdminPayouts);
router.put('/payouts/:id/status', updatePayoutStatus);

router.get('/reports', getAdminReports);
router.put('/reports/:id/status', updateReportStatus);

router.get('/audit-logs', getAuditLogs);

module.exports = router;
